"""
Virale — Simple in-Lambda memory cache with TTL.
Persists across warm Lambda invocations. Automatically expires entries.
"""

import time

# Global cache dict — persists across warm invocations
_cache = {}

DEFAULT_TTL = 60  # 60 seconds


def cache_get(key):
    """
    Retrieve a cached value if it exists and has not expired.
    Returns the cached value, or None if miss/expired.
    """
    entry = _cache.get(key)
    if entry is None:
        return None
    if time.time() > entry["expires_at"]:
        del _cache[key]
        return None
    return entry["value"]


def cache_set(key, value, ttl=DEFAULT_TTL):
    """
    Store a value in the cache with a TTL (in seconds).
    """
    _cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl,
    }


def cache_invalidate(prefix=None):
    """
    Invalidate cache entries. If prefix is given, only invalidate
    keys that start with that prefix. Otherwise, clear all.
    """
    if prefix is None:
        _cache.clear()
    else:
        keys_to_delete = [k for k in _cache if k.startswith(prefix)]
        for k in keys_to_delete:
            del _cache[k]


def make_cache_key(endpoint, params=None):
    """
    Build a deterministic cache key from an endpoint and optional params dict.
    """
    if params:
        sorted_params = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if v)
        return f"{endpoint}?{sorted_params}" if sorted_params else endpoint
    return endpoint
