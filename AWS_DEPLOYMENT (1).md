# ☁️ AWS Deployment Guide — Virale

> **Goal:** Deploy the complete Virale platform on AWS in under 2 hours using serverless services that stay within free tier limits.

---

## 📋 Prerequisites

- [ ] AWS Account with admin access
- [ ] AWS CLI v2 installed and configured (`aws configure`)
- [ ] Node.js 20.x installed
- [ ] Git installed
- [ ] Domain name (optional — can use CloudFront default domain)

```bash
# Verify AWS CLI
aws --version
aws sts get-caller-identity
```

---

## 🗺️ Deployment Order

Deploy services in this order to satisfy dependencies:

```
Step 1: Cognito (Authentication)     ← No dependencies
Step 2: DynamoDB (Database)          ← No dependencies
Step 3: ElastiCache (Caching)        ← VPC required
Step 4: Lambda Functions (Compute)   ← Needs Cognito, DynamoDB, Bedrock
Step 5: API Gateway (API)            ← Needs Lambda, Cognito
Step 6: S3 Bucket (Hosting)          ← No dependencies
Step 7: CloudFront (CDN)             ← Needs S3, API Gateway
Step 8: Route 53 (DNS)               ← Needs CloudFront (optional)
Step 9: Bedrock Model Access         ← Request access in console
```

---

## Step 1: AWS Cognito — User Authentication

### 1.1 Create User Pool

```bash
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
  --region us-east-1
```

> 📝 Save the `UserPoolId` from the output.

### 1.2 Create App Client

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name virale-web \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH \
  --supported-identity-providers COGNITO \
  --region us-east-1
```

> 📝 Save the `ClientId` from the output.

### 1.3 Cost: **FREE** (up to 50,000 MAU)

---

## Step 2: DynamoDB — Database Tables

### 2.1 Create All Tables

```bash
# Users Table
aws dynamodb create-table \
  --table-name virale-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes '[{
    "IndexName": "email-index",
    "KeySchema": [{"AttributeName":"email","KeyType":"HASH"}],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Campaigns Table
aws dynamodb create-table \
  --table-name virale-campaigns \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=campaignId,AttributeType=S \
    AttributeName=status,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=campaignId,KeyType=RANGE \
  --global-secondary-indexes '[{
    "IndexName": "status-index",
    "KeySchema": [
      {"AttributeName":"userId","KeyType":"HASH"},
      {"AttributeName":"status","KeyType":"RANGE"}
    ],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Trends Table
aws dynamodb create-table \
  --table-name virale-trends \
  --attribute-definitions \
    AttributeName=state,AttributeType=S \
    AttributeName=trendId,AttributeType=S \
    AttributeName=category,AttributeType=S \
    AttributeName=alignmentScore,AttributeType=N \
  --key-schema \
    AttributeName=state,KeyType=HASH \
    AttributeName=trendId,KeyType=RANGE \
  --global-secondary-indexes '[{
    "IndexName": "category-index",
    "KeySchema": [
      {"AttributeName":"category","KeyType":"HASH"},
      {"AttributeName":"alignmentScore","KeyType":"RANGE"}
    ],
    "Projection": {"ProjectionType":"ALL"}
  }]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Influencers Table
