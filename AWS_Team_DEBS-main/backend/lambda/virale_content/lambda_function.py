"""
Virale — Content Lambda
AI-powered content localisation using Amazon Bedrock.
Endpoints:
  POST /content/adapt           — adapt content for a target market via Bedrock
  GET  /content/{campaignId}    — retrieve past adaptations for a campaign

Bedrock model: Anthropic Claude 3.5 Sonnet (or fallback to rule-based)
Memory: 512 MB | Timeout: 60s
"""

import json
import os
import uuid
import time
from datetime import datetime

import sys
sys.path.insert(0, "/opt/python")

import boto3

from shared.response_builder import success, bad_request, not_found, server_error, options_response
from shared.db_helpers import put_item, query_items, scan_items
from shared.cache import cache_get, cache_set, cache_invalidate, make_cache_key
from boto3.dynamodb.conditions import Key, Attr

# Table for storing adaptations (reusing analytics or a dedicated table)
# We'll store adaptations in the campaigns table as a nested attribute,
# or use a lightweight scan. For simplicity we use a dedicated "adaptations" approach
# stored alongside analytics.
ANALYTICS_TABLE = os.environ.get("ANALYTICS_TABLE", "virale-analytics")
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", os.environ.get("REGION", "us-east-1"))
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-lite-v1:0")

CACHE_TTL = 120  # 2 minutes for content

# Market → language mapping for Indian states
STATE_LANGUAGES = {
    "andhra-pradesh": ("Telugu", "te-IN"),
    "arunachal-pradesh": ("English", "en-IN"),
    "assam": ("Assamese", "as-IN"),
    "bihar": ("Hindi", "hi-IN"),
    "chhattisgarh": ("Hindi", "hi-IN"),
    "goa": ("Konkani", "kok-IN"),
    "gujarat": ("Gujarati", "gu-IN"),
    "haryana": ("Hindi", "hi-IN"),
    "himachal-pradesh": ("Hindi", "hi-IN"),
    "jharkhand": ("Hindi", "hi-IN"),
    "karnataka": ("Kannada", "kn-IN"),
    "kerala": ("Malayalam", "ml-IN"),
    "madhya-pradesh": ("Hindi", "hi-IN"),
    "maharashtra": ("Marathi", "mr-IN"),
    "manipur": ("Meitei", "mni-IN"),
    "meghalaya": ("English", "en-IN"),
    "mizoram": ("Mizo", "lus-IN"),
    "nagaland": ("English", "en-IN"),
    "odisha": ("Odia", "or-IN"),
    "punjab": ("Punjabi", "pa-IN"),
    "rajasthan": ("Hindi", "hi-IN"),
    "sikkim": ("Nepali", "ne-IN"),
    "tamil-nadu": ("Tamil", "ta-IN"),
    "telangana": ("Telugu", "te-IN"),
    "tripura": ("Bengali", "bn-IN"),
    "uttar-pradesh": ("Hindi", "hi-IN"),
    "uttarakhand": ("Hindi", "hi-IN"),
    "west-bengal": ("Bengali", "bn-IN"),
    "jammu-kashmir": ("Urdu", "ur-IN"),
}


def lambda_handler(event, context):
    """Route by HTTP method + path."""
    try:
        http_method = event.get("httpMethod", "GET")
        path = event.get("path", "")
        path_params = event.get("pathParameters") or {}

        if http_method == "OPTIONS":
            return options_response()

        body = {}
        if event.get("body"):
            body = json.loads(event["body"])

        # POST /content/adapt
        if http_method == "POST" and "adapt" in path:
            return handle_adapt_content(body)
            
        # POST /content/align
        if http_method == "POST" and "align" in path:
            return handle_align_trends(body)

        # GET /content/{campaignId}
        campaign_id = path_params.get("id", path_params.get("proxy", ""))
        if http_method == "GET" and campaign_id:
            return handle_get_adaptations(campaign_id)

        return bad_request(f"Unknown content route: {http_method} {path}")

    except json.JSONDecodeError:
        return bad_request("Invalid JSON in request body")
    except Exception as e:
        print(f"Content Lambda error: {e}")
        return server_error(str(e))


