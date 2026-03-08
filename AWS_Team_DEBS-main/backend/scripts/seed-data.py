#!/usr/bin/env python3
"""
Virale — DynamoDB Seed Data Script

Seeds all 5 DynamoDB tables with realistic data that matches the frontend's
mock data / fallback JSON schemas. Idempotent (uses put_item, which overwrites).

Usage:
    python seed-data.py                  # Seed all tables in ap-south-1
    python seed-data.py --region eu-west-1
    python seed-data.py --dry-run        # Print data without writing

Requires: boto3 (pip install boto3), valid AWS credentials.
"""

import argparse
import json
import sys
from decimal import Decimal

import boto3

# ═══════════════════════════════════════════════════════════════
# SEED DATA — Matches frontend's mockData.js + fallback JSONs
# ═══════════════════════════════════════════════════════════════

DEMO_USER = {
    "userId": "demo-user-001",
    "email": "blank",
    "name": "blank",
    "createdAt": "2024-12-01T00:00:00Z",
    "updatedAt": "2024-12-01T00:00:00Z",
}

USERS = [
    DEMO_USER,
    {
        "userId": "demo-blank",
        "email": "blank",
        "name": "blank",
        "createdAt": "2024-12-01T00:00:00Z",
        "updatedAt": "2024-12-01T00:00:00Z",
    },
]


CAMPAIGNS = [
    {
        "userId": "demo-user-001",
        "campaignId": "camp-001",
        "id": "camp-001",
        "name": "Summer Fitness Launch",
        "campaignName": "Summer Fitness Launch",
        "status": "active",
        "budget": 50000,
        "spent": 35000,
        "reach": 45000,
        "engagement": 8.5,
        "market": "maharashtra",
        "category": "Fitness",
        "goals": "Launch summer fitness campaign targeting urban youth",
        "createdAt": "2024-12-15T10:00:00Z",
        "updatedAt": "2024-12-20T10:00:00Z",
    },
    {
        "userId": "demo-user-001",
        "campaignId": "camp-002",
        "id": "camp-002",
        "name": "Diwali Fashion Week",
        "campaignName": "Diwali Fashion Week",
        "status": "active",
        "budget": 80000,
        "spent": 65000,
        "reach": 120000,
        "engagement": 12.3,
        "market": "karnataka",
        "category": "Fashion",
        "goals": "Promote Diwali fashion collection across Karnataka",
        "createdAt": "2024-12-10T08:00:00Z",
        "updatedAt": "2024-12-18T08:00:00Z",
    },
    {
        "userId": "demo-user-001",
        "campaignId": "camp-003",
        "id": "camp-003",
        "name": "Street Food Discovery",
        "campaignName": "Street Food Discovery",
        "status": "paused",
        "budget": 20000,
        "spent": 12000,
        "reach": 18000,
        "engagement": 6.2,
        "market": "tamil-nadu",
        "category": "Food",
        "goals": "Discover and promote Tamil Nadu street food culture",
        "createdAt": "2024-12-08T14:00:00Z",
        "updatedAt": "2024-12-15T14:00:00Z",
    },
    {
        "userId": "demo-user-001",
        "campaignId": "camp-004",
        "id": "camp-004",
        "name": "Tech Gadget Reviews Q1",
        "campaignName": "Tech Gadget Reviews Q1",
        "status": "draft",
        "budget": 35000,
        "spent": 0,
        "reach": 0,
        "engagement": 0,
        "market": "telangana",
        "category": "Technology",
        "goals": "Review latest tech gadgets for Hyderabad tech community",
        "createdAt": "2024-12-20T14:00:00Z",
        "updatedAt": "2024-12-20T14:00:00Z",
    },
    {
        "userId": "demo-user-001",
        "campaignId": "camp-005",
        "id": "camp-005",
        "name": "Yoga Wellness Series",
        "campaignName": "Yoga Wellness Series",
        "status": "completed",
        "budget": 50000,
        "spent": 50000,
        "reach": 85000,
        "engagement": 10.1,
        "market": "kerala",
        "category": "Health",
        "goals": "Promote yoga and wellness retreats in Kerala",
        "createdAt": "2024-11-01T10:00:00Z",
        "updatedAt": "2024-12-01T10:00:00Z",
    },
]