aws dynamodb create-table \
  --table-name virale-influencers \
  --attribute-definitions \
    AttributeName=state,AttributeType=S \
    AttributeName=influencerId,AttributeType=S \
    AttributeName=cost,AttributeType=N \
    AttributeName=niche,AttributeType=S \
  --key-schema \
    AttributeName=state,KeyType=HASH \
    AttributeName=influencerId,KeyType=RANGE \
  --global-secondary-indexes '[
    {
      "IndexName": "cost-index",
      "KeySchema": [
        {"AttributeName":"state","KeyType":"HASH"},
        {"AttributeName":"cost","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    },
    {
      "IndexName": "niche-index",
      "KeySchema": [
        {"AttributeName":"niche","KeyType":"HASH"},
        {"AttributeName":"cost","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Analytics Table
aws dynamodb create-table \
  --table-name virale-analytics \
  --attribute-definitions \
    AttributeName=campaignId,AttributeType=S \
    AttributeName=date,AttributeType=S \
  --key-schema \
    AttributeName=campaignId,KeyType=HASH \
    AttributeName=date,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2.2 Seed Initial Data

```bash
# Create a seed script (seed-data.js) and run:
node scripts/seed-data.js
```

### 2.3 Cost: **FREE** (up to 25GB storage, 25 RCU/WCU)

---

## Step 3: ElastiCache — Redis Caching (Optional for Hackathon)

> ⚡ **Hackathon Tip:** Skip ElastiCache initially. Use DynamoDB + TanStack Query caching in the frontend. Add ElastiCache post-hackathon for production optimization.

If deploying:

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id virale-cache \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --region us-east-1
```

### Cost: ~$0.017/hr (cache.t3.micro)

---

## Step 4: Lambda Functions — Serverless Compute

### 4.1 Create IAM Role for Lambda

```bash
# Create the trust policy
cat > lambda-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create the role
aws iam create-role \
  --role-name virale-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach policies
aws iam attach-role-policy --role-name virale-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy --role-name virale-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy --role-name virale-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

### 4.2 Create Shared Lambda Layer

Package shared Python utilities (response builder, DB helpers) as a Lambda Layer:

```bash
# Create layer structure
mkdir -p layer/python/shared
cp lambda/shared/*.py layer/python/shared/

cd layer
zip -r ../virale-shared-layer.zip python/

aws lambda publish-layer-version \
  --layer-name virale-shared \
  --zip-file fileb://../virale-shared-layer.zip \
  --compatible-runtimes python3.12 \
  --region us-east-1
```

> 📝 Save the `LayerVersionArn` from the output.

### 4.3 Package & Deploy Each Lambda

```bash
# For each Lambda function (example: virale-auth):
cd lambda/virale_auth

# Install dependencies (boto3 is pre-installed in Lambda, skip if only using boto3)
pip install -r requirements.txt -t package/ 2>/dev/null
cp lambda_function.py package/

cd package
zip -r ../../virale-auth.zip .

aws lambda create-function \
  --function-name virale-auth \
  --runtime python3.12 \
  --role arn:aws:iam::<ACCOUNT_ID>:role/virale-lambda-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://../../virale-auth.zip \
  --timeout 30 \
  --memory-size 256 \
  --layers <SHARED_LAYER_ARN> \
  --environment Variables='{
    "COGNITO_USER_POOL_ID":"<USER_POOL_ID>",
    "COGNITO_CLIENT_ID":"<CLIENT_ID>",
    "USERS_TABLE":"virale-users",
    "REGION":"us-east-1"
  }' \
  --region us-east-1
```

Repeat for all 6 functions: `virale-auth`, `virale-campaigns`, `virale-trends`, `virale-influencers`, `virale-content` (use 512MB memory + 60s timeout), `virale-analytics`.

> 💡 **Python advantage:** `boto3` is pre-installed in the Python 3.12 Lambda runtime, so most functions need **zero external dependencies**, resulting in tiny zip files and fast cold starts.

---

## Step 5: API Gateway — REST API

### 5.1 Create the API

```bash
aws apigateway create-rest-api \
  --name virale-api \
  --description "Virale Marketing Platform API" \
  --endpoint-configuration types=REGIONAL \
  --region us-east-1
```

> 📝 Save the `id` (REST API ID) from the output.

### 5.2 Create Cognito Authorizer

```bash
aws apigateway create-authorizer \
  --rest-api-id <API_ID> \
  --name virale-cognito-auth \
  --type COGNITO_USER_POOLS \
  --provider-arns arn:aws:cognito-idp:us-east-1:<ACCOUNT_ID>:userpool/<USER_POOL_ID> \
  --identity-source method.request.header.Authorization \
  --region us-east-1
```

### 5.3 Create Resources & Methods

Create resource paths and connect to Lambda functions for each endpoint group (`/auth/*`, `/campaigns/*`, `/trends/*`, `/influencers/*`, `/content/*`, `/analytics/*`).

### 5.4 Enable CORS

```bash
# For each resource, enable CORS headers:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
# Access-Control-Allow-Headers: Content-Type,Authorization
```

### 5.5 Deploy API

```bash
aws apigateway create-deployment \
  --rest-api-id <API_ID> \
  --stage-name v1 \
  --region us-east-1
```

API URL: `https://<API_ID>.execute-api.us-east-1.amazonaws.com/v1`

### 5.6 Cost: **FREE** (up to 1M API calls/month)

---

## Step 6: S3 — Static Website Hosting

### 6.1 Create Bucket

```bash
aws s3 mb s3://virale-app --region us-east-1
```

### 6.2 Enable Static Hosting

```bash
aws s3 website s3://virale-app \
  --index-document index.html \
  --error-document index.html
```

### 6.3 Set Bucket Policy (Public Read via CloudFront OAI)

```bash
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "CloudFrontAccess",
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity <OAI_ID>"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::virale-app/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket virale-app --policy file://bucket-policy.json
```

### 6.4 Build & Upload Frontend

```bash
# Build the React app
npm run build

# Sync to S3
aws s3 sync dist/ s3://virale-app/ \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://virale-app/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

### 6.5 Cost: **FREE** (up to 5GB storage)

---

## Step 7: CloudFront — CDN Distribution

### 7.1 Create Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "virale-dist-1",
    "Origins": {
      "Quantity": 2,
      "Items": [
        {
          "Id": "S3Origin",
          "DomainName": "virale-app.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": "origin-access-identity/cloudfront/<OAI_ID>"
          }
        },
        {
          "Id": "APIOrigin",
          "DomainName": "<API_ID>.execute-api.us-east-1.amazonaws.com",
          "OriginPath": "/v1",
          "CustomOriginConfig": {
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "https-only"
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3Origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "AllowedMethods": {"Quantity": 2, "Items": ["GET","HEAD"]},
      "Compress": true,
      "ForwardedValues": {"QueryString": false, "Cookies": {"Forward": "none"}}
    },
    "CustomErrorResponses": {
      "Quantity": 1,
      "Items": [{
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      }]
    },
    "Comment": "Virale Marketing Platform",
    "Enabled": true,
    "DefaultRootObject": "index.html"
  }'
```

### 7.2 Cost: **FREE** (up to 1TB data transfer/month, 10M requests)

---

## Step 8: Route 53 — DNS (Optional)

If you have a custom domain:

```bash
aws route53 create-hosted-zone --name virale.app --caller-reference virale-dns-1

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets --hosted-zone-id <ZONE_ID> --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "virale.app",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "<CLOUDFRONT_DOMAIN>.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}'
```

---

## Step 9: AWS Bedrock — AI Model Access

### 9.1 Request Model Access (Console)

1. Go to **AWS Console → Amazon Bedrock → Model access**
2. Click **"Manage model access"**
3. Enable:
   - ✅ **Anthropic Claude 3.5 Sonnet** (content generation)
   - ✅ **Amazon Titan Embeddings V2** (alignment scoring)
4. Accept terms and submit request (usually instant)

### 9.2 Cost: **Pay-per-use**
- Claude 3.5 Sonnet: ~$3/1M input tokens, ~$15/1M output tokens
- Titan Embeddings: ~$0.02/1M tokens

---

## 🚀 One-Command Deploy Script

Save this as `deploy.sh` for quick redeployment:

```bash
#!/bin/bash
set -e

echo "🔨 Building frontend..."
npm run build

echo "📤 Uploading to S3..."
aws s3 sync dist/ s3://virale-app/ --delete \
  --cache-control "max-age=31536000" --exclude "index.html"
aws s3 cp dist/index.html s3://virale-app/index.html \
  --cache-control "no-cache"

echo "🐍 Deploying Lambda functions..."
cd lambda
bash deploy.sh
cd ..

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"

echo "✅ Deployment complete!"
echo "🌐 https://<CLOUDFRONT_DOMAIN>.cloudfront.net"
```

---

## 🔧 Environment Configuration

### Frontend `.env` File

```env
VITE_API_URL=https://<API_ID>.execute-api.us-east-1.amazonaws.com/v1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
VITE_REGION=us-east-1
```

### Lambda Environment Variables

| Variable | Value | Used By |
|----------|-------|---------|
| `COGNITO_USER_POOL_ID` | `us-east-1_XXXXXXX` | virale-auth |
| `COGNITO_CLIENT_ID` | `xxxxxxxxx` | virale-auth |
| `USERS_TABLE` | `virale-users` | virale-auth |
| `CAMPAIGNS_TABLE` | `virale-campaigns` | virale-campaigns |
| `TRENDS_TABLE` | `virale-trends` | virale-trends |
| `INFLUENCERS_TABLE` | `virale-influencers` | virale-influencers |
| `ANALYTICS_TABLE` | `virale-analytics` | virale-analytics |
| `BEDROCK_REGION` | `us-east-1` | virale-content |
| `REGION` | `us-east-1` | All |

---

## 💰 Estimated Cost (Hackathon)

| Service | Monthly Estimate |
|---------|-----------------|
| S3 | $0.00 (free tier) |
| CloudFront | $0.00 (free tier) |
| Lambda | $0.00 (free tier) |
| API Gateway | $0.00 (free tier) |
| DynamoDB | $0.00 (free tier) |
| Cognito | $0.00 (free tier) |
| Bedrock | ~$1–5 (demo usage) |
| CloudWatch | $0.00 (free tier) |
| **Total** | **~$1–5/month** |

---

## ✅ Post-Deployment Verification

```bash
# 1. Check S3 bucket
aws s3 ls s3://virale-app/

# 2. Test API Health
curl https://<API_ID>.execute-api.us-east-1.amazonaws.com/v1/trends?state=maharashtra

# 3. Check Lambda logs
aws logs tail /aws/lambda/virale-trends --follow

# 4. Verify CloudFront
curl -I https://<CLOUDFRONT_DOMAIN>.cloudfront.net

# 5. Test Cognito signup
aws cognito-idp sign-up \
  --client-id <CLIENT_ID> \
  --username test@virale.app \
  --password TestPass123 \
  --user-attributes Name=email,Value=test@virale.app Name=name,Value="Test User"
```