def handle_adapt_content(body):
    """Adapt content for a target market using Bedrock or fallback."""
    content = body.get("content", "")
    market = body.get("market", "")
    category = body.get("category", "")
    campaign_id = body.get("campaignId", "")

    if not content:
        return bad_request("Content text is required")
    if not market:
        return bad_request("Target market (state) is required")

    language_name, language_code = STATE_LANGUAGES.get(market, ("Hindi", "hi-IN"))

    # Try Bedrock with retries + exponential backoff
    adapted_content = None
    for attempt in range(3):
        try:
            adapted_content = _invoke_bedrock(content, market, language_name, category)
            break
        except Exception as e:
            print(f"Bedrock attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(2 ** attempt)  # 1s, 2s backoff

    # Fallback: rule-based adaptation
    if not adapted_content:
        adapted_content = _rule_based_adaptation(content, market, language_name)

    adaptation_id = f"adapt-{uuid.uuid4().hex[:8]}"

    result = {
        "id": adaptation_id,
        "originalContent": content,
        "adaptedContent": adapted_content,
        "market": market,
        "language": language_code,
        "category": category,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }

    # Store the adaptation if tied to a campaign
    if campaign_id:
        adaptation_record = {
            "campaignId": campaign_id,
            "date": f"adaptation#{adaptation_id}",
            **result,
        }
        try:
            put_item(ANALYTICS_TABLE, adaptation_record)
        except Exception as e:
            print(f"Failed to store adaptation: {e}")

    return success(result)


def handle_get_adaptations(campaign_id):
    """Retrieve all content adaptations for a campaign."""
    cache_key = make_cache_key("adaptations", {"campaignId": campaign_id})
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    adaptations = query_items(
        ANALYTICS_TABLE,
        Key("campaignId").eq(campaign_id) & Key("date").begins_with("adaptation#"),
    )

    normalised = []
    for a in adaptations:
        normalised.append({
            "id": a.get("id", ""),
            "originalContent": a.get("originalContent", ""),
            "adaptedContent": a.get("adaptedContent", ""),
            "market": a.get("market", ""),
            "language": a.get("language", ""),
        })

    result = {"adaptations": normalised}
    cache_set(cache_key, result, CACHE_TTL)
    return success(result)


def _invoke_bedrock(content, market, language_name, category):
    """Invoke Bedrock Amazon Nova Lite for content localisation."""
    client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)

    prompt = (
        f"You are a marketing content localisation expert for India.\n"
        f"Target Market: {market.replace('-', ' ').title()}\n"
        f"Target Language: {language_name}\n"
        f"Category: {category}\n\n"
        f"Task: Translate, adapt, or process the following input for the target market. Add culturally relevant emojis.\n"
        f"Input:\n{content}\n\n"
        f"Respond with ONLY the generated marketing content, plain text, no conversational filler."
    )

    request_body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "max_new_tokens": 1024
        }
    })

    response = client.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=request_body,
    )

    response_body = json.loads(response["body"].read())
    return response_body["output"]["message"]["content"][0]["text"].strip()

def handle_align_trends(body):
    """Calculate alignment scores for a list of trends against a campaign's goals."""
    goals = body.get("goals", "")
    trends = body.get("trends", [])
    
    if not goals or not trends:
        return bad_request("Both 'goals' and 'trends' arrays are required")
        
    client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
    
    trend_list_str = "\\n".join([f"ID: {t.get('id', '')} | Name: {t.get('name', '')} | Category: {t.get('category', '')}" for t in trends])
    
    prompt = (
        f"You are a marketing AI judging how well certain trends align with a campaign.\n"
        f"Campaign Goals: {goals}\n\n"
        f"Current Market Trends:\n{trend_list_str}\n\n"
        f"Task: Rate each trend's alignment to the campaign goals on a scale of 0 to 100.\n"
        f"Respond ONLY with a valid JSON object where keys are the trend IDs and values are the integer scores (0-100). Do not include any reasoning or markdown block."
    )
    
    request_body = json.dumps({
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "inferenceConfig": {
            "max_new_tokens": 1024
        }
    })
    
    try:
        response = client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=request_body,
        )
        response_body = json.loads(response["body"].read())
        text_output = response_body["output"]["message"]["content"][0]["text"].strip()
        
        # Strip potential markdown formatting from Claude/Nova if it ignored instructions
        if text_output.startswith("```json"):
            text_output = text_output[7:-3].strip()
        elif text_output.startswith("```"):
            text_output = text_output[3:-3].strip()
            
        scores = json.loads(text_output)
        return success({"scores": scores})
    except Exception as e:
        print(f"Alignment calculation failed: {e}")
        # Fallback to returning a default of 50 if it fails
        fallback_scores = {t.get("id"): 50 for t in trends}
        return success({"scores": fallback_scores})


def _rule_based_adaptation(content, market, language_name):
    """
    Simple rule-based fallback when Bedrock is unavailable.
    Adds market-specific prefix and emoji.
    """
    market_emojis = {
        "maharashtra": "🏙️",
        "karnataka": "🌿",
        "tamil-nadu": "🎭",
        "kerala": "🌴",
        "west-bengal": "🎨",
        "gujarat": "🦁",
        "rajasthan": "🏰",
        "punjab": "💪",
        "uttar-pradesh": "🕌",
        "telangana": "💎",
        "andhra-pradesh": "🌾",
        "bihar": "📚",
    }
    emoji = market_emojis.get(market, "🇮🇳")
    state_name = market.replace("-", " ").title()
    return f"{emoji} [{state_name} — {language_name}] {content} {emoji}"