TRENDS = [
    {
        "state": "maharashtra",
        "trendId": "trend-001",
        "name": "#MumbaiFitness Challenge",
        "badge": "Fitness Trend",
        "alignmentScore": 92,
        "alignmentPercentage": 92,
        "timing": "Hot in Mumbai • 24h peak window",
        "category": "Fitness",
    },
    {
        "state": "karnataka",
        "trendId": "trend-002",
        "name": "#BangaloreGlam Collection",
        "badge": "Fashion Trend",
        "alignmentScore": 88,
        "alignmentPercentage": 88,
        "timing": "Trending in Bangalore • 48h peak",
        "category": "Fashion",
    },
    {
        "state": "tamil-nadu",
        "trendId": "trend-003",
        "name": "#ChennaiStreetFood Discovery",
        "badge": "Food Trend",
        "alignmentScore": 95,
        "alignmentPercentage": 95,
        "timing": "Viral in Chennai • 12h peak",
        "category": "Food",
    },
    {
        "state": "telangana",
        "trendId": "trend-004",
        "name": "#HydTechUnboxing",
        "badge": "Technology Trend",
        "alignmentScore": 78,
        "alignmentPercentage": 78,
        "timing": "Growing in Hyderabad • 72h window",
        "category": "Technology",
    },
    {
        "state": "kerala",
        "trendId": "trend-005",
        "name": "#KeralaYogaEveryday",
        "badge": "Health Trend",
        "alignmentScore": 91,
        "alignmentPercentage": 91,
        "timing": "Surging in Kerala • 36h peak",
        "category": "Health",
    },
    {
        "state": "west-bengal",
        "trendId": "trend-006",
        "name": "#KolkataArtScene",
        "badge": "Entertainment Trend",
        "alignmentScore": 85,
        "alignmentPercentage": 85,
        "timing": "Hot in Kolkata • 24h peak window",
        "category": "Entertainment",
    },
    {
        "state": "gujarat",
        "trendId": "trend-007",
        "name": "#AhmedabadStreetStyle",
        "badge": "Fashion Trend",
        "alignmentScore": 82,
        "alignmentPercentage": 82,
        "timing": "Trending in Ahmedabad • 36h peak",
        "category": "Fashion",
    },
    {
        "state": "rajasthan",
        "trendId": "trend-008",
        "name": "#JaipurBeautyRevolution",
        "badge": "Beauty Trend",
        "alignmentScore": 89,
        "alignmentPercentage": 89,
        "timing": "Growing in Jaipur • 48h window",
        "category": "Beauty",
    },
]


INFLUENCERS = [
    {
        "state": "maharashtra",
        "influencerId": "inf-001",
        "name": "Priya Sharma",
        "handle": "@FitWithPriya",
        "category": "Fitness",
        "followers": 128000,
        "engagementRate": 9.8,
        "engagement": 9.8,
        "imageUrl": None,
        "cost": 22000,
        "niche": "Fitness • Yoga & Wellness",
    },
    {
        "state": "karnataka",
        "influencerId": "inf-002",
        "name": "Ananya Iyer",
        "handle": "@BangaloreStyleIcon",
        "category": "Fashion",
        "followers": 95000,
        "engagementRate": 8.5,
        "engagement": 8.5,
        "imageUrl": None,
        "cost": 15000,
        "niche": "Fashion • Street Style",
    },
    {
        "state": "tamil-nadu",
        "influencerId": "inf-003",
        "name": "Karthik Rajan",
        "handle": "@ChennaiEats",
        "category": "Food",
        "followers": 42000,
        "engagementRate": 15.0,
        "engagement": 15.0,
        "imageUrl": None,
        "cost": 5000,
        "niche": "Food • Street Food Reviews",
    },
    {
        "state": "telangana",
        "influencerId": "inf-004",
        "name": "Rina Deshmukh",
        "handle": "@TechHyderabad",
        "category": "Technology",
        "followers": 65000,
        "engagementRate": 7.2,
        "engagement": 7.2,
        "imageUrl": None,
        "cost": 12000,
        "niche": "Technology • Gadget Reviews",
    },
    {
        "state": "kerala",
        "influencerId": "inf-005",
        "name": "Lakshmi Nair",
        "handle": "@KeralaWellness",
        "category": "Health",
        "followers": 88000,
        "engagementRate": 11.0,
        "engagement": 11.0,
        "imageUrl": None,
        "cost": 18000,
        "niche": "Health • Ayurveda & Yoga",
    },
    {
        "state": "west-bengal",
        "influencerId": "inf-006",
        "name": "Arjun Sen",
        "handle": "@KolkataTravels",
        "category": "Travel",
        "followers": 35000,
        "engagementRate": 11.0,
        "engagement": 11.0,
        "imageUrl": None,
        "cost": 6500,
        "niche": "Travel • City Exploration",
    },
    {
        "state": "rajasthan",
        "influencerId": "inf-007",
        "name": "Meera Kapoor",
        "handle": "@GlowWithMeera",
        "category": "Beauty",
        "followers": 210000,
        "engagementRate": 6.3,
        "engagement": 6.3,
        "imageUrl": None,
        "cost": 35000,
        "niche": "Beauty • Skincare Routines",
    },
    {
        "state": "punjab",
        "influencerId": "inf-008",
        "name": "Gurpreet Singh",
        "handle": "@PunjabiVibes",
        "category": "Entertainment",
        "followers": 78000,
        "engagementRate": 13.5,
        "engagement": 13.5,
        "imageUrl": None,
        "cost": 9000,
        "niche": "Entertainment • Punjabi Culture",
    },
]


