"""
Virale — Campaigns Lambda
Full CRUD for marketing campaigns.
Endpoints:
  GET    /campaigns          — list all campaigns for user
  POST   /campaigns          — create new campaign
  GET    /campaigns/{id}     — get single campaign
  PUT    /campaigns/{id}     — update campaign
  DELETE /campaigns/{id}     — delete campaign

Response shape matches frontend expectation:
  { campaigns: [ { id, campaignId, name, campaignName, status, budget, spent, reach, engagement, market, category, goals, createdAt } ] }
"""

import json
import os
import uuid
import base64
from datetime import datetime
from decimal import Decimal

import sys
sys.path.insert(0, "/opt/python")

from shared.response_builder import success, created, bad_request, not_found, server_error, options_response
from shared.db_helpers import get_item, put_item, query_items, update_item, delete_item, scan_items
from shared.cache import cache_get, cache_set, cache_invalidate, make_cache_key
from boto3.dynamodb.conditions import Key

CAMPAIGNS_TABLE = os.environ.get("CAMPAIGNS_TABLE", "virale-campaigns")
CACHE_TTL = 60  # seconds


def lambda_handler(event, context):
    """Route by HTTP method + path."""
    try:
        http_method = event.get("httpMethod", "GET")
        path = event.get("path", "")
        path_params = event.get("pathParameters") or {}
        query_params = event.get("queryStringParameters") or {}

        if http_method == "OPTIONS":
            return options_response()

        user_id = _get_user_id(event)
        campaign_id = path_params.get("id", path_params.get("proxy", ""))

        body = {}
        if event.get("body"):
            body = json.loads(event["body"], parse_float=Decimal)

        if http_method == "GET" and not campaign_id:
            return handle_list_campaigns(user_id, query_params)
        elif http_method == "GET" and campaign_id:
            return handle_get_campaign(user_id, campaign_id)
        elif http_method == "POST":
            return handle_create_campaign(user_id, body)
        elif http_method == "PUT" and campaign_id:
            return handle_update_campaign(user_id, campaign_id, body)
        elif http_method == "DELETE" and campaign_id:
            return handle_delete_campaign(user_id, campaign_id)
        else:
            return bad_request(f"Unknown route: {http_method} {path}")

    except json.JSONDecodeError:
        return bad_request("Invalid JSON in request body")
    except Exception as e:
        print(f"Campaigns Lambda error: {e}")
        return server_error(str(e))


def _get_user_id(event):
    """Extract user ID from Cognito authorizer, Authorization header, or fallback to demo user."""
    # 1. API Gateway Authorizer context
    claims = (event.get("requestContext", {})
              .get("authorizer", {})
              .get("claims", {}))
    if claims.get("sub"):
        return claims.get("sub")
        
    # 2. Manual JWT decode from Authorization header
    headers = event.get("headers", {})
    auth_header = headers.get("Authorization") or headers.get("authorization")
    if auth_header:
        parts = auth_header.split(".")
        if len(parts) == 3:
            try:
                payload_b64 = parts[1]
                payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                payload_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
                payload = json.loads(payload_json)
                if payload.get("sub"):
                    return payload.get("sub")
            except Exception as e:
                print(f"Error decoding JWT manually: {e}")

    # 3. Fallback
    return "demo-user-001"


def handle_list_campaigns(user_id, params):
    """List all campaigns for a user."""
    cache_key = make_cache_key("campaigns", {"userId": user_id, **params})
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    campaigns = query_items(
        CAMPAIGNS_TABLE,
        Key("userId").eq(user_id),
    )

    # Filter by status if requested
    status = params.get("status")
    if status:
        campaigns = [c for c in campaigns if c.get("status") == status]

    result = {"campaigns": campaigns}
    cache_set(cache_key, result, CACHE_TTL)
    return success(result)


def handle_get_campaign(user_id, campaign_id):
    """Get a single campaign by ID."""
    cache_key = make_cache_key("campaign", {"userId": user_id, "id": campaign_id})
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    campaign = get_item(CAMPAIGNS_TABLE, {
        "userId": user_id,
        "campaignId": campaign_id,
    })

    if not campaign:
        return not_found(f"Campaign {campaign_id} not found")

    cache_set(cache_key, campaign, CACHE_TTL)
    return success(campaign)


def handle_create_campaign(user_id, body):
    """Create a new campaign."""
    campaign_name = body.get("campaignName", body.get("name", ""))
    if not campaign_name:
        return bad_request("campaignName is required")

    campaign_id = f"camp-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow().isoformat() + "Z"

    campaign = {
        "userId": user_id,
        "campaignId": campaign_id,
        "id": campaign_id,
        "name": campaign_name,
        "campaignName": campaign_name,
        "status": body.get("status", "draft"),
        "budget": body.get("budget", Decimal("0")),
        "spent": Decimal("0"),
        "reach": Decimal("0"),
        "engagement": Decimal("0"),
        "market": body.get("market", ""),
        "category": body.get("category", ""),
        "goals": body.get("goals", ""),
        "content": body.get("content", ""),
        "selectedInfluencers": body.get("selectedInfluencers", []),
        "createdAt": now,
        "updatedAt": now,
    }

    put_item(CAMPAIGNS_TABLE, campaign)
    cache_invalidate("campaigns")
    return created(campaign)


def handle_update_campaign(user_id, campaign_id, body):
    """Update an existing campaign."""
    existing = get_item(CAMPAIGNS_TABLE, {
        "userId": user_id,
        "campaignId": campaign_id,
    })
    if not existing:
        return not_found(f"Campaign {campaign_id} not found")

    # Fields that the frontend may update
    allowed_fields = [
        "name", "campaignName", "status", "budget", "spent",
        "reach", "engagement", "market", "category", "goals",
        "content", "selectedInfluencers",
    ]
    updates = {}
    for field in allowed_fields:
        if field in body:
            updates[field] = body[field]

    if "name" in updates and "campaignName" not in updates:
        updates["campaignName"] = updates["name"]
    if "campaignName" in updates and "name" not in updates:
        updates["name"] = updates["campaignName"]

    updates["updatedAt"] = datetime.utcnow().isoformat() + "Z"

    updated = update_item(
        CAMPAIGNS_TABLE,
        {"userId": user_id, "campaignId": campaign_id},
        updates,
    )

    cache_invalidate("campaign")
    cache_invalidate("campaigns")
    return success(updated)


def handle_delete_campaign(user_id, campaign_id):
    """Delete a campaign."""
    existing = get_item(CAMPAIGNS_TABLE, {
        "userId": user_id,
        "campaignId": campaign_id,
    })
    if not existing:
        return not_found(f"Campaign {campaign_id} not found")

    delete_item(CAMPAIGNS_TABLE, {
        "userId": user_id,
        "campaignId": campaign_id,
    })

    cache_invalidate("campaign")
    cache_invalidate("campaigns")
    return success({"success": True, "message": f"Campaign {campaign_id} deleted"})
