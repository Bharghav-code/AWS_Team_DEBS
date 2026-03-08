"""
Virale — Trends Lambda
Read-only endpoints for trend discovery.
Endpoints:
  GET /trends           — list trends, optional ?market=&category=
  GET /trends/{id}      — get single trend

Response shape:
  { trends: [ { id, name, badge, alignmentPercentage, timing, category, market } ] }
"""

import json
import os

import sys
sys.path.insert(0, "/opt/python")

from shared.response_builder import success, bad_request, not_found, server_error, options_response
from shared.db_helpers import scan_items, get_item, query_items
from shared.cache import cache_get, cache_set, make_cache_key
from boto3.dynamodb.conditions import Key, Attr

TRENDS_TABLE = os.environ.get("TRENDS_TABLE", "virale-trends")
CACHE_TTL = 60  # seconds — trends are read-heavy


def lambda_handler(event, context):
    """Route by HTTP method + path."""
    try:
        http_method = event.get("httpMethod", "GET")
        path_params = event.get("pathParameters") or {}
        query_params = event.get("queryStringParameters") or {}

        if http_method == "OPTIONS":
            return options_response()

        if http_method != "GET":
            return bad_request("Only GET is supported for trends")

        trend_id = path_params.get("id", path_params.get("proxy", ""))

        if trend_id:
            return handle_get_trend(trend_id, query_params)
        else:
            return handle_list_trends(query_params)

    except Exception as e:
        print(f"Trends Lambda error: {e}")
        return server_error(str(e))


def handle_list_trends(params):
    """List trends with optional market and category filtering."""
    cache_key = make_cache_key("trends", params)
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    market = params.get("market", "")
    category = params.get("category", "")

    if market:
        # Query by partition key (state)
        key_condition = Key("state").eq(market)
        if category:
            trends = query_items(
                TRENDS_TABLE,
                key_condition,
                filter_expression=Attr("category").eq(category),
            )
        else:
            trends = query_items(TRENDS_TABLE, key_condition)
    elif category:
        # Use category GSI
        trends = query_items(
            TRENDS_TABLE,
            Key("category").eq(category),
            index_name="category-index",
        )
    else:
        # Full scan — all trends
        trends = scan_items(TRENDS_TABLE, limit=50)

    # Normalise field names for frontend
    normalised = []
    for t in trends:
        normalised.append({
            "id": t.get("trendId", t.get("id", "")),
            "name": t.get("name", ""),
            "badge": t.get("badge", ""),
            "alignmentPercentage": t.get("alignmentPercentage", t.get("alignmentScore", 0)),
            "timing": t.get("timing", ""),
            "category": t.get("category", ""),
            "market": t.get("state", t.get("market", "")),
        })

    result = {"trends": normalised}
    cache_set(cache_key, result, CACHE_TTL)
    return success(result)


def handle_get_trend(trend_id, params):
    """Get a single trend by ID."""
    cache_key = make_cache_key("trend", {"id": trend_id})
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    # Trend ID doesn't contain the state, so we need to scan
    trends = scan_items(
        TRENDS_TABLE,
        filter_expression=Attr("trendId").eq(trend_id),
        limit=1,
    )

    if not trends:
        return not_found(f"Trend {trend_id} not found")

    t = trends[0]
    trend = {
        "id": t.get("trendId", t.get("id", "")),
        "name": t.get("name", ""),
        "badge": t.get("badge", ""),
        "alignmentPercentage": t.get("alignmentPercentage", t.get("alignmentScore", 0)),
        "timing": t.get("timing", ""),
        "category": t.get("category", ""),
        "market": t.get("state", t.get("market", "")),
    }

    cache_set(cache_key, trend, CACHE_TTL)
    return success(trend)
