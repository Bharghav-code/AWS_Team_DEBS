"""
Virale — Influencers Lambda
Read-only endpoints for influencer marketplace.
Endpoints:
  GET /influencers          — list influencers, optional ?market=
  GET /influencers/{id}     — get single influencer

Response shape:
  { influencers: [ { id, handle, cost, followers, engagement, niche, market } ] }
"""

import json
import os

import sys
sys.path.insert(0, "/opt/python")

from shared.response_builder import success, bad_request, not_found, server_error, options_response
from shared.db_helpers import scan_items, query_items
from shared.cache import cache_get, cache_set, make_cache_key
from boto3.dynamodb.conditions import Key, Attr

INFLUENCERS_TABLE = os.environ.get("INFLUENCERS_TABLE", "virale-influencers")
CACHE_TTL = 60  # seconds


def lambda_handler(event, context):
    """Route by HTTP method + path."""
    try:
        http_method = event.get("httpMethod", "GET")
        path_params = event.get("pathParameters") or {}
        query_params = event.get("queryStringParameters") or {}

        if http_method == "OPTIONS":
            return options_response()

        if http_method != "GET":
            return bad_request("Only GET is supported for influencers")

        influencer_id = path_params.get("id", path_params.get("proxy", ""))

        if influencer_id:
            return handle_get_influencer(influencer_id)
        else:
            return handle_list_influencers(query_params)

    except Exception as e:
        print(f"Influencers Lambda error: {e}")
        return server_error(str(e))


def handle_list_influencers(params):
    """List influencers with optional market filtering."""
    cache_key = make_cache_key("influencers", params)
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    market = params.get("market", "")

    if market:
        # Query by partition key (state)
        influencers = query_items(
            INFLUENCERS_TABLE,
            Key("state").eq(market),
        )
    else:
        # Full scan — all influencers
        influencers = scan_items(INFLUENCERS_TABLE, limit=100)

    # Normalise field names for frontend
    normalised = []
    for inf in influencers:
        normalised.append({
            "id": inf.get("influencerId", inf.get("id", "")),
            "handle": inf.get("handle", ""),
            "name": inf.get("name", ""),
            "cost": inf.get("cost", 0),
            "followers": inf.get("followers", 0),
            "engagement": inf.get("engagement", inf.get("engagementRate", 0)),
            "engagementRate": inf.get("engagementRate", inf.get("engagement", 0)),
            "niche": inf.get("niche", ""),
            "category": inf.get("category", ""),
            "market": inf.get("state", inf.get("market", "")),
            "imageUrl": inf.get("imageUrl", None),
        })

    result = {"influencers": normalised}
    cache_set(cache_key, result, CACHE_TTL)
    return success(result)


def handle_get_influencer(influencer_id):
    """Get a single influencer by ID."""
    cache_key = make_cache_key("influencer", {"id": influencer_id})
    cached = cache_get(cache_key)
    if cached:
        return success(cached)

    # Scan since we don't have the partition key (state)
    influencers = scan_items(
        INFLUENCERS_TABLE,
        filter_expression=Attr("influencerId").eq(influencer_id),
        limit=1,
    )

    if not influencers:
        return not_found(f"Influencer {influencer_id} not found")

    inf = influencers[0]
    result = {
        "id": inf.get("influencerId", inf.get("id", "")),
        "handle": inf.get("handle", ""),
        "name": inf.get("name", ""),
        "cost": inf.get("cost", 0),
        "followers": inf.get("followers", 0),
        "engagement": inf.get("engagement", inf.get("engagementRate", 0)),
        "engagementRate": inf.get("engagementRate", inf.get("engagement", 0)),
        "niche": inf.get("niche", ""),
        "category": inf.get("category", ""),
        "market": inf.get("state", inf.get("market", "")),
        "imageUrl": inf.get("imageUrl", None),
    }

    cache_set(cache_key, result, CACHE_TTL)
    return success(result)
