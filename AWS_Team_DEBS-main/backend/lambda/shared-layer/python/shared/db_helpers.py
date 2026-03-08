"""
Virale — DynamoDB helper functions.
Centralises all database interactions with consistent error handling.
"""

import os
import boto3
from boto3.dynamodb.conditions import Key, Attr

# Re-use client across warm invocations
_dynamodb = None


def _get_resource():
    """Lazy-initialise the DynamoDB resource (singleton)."""
    global _dynamodb
    if _dynamodb is None:
        region = os.environ.get("REGION", "ap-south-1")
        _dynamodb = boto3.resource("dynamodb", region_name=region)
    return _dynamodb


def get_table(table_name):
    """Return a DynamoDB Table object by name."""
    return _get_resource().Table(table_name)


# ── Read operations ─────────────────────────────────────────────

def get_item(table_name, key):
    """
    Get a single item by its primary key.
    Returns the item dict, or None if not found.
    """
    table = get_table(table_name)
    response = table.get_item(Key=key)
    return response.get("Item")


def query_items(table_name, key_condition, index_name=None, limit=None,
                scan_forward=True, filter_expression=None):
    """
    Query items from a table or GSI.
    key_condition: a boto3 Key condition expression.
    Returns a list of items.
    """
    table = get_table(table_name)
    kwargs = {
        "KeyConditionExpression": key_condition,
        "ScanIndexForward": scan_forward,
    }
    if index_name:
        kwargs["IndexName"] = index_name
    if limit:
        kwargs["Limit"] = limit
    if filter_expression:
        kwargs["FilterExpression"] = filter_expression

    items = []
    while True:
        response = table.query(**kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key or (limit and len(items) >= limit):
            break
        kwargs["ExclusiveStartKey"] = last_key

    return items[:limit] if limit else items


def scan_items(table_name, filter_expression=None, limit=None):
    """
    Scan an entire table with an optional filter.
    Use sparingly — prefer query_items with a GSI for production loads.
    """
    table = get_table(table_name)
    kwargs = {}
    if filter_expression:
        kwargs["FilterExpression"] = filter_expression
    if limit:
        kwargs["Limit"] = limit

    items = []
    while True:
        response = table.scan(**kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key or (limit and len(items) >= limit):
            break
        kwargs["ExclusiveStartKey"] = last_key

    return items[:limit] if limit else items


# ── Write operations ────────────────────────────────────────────

def put_item(table_name, item):
    """
    Put (create or overwrite) an item.
    Returns the item that was written.
    """
    table = get_table(table_name)
    table.put_item(Item=item)
    return item


def update_item(table_name, key, updates):
    """
    Partially update an item.
    updates: dict of {attribute_name: new_value}.
    Returns the full updated item.
    """
    if not updates:
        return get_item(table_name, key)

    table = get_table(table_name)

    expr_parts = []
    expr_names = {}
    expr_values = {}

    for i, (attr, val) in enumerate(updates.items()):
        placeholder_name = f"#attr{i}"
        placeholder_value = f":val{i}"
        expr_parts.append(f"{placeholder_name} = {placeholder_value}")
        expr_names[placeholder_name] = attr
        expr_values[placeholder_value] = val

    update_expression = "SET " + ", ".join(expr_parts)

    response = table.update_item(
        Key=key,
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
        ReturnValues="ALL_NEW",
    )
    return response.get("Attributes")


def delete_item(table_name, key):
    """
    Delete an item by primary key.
    Returns True.
    """
    table = get_table(table_name)
    table.delete_item(Key=key)
    return True
