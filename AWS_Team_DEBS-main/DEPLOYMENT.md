# 🚀 Virale — Production Deployment Guide

> **Complete, step-by-step guide for deploying the Virale influencer marketing platform on AWS.** Covers infrastructure, backend, frontend, caching, monitoring, and verification. Designed for a new engineer to follow end-to-end.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Architecture Overview](#2-architecture-overview)
3. [Environment Setup](#3-environment-setup)
4. [Infrastructure Deployment](#4-infrastructure-deployment)
5. [Database & Seeding](#5-database--seeding)
6. [Backend Deployment](#6-backend-deployment)
7. [Frontend Deployment](#7-frontend-deployment)
8. [Caching & Fallback Architecture](#8-caching--fallback-architecture)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Rollback Instructions](#10-rollback-instructions)
11. [Post-Deployment Verification Checklist](#11-post-deployment-verification-checklist)
12. [Common Failure Scenarios & Fixes](#12-common-failure-scenarios--fixes)

---

## 1. Prerequisites

### AWS Account Setup

| Requirement | Detail |
|------------|--------|
| AWS Account | Active account with admin access |
| IAM User | Programmatic access with `AdministratorAccess` (or scoped policy below) |
| AWS Region | `us-east-1` (required for Bedrock model availability) |
| Bedrock Access | Request access to **Claude 3.5 Sonnet** via console |

### Required CLI Tools & Versions

```bash
# Verify all tools are installed
node --version          # ≥ 20.x
npm --version           # ≥ 10.x
python3 --version       # ≥ 3.12
pip3 --version          # ≥ 23.x
aws --version           # ≥ 2.x
npx serverless --version # ≥ 3.x

# Install Serverless Framework globally (if not installed)
npm install -g serverless@3

# Configure AWS CLI
aws configure
  # AWS Access Key ID: <your-key>
  # AWS Secret Access Key: <your-secret>
  # Default region: ap-south-1
  # Default output format: json

# Verify AWS identity
aws sts get-caller-identity
```

### Minimum IAM Policy for Deployment

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "s3:*",
        "iam:*",
        "cognito-idp:*",
        "logs:*",
        "cloudfront:*",
        "bedrock:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                              │
│  ┌──────────────────┐    ┌───────────────────────────────────────┐  │
│  │ S3 Static Site   │    │ API Gateway (REST, /v1)               │  │
│  │ (React SPA)      │    │  ├─ /auth/{proxy+}     → Lambda auth │  │
│  │                  │    │  ├─ /campaigns          → Lambda camp │  │
│  │ Fallback JSONs:  │    │  ├─ /campaigns/{id}     → Lambda camp │  │
│  │ /data/fallback-* │    │  ├─ /trends             → Lambda trend│  │
│  │                  │    │  ├─ /trends/{id}         → Lambda trend│  │
│  │                  │    │  ├─ /influencers         → Lambda inf  │  │
│  │                  │    │  ├─ /influencers/{id}    → Lambda inf  │  │
│  │                  │    │  ├─ /content/adapt       → Lambda cont │  │
│  │                  │    │  ├─ /content/{id}        → Lambda cont │  │
│  │                  │    │  ├─ /analytics           → Lambda anal │  │
│  │                  │    │  ├─ /analytics/export    → Lambda anal │  │
│  │                  │    │  └─ /analytics/{id}      → Lambda anal │  │
│  └──────────────────┘    └───────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────┐    ┌──────────────┐   ┌──────────┐
            │ DynamoDB  │    │ Cognito      │   │ Bedrock  │
            │ 5 tables  │    │ User Pool    │   │ Claude   │
            └──────────┘    └──────────────┘   └──────────┘
```

### DynamoDB Tables

| Table | Partition Key | Sort Key | GSIs |
|-------|--------------|----------|------|
| `virale-users` | `userId` (S) | — | `email-index` |
| `virale-campaigns` | `userId` (S) | `campaignId` (S) | `status-index` |
| `virale-trends` | `state` (S) | `trendId` (S) | `category-index` |
| `virale-influencers` | `state` (S) | `influencerId` (S) | `cost-index`, `niche-index` |
| `virale-analytics` | `campaignId` (S) | `date` (S) | — |

---

## 3. Environment Setup

### 3.1 Clone & Install

```bash
cd AWS_Team_DEBS-main

# Frontend dependencies
npm install

# Backend dependencies (Serverless Framework)
cd backend
npm init -y
npm install serverless@3 --save-dev
cd ..
```

### 3.2 Frontend `.env` File

Create `/.env` in the project root:

```env
VITE_API_URL=https://<API_ID>.execute-api.ap-south-1.amazonaws.com/v1
VITE_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_REGION=ap-south-1
```

> **Note:** Leave these as placeholders initially. The Serverless deployment will output the API URL. Cognito values come from Step 4.1.

### 3.3 Secrets Management

| Secret | Storage | Access |
|--------|---------|--------|
| AWS Access Keys | `~/.aws/credentials` | AWS CLI |
| Cognito IDs | `.env` (frontend) + Lambda env vars | Build-time / runtime |
| API Gateway URL | `.env` (frontend) | Build-time |

**Production recommendation:** Use AWS Systems Manager Parameter Store or Secrets Manager for Lambda environment variables instead of hardcoding in `serverless.yml`.

---

## 4. Infrastructure Deployment

### Deployment Order (Dependencies)

```
Step 4.1: Cognito User Pool       ← No dependencies
Step 4.2: Backend (Serverless)    ← Creates DynamoDB, Lambda, API GW
Step 4.3: Seed Data               ← Requires DynamoDB tables
Step 4.4: Bedrock Model Access    ← Console action
Step 4.5: Frontend Build & S3     ← Requires API URL
Step 4.6: CloudFront CDN          ← Requires S3, API GW
```

### 4.1 Create Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name virale-users \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }' \
  --schema '[
    {"Name":"email","Required":true,"Mutable":true},
    {"Name":"name","Required":true,"Mutable":true}
  ]' \
  --region ap-south-1

# 📝 SAVE the UserPoolId from output (e.g., ap-south-1_AbCdEfG)
```

```bash
# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name virale-web \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --supported-identity-providers COGNITO \
  --region ap-south-1

# 📝 SAVE the ClientId from output
```

### 4.2 Deploy Backend via Serverless Framework

```bash
cd backend

# Set Cognito env vars for serverless
export COGNITO_USER_POOL_ID=<your-pool-id>
export COGNITO_CLIENT_ID=<your-client-id>

# Deploy (creates DynamoDB tables, Lambdas, API Gateway)
npx serverless deploy --stage v1 --region ap-south-1

# 📝 SAVE the API endpoint URL from output
# e.g., https://abc123xyz.execute-api.ap-south-1.amazonaws.com/v1
```

### 4.3 Seed DynamoDB Tables

```bash
# Install boto3 if needed
pip3 install boto3

# Run seed script
python3 scripts/seed-data.py --region ap-south-1

# Verify seed data
aws dynamodb scan --table-name virale-trends --region ap-south-1 --select COUNT
aws dynamodb scan --table-name virale-influencers --region ap-south-1 --select COUNT
```

### 4.4 Enable Bedrock Model Access

1. Go to **AWS Console → Amazon Bedrock → Model access**
2. Click **"Manage model access"**
3. Enable:
   - ✅ **Anthropic Claude 3.5 Sonnet** (`anthropic.claude-3-5-sonnet-20241022-v2:0`)
4. Accept terms and submit (usually instant approval)

### 4.5 Build & Deploy Frontend to S3

```bash
# Return to project root
cd ..

# Update .env with real values from Steps 4.1 and 4.2
# Then build:
npm run build

# Create S3 bucket
aws s3 mb s3://virale-app-<unique-suffix> --region ap-south-1

# Enable static hosting
aws s3 website s3://virale-app-<unique-suffix> \
  --index-document index.html \
  --error-document index.html

# Upload (assets with long cache, index.html with no-cache)
aws s3 sync dist/ s3://virale-app-<unique-suffix>/ \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html" \
  --exclude "data/*"

aws s3 cp dist/index.html s3://virale-app-<unique-suffix>/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# Upload fallback data with short cache
aws s3 sync dist/data/ s3://virale-app-<unique-suffix>/data/ \
  --cache-control "max-age=300"
```

### 4.6 CloudFront Distribution

```bash
# Create OAI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference=virale-oai,Comment="Virale OAI"

# 📝 SAVE the OAI ID

# Set S3 bucket policy for CloudFront
cat > /tmp/bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "CloudFrontAccess",
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAI_ID>"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::virale-app-<unique-suffix>/*"
  }]
}
EOF

aws s3api put-bucket-policy \
  --bucket virale-app-<unique-suffix> \
  --policy file:///tmp/bucket-policy.json

# Create CloudFront distribution (see AWS_DEPLOYMENT.md for full config)
# Distribution should have:
#   - S3 origin for static files (default behavior)
#   - API Gateway origin for /v1/* paths (cache behavior)
#   - Custom error response: 404 → /index.html (for SPA routing)
```

---

## 5. Database & Seeding

### Table Creation

Tables are created automatically by the Serverless Framework deployment (Step 4.2). The `serverless.yml` defines all 5 tables under the `resources` section with:

- **PAY_PER_REQUEST** billing (no provisioned capacity needed)
- All required GSIs for efficient queries
- Proper attribute definitions and key schemas

### Manual Table Creation (if not using Serverless)

See `AWS_DEPLOYMENT (1).md` for raw `aws dynamodb create-table` commands.

### Seed Data

```bash
# Full seed (live write to DynamoDB)
python3 backend/scripts/seed-data.py --region ap-south-1

# Dry run (preview only)
python3 backend/scripts/seed-data.py --region ap-south-1 --dry-run
```

**Seeded data includes:**

| Table | Records | Description |
|-------|---------|-------------|
| `virale-users` | 2 | Demo user (`divisha`) |
| `virale-campaigns` | 5 | Active, paused, draft, completed campaigns |
| `virale-trends` | 8 | Across 8 Indian states, 6 categories |
| `virale-influencers` | 8 | Across 8 states, all categories |
| `virale-analytics` | 16 | 6 aggregate months + 10 daily entries |

---

## 6. Backend Deployment

### Lambda Functions

| Function | Path | Memory | Timeout | Description |
|----------|------|--------|---------|-------------|
| `virale-auth` | `/auth/{proxy+}` | 256 MB | 30s | User profile sync |
| `virale-campaigns` | `/campaigns`, `/campaigns/{id}` | 256 MB | 30s | Campaign CRUD |
| `virale-trends` | `/trends`, `/trends/{id}` | 256 MB | 30s | Trend discovery |
| `virale-influencers` | `/influencers`, `/influencers/{id}` | 256 MB | 30s | Influencer marketplace |
| `virale-content` | `/content/adapt`, `/content/{id}` | **512 MB** | **60s** | Bedrock AI content adaptation |
| `virale-analytics` | `/analytics`, `/analytics/{id}`, `/analytics/export` | 256 MB | 30s | Analytics + export |

### Updating a Single Lambda

```bash
cd backend
# Redeploy just one function
npx serverless deploy function --function trends --stage v1

# Or redeploy all
npx serverless deploy --stage v1
```

### Viewing Lambda Logs

```bash
npx serverless logs --function trends --stage v1 --tail
```

---

## 7. Frontend Deployment

### Build

```bash
# Ensure .env has correct values
cat .env
# VITE_API_URL=https://<API_ID>.execute-api.ap-south-1.amazonaws.com/v1
# VITE_COGNITO_USER_POOL_ID=<from Step 4.1>
# VITE_COGNITO_CLIENT_ID=<from Step 4.1>
# VITE_REGION=ap-south-1

npm run build
```

### Upload to S3

```bash
aws s3 sync dist/ s3://virale-app-<suffix>/ --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html" --exclude "data/*"

aws s3 cp dist/index.html s3://virale-app-<suffix>/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

aws s3 sync dist/data/ s3://virale-app-<suffix>/data/ \
  --cache-control "max-age=300"
```

### Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

### CDN Configuration

- **Static assets (JS/CSS):** Cache 1 year (`max-age=31536000`) — Vite uses content hashes
- **`index.html`:** No cache — always fetch latest
- **Fallback JSONs:** 5 min cache (`max-age=300`)
- **API responses:** Not cached at CDN level (passed through to Lambda)
- **SPA routing:** Custom error 404 → `/index.html` with 200 status

---

## 8. Caching & Fallback Architecture

### Cache Layers

```
┌────────────────────────────────────────────────────────────────┐
│ Layer 1: TanStack Query (Frontend)                             │
│   Stale time: 5 minutes   │   GC time: 10 minutes             │
│   Retries: 2              │   Refetch on focus: off            │
├────────────────────────────────────────────────────────────────┤
│ Layer 2: In-Lambda Memory Cache (Backend)                      │
│   Trends/Influencers: 60s TTL                                  │
│   Analytics: 120s TTL                                          │
│   Campaigns: 60s TTL (invalidated on write)                    │
├────────────────────────────────────────────────────────────────┤
│ Layer 3: CloudFront CDN (Edge)                                 │
│   Static assets: 1 year   │   index.html: no-cache            │
│   Fallback JSONs: 5 min   │   API calls: pass-through         │
├────────────────────────────────────────────────────────────────┤
│ Layer 4: Static Fallback JSONs (Frontend)                      │
│   /data/fallback-trends.json                                   │
│   /data/fallback-influencers.json                              │
│   /data/fallback-campaigns.json                                │
│   /data/fallback-analytics.json                                │
│   /data/fallback-adaptations.json                              │
└────────────────────────────────────────────────────────────────┘
```

### TTL Strategy

| Resource | Frontend Cache | Lambda Cache | CDN Cache |
|----------|---------------|-------------|-----------|
| Trends | 5 min (stale) | 60s (memory) | Pass-through |
| Influencers | 5 min | 60s | Pass-through |
| Campaigns | 5 min | 60s (invalidated) | Pass-through |
| Analytics | 5 min | 120s | Pass-through |
| Content | No query cache | 120s | Pass-through |

### Cache Invalidation

- **On write (POST/PUT/DELETE):** Lambda clears its in-memory cache (prefix-based invalidation)
- **On mutation success:** TanStack Query's `invalidateQueries()` clears frontend cache
- **On deploy:** CloudFront invalidation clears edge cache

### Failure Handling Strategy

```
API Request Flow:
  Frontend → API Gateway → Lambda → DynamoDB
       ↓ (failure at any point)
  1. TanStack Query retries (2x)
  2. API client retries (3x with 5s timeout each)
  3. If Bedrock fails → Rule-based content adaptation
  4. If Lambda errors → Return structured error JSON
  5. If all retries fail → Serve static fallback JSON
  6. Write failures → Queue in localStorage, retry later
```

**Bedrock-specific resilience:**
- 3 retries with exponential backoff (1s → 2s → 4s)
- Falls back to rule-based adaptation with market-specific emoji and language label
- Content Lambda has 512 MB memory and 60s timeout to handle Bedrock latency

---

## 9. Monitoring & Observability

### CloudWatch Metrics to Watch

| Metric | Alarm Threshold | Description |
|--------|----------------|-------------|
| Lambda `Errors` | > 5 in 5 min | Function execution failures |
| Lambda `Duration` | > 10s (avg) | Slow response times |
| Lambda `Throttles` | > 0 | Concurrency limits hit |
| API Gateway `5XXError` | > 1% | Backend error rate |
| API Gateway `4XXError` | > 10% | Client error rate |
| API Gateway `Latency` | > 3000ms (p99) | API response latency |
| DynamoDB `ThrottledRequests` | > 0 | Capacity exceeded |

### Log Groups to Monitor

```bash
# Tail logs for each function
aws logs tail /aws/lambda/virale-backend-v1-auth --follow
aws logs tail /aws/lambda/virale-backend-v1-campaigns --follow
aws logs tail /aws/lambda/virale-backend-v1-trends --follow
aws logs tail /aws/lambda/virale-backend-v1-influencers --follow
aws logs tail /aws/lambda/virale-backend-v1-content --follow
aws logs tail /aws/lambda/virale-backend-v1-analytics --follow

# Or use Serverless Framework
npx serverless logs --function content --stage v1 --tail
```

### Recommended CloudWatch Alarms

```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name virale-lambda-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=virale-backend-v1-content \
  --alarm-actions <SNS_TOPIC_ARN> \
  --region ap-south-1
```

---

## 10. Rollback Instructions

### Backend Rollback

```bash
cd backend

# List previous deployments
npx serverless deploy list --stage v1

# Roll back to previous version
npx serverless rollback --timestamp <TIMESTAMP> --stage v1

# Or roll back a single function
npx serverless rollback function --function trends --timestamp <TIMESTAMP>
```

### Frontend Rollback

```bash
# S3 versioning should be enabled for rollbacks
aws s3api put-bucket-versioning \
  --bucket virale-app-<suffix> \
  --versioning-configuration Status=Enabled

# To rollback: re-deploy the previous dist/ folder
# Keep a local archive of each release
```

### DynamoDB Rollback

DynamoDB tables use on-demand billing and don't need capacity rollbacks. For data rollbacks:

```bash
# Enable Point-in-Time Recovery
aws dynamodb update-continuous-backups \
  --table-name virale-campaigns \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Full Stack Teardown (Emergency)

```bash
cd backend
npx serverless remove --stage v1

# This removes: Lambda functions, API Gateway, DynamoDB tables, IAM roles
# Does NOT remove: S3 bucket, CloudFront, Cognito
```

---

## 11. Post-Deployment Verification Checklist

### API Health Checks

```bash
API_URL="https://<API_ID>.execute-api.ap-south-1.amazonaws.com/v1"

# 1. Trends endpoint
curl -s "$API_URL/trends" | python3 -m json.tool | head -20

# 2. Influencers endpoint
curl -s "$API_URL/influencers" | python3 -m json.tool | head -20

# 3. Trends with market filter
curl -s "$API_URL/trends?market=maharashtra" | python3 -m json.tool

# 4. Analytics endpoint
curl -s "$API_URL/analytics?period=6months" | python3 -m json.tool

# 5. Campaigns (requires auth — test with demo token)
curl -s "$API_URL/campaigns" \
  -H "Authorization: demo-token" | python3 -m json.tool

# 6. Content adaptation
curl -s -X POST "$API_URL/content/adapt" \
  -H "Content-Type: application/json" \
  -d '{"content":"Try our new workout!","market":"maharashtra","category":"Fitness"}' \
  | python3 -m json.tool
```

### UI Validation Steps

1. **Landing page** — Open CloudFront URL, verify hero section loads
2. **Login** — Use `divisha` / `divisha` demo credentials
3. **Dashboard** — Verify metrics cards, campaign list, trend panel render
4. **Trends page** — Filter by state dropdown, verify trends appear
5. **Influencers page** — Filter by state + budget slider, verify cards
6. **Create Campaign** — Walk through all 5 wizard steps, submit
7. **Campaign Details** — Click a campaign, verify chart + details
8. **Analytics** — Verify period selector, charts, export button
9. **Responsive** — Resize browser to < 768px, verify hamburger menu

### Performance Sanity Checks

```bash
# Check Lambda cold start times
aws logs filter-log-events \
  --log-group-name /aws/lambda/virale-backend-v1-trends \
  --filter-pattern "REPORT" \
  --region ap-south-1 | head -5

# Check DynamoDB consumed capacity
aws dynamodb describe-table --table-name virale-trends \
  --query "Table.{ItemCount:ItemCount,TableSizeBytes:TableSizeBytes}" \
  --region ap-south-1

# Verify CloudFront is serving
curl -I https://<CLOUDFRONT_DOMAIN>.cloudfront.net
# Expect: x-cache: Hit from cloudfront (on second request)
```

---

## 12. Common Failure Scenarios & Fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Frontend shows fallback data only | API URL wrong in `.env` | Verify `VITE_API_URL` matches deployed API Gateway URL |
| "User not found" on login | Demo user not seeded | Run `python3 backend/scripts/seed-data.py` |
| CORS errors in browser console | CORS headers missing | Verify `serverless.yml` has `cors: true` on all events |
| Content adaptation returns rule-based only | Bedrock not enabled | Enable Claude 3.5 Sonnet in Bedrock console |
| 502 errors from API Gateway | Lambda timeout / crash | Check CloudWatch logs; increase timeout if needed |
| DynamoDB `ValidationException` | Schema mismatch | Verify key attributes match table definition |
| Campaign list empty after login | Wrong `userId` in DynamoDB | Seed data uses `demo-user-001`; verify auth Lambda returns matching sub |
| Slow responses (> 5s) | Cold starts | Deploy with Provisioned Concurrency or ping functions periodically |
| `ModuleNotFoundError: shared` | Layer not deployed | Verify shared layer is built and attached in `serverless.yml` |
| Cognito signup fails | Pool not configured | Verify `VITE_COGNITO_*` env vars; app auto-falls back to demo mode if blank |

---

## Estimated Monthly Cost (Free Tier)

| Service | Cost |
|---------|------|
| S3 Static Hosting | $0.00 |
| CloudFront CDN | $0.00 |
| Lambda (6 functions) | $0.00 |
| API Gateway | $0.00 |
| DynamoDB (5 tables, on-demand) | $0.00 |
| Cognito (< 50K MAU) | $0.00 |
| CloudWatch Logs | $0.00 |
| Bedrock (demo usage) | ~$1–5 |
| **Total** | **~$1–5/month** |

---

## Quick Reference — One-Command Redeploy

```bash
#!/bin/bash
set -e

echo "🔨 Building frontend..."
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://virale-app-<suffix>/ --delete \
  --cache-control "max-age=31536000" --exclude "index.html" --exclude "data/*"
aws s3 cp dist/index.html s3://virale-app-<suffix>/index.html \
  --cache-control "no-cache"
aws s3 sync dist/data/ s3://virale-app-<suffix>/data/ \
  --cache-control "max-age=300"

echo "🐍 Deploying backend..."
cd backend && npx serverless deploy --stage v1 && cd ..

echo "🔄 Invalidating CloudFront..."
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"

echo "✅ Deployment complete!"
```
