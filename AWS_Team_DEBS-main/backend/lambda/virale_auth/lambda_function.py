"""
Virale — Auth Lambda
Handles user profile sync after Cognito authentication.
Endpoints:
  POST /auth/signup  — create user profile in DynamoDB
  POST /auth/signin  — sync / return user profile
  GET  /auth/profile — return current user profile
"""

import json
import os
import uuid
import base64
from datetime import datetime

import sys
sys.path.insert(0, "/opt/python")

from shared.response_builder import success, bad_request, not_found, server_error, options_response
from shared.db_helpers import get_item, put_item, query_items
from boto3.dynamodb.conditions import Key

USERS_TABLE = os.environ.get("USERS_TABLE", "virale-users")


def lambda_handler(event, context):
    """Main entry point — route by HTTP method + path."""
    try:
        http_method = event.get("httpMethod", "GET")
        path = event.get("path", "")
        
        # Handle CORS preflight
        if http_method == "OPTIONS":
            return options_response()

        body = {}
        if event.get("body"):
            body = json.loads(event["body"])

        # Extract user info from Cognito authorizer (if present)
        user_sub = _get_user_sub(event)

        if path.endswith("/signup") and http_method == "POST":
            return handle_signup(body, user_sub)
        elif path.endswith("/signin") and http_method == "POST":
            return handle_signin(body, user_sub)
        elif path.endswith("/profile") and http_method == "GET":
            return handle_get_profile(user_sub)
        else:
            return bad_request(f"Unknown auth route: {http_method} {path}")

    except json.JSONDecodeError:
        return bad_request("Invalid JSON in request body")
    except Exception as e:
        print(f"Auth Lambda error: {e}")
        return server_error(str(e))


def _get_user_sub(event):
    """Extract the Cognito user sub from authorizer claims or Authorization header."""
    claims = (event.get("requestContext", {})
              .get("authorizer", {})
              .get("claims", {}))
    if claims.get("sub"):
        return claims.get("sub")
        
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

    return ""


def handle_signup(body, user_sub):
    """Create a new user profile in DynamoDB after Cognito signup."""
    email = body.get("email", "")
    name = body.get("name", "")

    if not email:
        return bad_request("Email is required")

    user_id = user_sub or f"user-{uuid.uuid4().hex[:12]}"

    user_item = {
        "userId": user_id,
        "email": email,
        "name": name,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    }

    put_item(USERS_TABLE, user_item)

    return success({
        "message": "User profile created",
        "user": user_item,
    })


def handle_signin(body, user_sub):
    """
    Sync user profile on signin. If the profile exists, return it.
    If it doesn't exist yet, create one from the Cognito claims.
    """
    email = body.get("email", "")
    name = body.get("name", "")
    user_id = user_sub or body.get("sub", "")

    if not user_id and not email:
        return bad_request("User identifier required")

    # Try to find existing profile
    if user_id:
        existing = get_item(USERS_TABLE, {"userId": user_id})
        if existing:
            return success({"user": existing})

    # Try by email via GSI
    if email:
        results = query_items(
            USERS_TABLE,
            Key("email").eq(email),
            index_name="email-index",
            limit=1,
        )
        if results:
            return success({"user": results[0]})

    # Auto-create profile on first signin
    new_user_id = user_id or f"user-{uuid.uuid4().hex[:12]}"
    user_item = {
        "userId": new_user_id,
        "email": email,
        "name": name or email.split("@")[0],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    }
    put_item(USERS_TABLE, user_item)

    return success({"user": user_item})


def handle_get_profile(user_sub):
    """Return the current user's profile."""
    if not user_sub:
        return bad_request("Authentication required")

    user = get_item(USERS_TABLE, {"userId": user_sub})
    if not user:
        return not_found("User profile not found")

    return success({"user": user})
