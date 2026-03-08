"""
Virale — Shared response builder for Lambda functions.
Provides CORS-enabled, consistent JSON responses.
"""

import json
import decimal


class DecimalEncoder(json.JSONEncoder):
    """Handle DynamoDB Decimal types in JSON serialization."""

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
}


def success(body, status_code=200):
    """Return a successful JSON response."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def created(body):
    """Return a 201 Created response."""
    return success(body, status_code=201)


def bad_request(message="Bad request"):
    """Return a 400 Bad Request response."""
    return {
        "statusCode": 400,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }


def not_found(message="Resource not found"):
    """Return a 404 Not Found response."""
    return {
        "statusCode": 404,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }


def server_error(message="Internal server error"):
    """Return a 500 Internal Server Error response."""
    return {
        "statusCode": 500,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }


def options_response():
    """Return a 200 response for CORS preflight OPTIONS requests."""
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": "",
    }