ANALYTICS = [
    # Aggregate monthly timeline entries
    {"campaignId": "aggregate", "date": "2024-07", "name": "Jan", "reach": 45000, "engagement": 3200, "conversions": 120},
    {"campaignId": "aggregate", "date": "2024-08", "name": "Feb", "reach": 52000, "engagement": 3800, "conversions": 145},
    {"campaignId": "aggregate", "date": "2024-09", "name": "Mar", "reach": 61000, "engagement": 4500, "conversions": 180},
    {"campaignId": "aggregate", "date": "2024-10", "name": "Apr", "reach": 78000, "engagement": 5200, "conversions": 210},
    {"campaignId": "aggregate", "date": "2024-11", "name": "May", "reach": 95000, "engagement": 6100, "conversions": 260},
    {"campaignId": "aggregate", "date": "2024-12", "name": "Jun", "reach": 125000, "engagement": 8200, "conversions": 340},
    # Per-campaign daily entries for camp-001
    {"campaignId": "camp-001", "date": "2024-12-15", "name": "Day 1", "reach": 2000, "engagement": 120},
    {"campaignId": "camp-001", "date": "2024-12-16", "name": "Day 2", "reach": 3500, "engagement": 210},
    {"campaignId": "camp-001", "date": "2024-12-17", "name": "Day 3", "reach": 5200, "engagement": 340},
    {"campaignId": "camp-001", "date": "2024-12-18", "name": "Day 4", "reach": 7100, "engagement": 480},
    {"campaignId": "camp-001", "date": "2024-12-19", "name": "Day 5", "reach": 8800, "engagement": 590},
    # Per-campaign daily entries for camp-002
    {"campaignId": "camp-002", "date": "2024-12-10", "name": "Day 1", "reach": 5000, "engagement": 350},
    {"campaignId": "camp-002", "date": "2024-12-11", "name": "Day 2", "reach": 12000, "engagement": 780},
    {"campaignId": "camp-002", "date": "2024-12-12", "name": "Day 3", "reach": 22000, "engagement": 1500},
    {"campaignId": "camp-002", "date": "2024-12-13", "name": "Day 4", "reach": 38000, "engagement": 2400},
    {"campaignId": "camp-002", "date": "2024-12-14", "name": "Day 5", "reach": 52000, "engagement": 3200},
]


# ═══════════════════════════════════════════════════════════════
# SEEDING LOGIC
# ═══════════════════════════════════════════════════════════════

def convert_floats(obj):
    """Recursively convert floats to Decimals for DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: convert_floats(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_floats(i) for i in obj]
    return obj


def seed_table(dynamodb, table_name, items, dry_run=False):
    """Seed a table with a list of items."""
    table = dynamodb.Table(table_name)
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Seeding {table_name} ({len(items)} items)...")

    for item in items:
        clean_item = convert_floats(item)
        # Remove None values — DynamoDB doesn't support them
        clean_item = {k: v for k, v in clean_item.items() if v is not None}

        if dry_run:
            print(f"  → Would write: {json.dumps(item, default=str)[:120]}...")
        else:
            table.put_item(Item=clean_item)
            key_fields = list(clean_item.keys())[:2]
            key_values = [str(clean_item[k]) for k in key_fields]
            print(f"  ✓ {' | '.join(key_values)}")

    print(f"  {'Would seed' if dry_run else 'Seeded'} {len(items)} items into {table_name}")


def main():
    parser = argparse.ArgumentParser(description="Seed Virale DynamoDB tables")
    parser.add_argument("--region", default="ap-south-1", help="AWS region")
    parser.add_argument("--dry-run", action="store_true", help="Print data without writing")
    args = parser.parse_args()

    print(f"{'=' * 60}")
    print(f"  Virale — DynamoDB Seed Script")
    print(f"  Region: {args.region}")
    print(f"  Mode:   {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"{'=' * 60}")

    dynamodb = boto3.resource("dynamodb", region_name=args.region)

    seed_table(dynamodb, "virale-users",       USERS,       args.dry_run)
    seed_table(dynamodb, "virale-campaigns",   CAMPAIGNS,   args.dry_run)
    seed_table(dynamodb, "virale-trends",      TRENDS,      args.dry_run)
    seed_table(dynamodb, "virale-influencers", INFLUENCERS, args.dry_run)
    seed_table(dynamodb, "virale-analytics",   ANALYTICS,   args.dry_run)

    print(f"\n{'=' * 60}")
    print(f"  {'DRY RUN complete!' if args.dry_run else 'All tables seeded successfully! ✓'}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
