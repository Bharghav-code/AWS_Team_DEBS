# ⚡ VIRALE
### AI-Powered Influencer Marketing Platform for India
> **AWS Team DEBS** · Full-Stack Serverless · Amazon Bedrock · ap-south-1

---

## 📌 Executive Summary

**Virale** is a cloud-native, serverless influencer marketing platform built entirely on AWS, designed specifically for India's diverse, multilingual market. It empowers brands to **discover trending topics**, **match the right influencers within budget**, **localise content using AI**, and **measure campaign performance** — all from a single unified interface.

The platform's core innovation is **AI-driven content localisation** powered by **Amazon Bedrock (Nova Lite)**, which automatically adapts marketing copy for all 28 Indian states in their native languages — from Hindi and Tamil to Meitei and Mizo — compressing what traditionally took days of manual work into **seconds**.

---

## 🗂️ Project Overview

| Field | Details |
|---|---|
| **Project Name** | Virale — Influencer Marketing Platform |
| **Team** | AWS Team DEBS |
| **Deployment Region** | `ap-south-1` (Mumbai, India) |
| **Frontend Stack** | React 18, Vite, React Router v6, TanStack Query, Recharts |
| **Backend Stack** | Python 3.12 on AWS Lambda (Serverless Framework v3) |
| **AI Engine** | Amazon Bedrock — Amazon Nova Lite `v1` |
| **Authentication** | Amazon Cognito (JWT) |
| **Database** | Amazon DynamoDB (5 tables, PAY\_PER\_REQUEST) |
| **Containerisation** | Docker + Nginx (frontend production build) |

---

## 🚨 Problem Statement

Influencer marketing in India is **fragmented and highly regionalised**. Brands face three critical challenges:

1. 🔍 **Discovery** — Finding the right micro-influencers within budget across India's 28 linguistically distinct states
2. 📈 **Timing** — Identifying trending content opportunities in specific regional markets before they peak
3. 🌐 **Localisation** — Adapting a single campaign message into 22+ local languages quickly and cost-effectively

Virale solves all three with a unified, serverless, AI-augmented platform that requires **zero infrastructure management**.

---

## ✨ Key Features & Capabilities

### 1. 🔥 Trend Discovery Engine
- Real-time browsing of trending topics filtered by **state** and **content category**
- **AI Alignment Scoring** — Bedrock calculates how well each trend matches campaign goals (score: 0–100)
- DynamoDB GSI on `category` and `alignmentScore` for fast, sorted queries

### 2. 👥 Influencer Discovery & Matching
- Searchable influencer directory filtered by **state**, **niche**, **followers**, and **cost-per-post**
- **Budget-aware matching** — cost GSI enables efficient range queries for in-budget influencers
- Influencers are linked directly to campaigns with persistent DynamoDB records

### 3. 🤖 AI Content Localisation (Amazon Bedrock)
- `POST /content/adapt` invokes **Amazon Nova Lite** with a localisation prompt tailored to the target state and language
- Covers **all 28 Indian states** with a built-in state-to-language mapping:

| State | Language |
|---|---|
| Maharashtra | Marathi |
| Karnataka | Kannada |
| Tamil Nadu | Tamil |
| Kerala | Malayalam |
| West Bengal | Bengali |
| Gujarat | Gujarati |
| Punjab | Punjabi |
| Andhra Pradesh / Telangana | Telugu |
| Bihar / UP / Rajasthan | Hindi |
| Jammu & Kashmir | Urdu |
| + 18 more states | Native language |

- **Exponential backoff retry** (3 attempts) + graceful rule-based fallback if Bedrock is unavailable
- Past adaptations persisted in DynamoDB for campaign history retrieval

### 4. 🧙 Campaign Management Wizard
- **5-step guided wizard**: Target Market → Budget & Goals → Influencers → Content → Review
- Persistent wizard state via React Context across all steps with full form validation
- Campaign lifecycle: `Draft` → `Active` → `Paused` → `Completed`

### 5. 📊 Analytics Dashboard
- Real-time metrics: active campaigns, total reach, avg. engagement, budget spent
- Interactive **Recharts** visualisations for spend-over-time and engagement trends
- Analytics export via `POST /analytics/export` for downstream reporting

### 6. 🔐 Authentication & Security
- **Amazon Cognito** user pool with JWT token validation on all protected routes
- React `ProtectedRoute` component enforces auth at the client routing layer
- **Least-privilege IAM** — each Lambda only has permissions for its required DynamoDB tables

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│         React 18 + Vite  ·  Docker + Nginx                 │
│   (Code-split SPA, TanStack Query, React Router v6)        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│                  Amazon Cognito (Auth)                       │
│              JWT Tokens · User Pool                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│               AWS API Gateway (REST)                        │
│           CORS enabled · Proxy to Lambda                    │
└──┬──────┬──────┬──────┬──────┬──────────────────────────────┘
   │      │      │      │      │
┌──▼─┐ ┌──▼─┐ ┌─▼──┐ ┌─▼──┐ ┌─▼──┐ ┌───────┐
│Auth│ │Camp│ │Trnd│ │Infl│ │Cont│ │Anlyt │  ← Lambda Functions
│    │ │aign│ │ends│ │ncr │ │ent │ │ics   │     (Python 3.12)
└──┬─┘ └──┬─┘ └─┬──┘ └─┬──┘ └─┬──┘ └──┬────┘
   │      │     │       │      │        │
   └──────┴─────┴───────┴──┬───┴────────┘
                            │
          ┌─────────────────┼──────────────────────┐
          │                 │                      │
   ┌──────▼──────┐  ┌───────▼────────┐  ┌─────────▼────────┐
   │  DynamoDB   │  │  Amazon Bedrock │  │  Shared Lambda   │
   │  5 Tables   │  │  Nova Lite v1  │  │  Layer (utils)   │
   │  + GSIs     │  │  us-east-1     │  │  cache/db/resp   │
   └─────────────┘  └────────────────┘  └──────────────────┘
```

### Architecture Layers

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with code-splitting, lazy loading, React Query |
| **Auth** | Amazon Cognito | JWT-based auth, protected routes, Cognito Identity SDK |
| **API Gateway** | AWS API Gateway | RESTful HTTP endpoints with CORS |
| **Compute** | AWS Lambda (Python 3.12) | 6 serverless microservice functions |
| **AI / ML** | Amazon Bedrock (Nova Lite) | Content localisation & trend alignment scoring |
| **Database** | Amazon DynamoDB | 5 tables with GSIs, PAY\_PER\_REQUEST billing |
| **Caching** | In-memory Lambda cache | TTL-based caching to reduce DynamoDB reads |
| **Container** | Docker + Nginx | Production container for frontend deployment |

---

## ⚙️ Backend Microservices (Lambda)

| Function | Endpoints | Responsibility |
|---|---|---|
| `virale_auth` | `POST /auth/login` · `/auth/register` · `/auth/refresh` | Cognito integration, JWT issue & verify |
| `virale_campaigns` | `GET/POST /campaigns` · `GET/PUT/DELETE /campaigns/{id}` | Full CRUD for campaign objects |
| `virale_trends` | `GET /trends` · `GET /trends/{id}` | Trend listing with market/category filtering |
| `virale_influencers` | `GET /influencers` · `GET /influencers/{id}` | Influencer directory with budget-aware filters |
| `virale_content` | `POST /content/adapt` · `POST /content/align` · `GET /content/{id}` | Bedrock AI localisation & alignment scoring |
| `virale_analytics` | `GET /analytics` · `POST /analytics/export` · `GET /analytics/{id}` | Campaign metrics and data export |

> All functions share the **`virale-shared`** Lambda Layer containing `response_builder`, `db_helpers`, and `cache` utilities — reducing cold-start payload and promoting DRY principles.

---

## 🤖 AI Deep-Dive — Amazon Bedrock

### Content Localisation Flow

```
Brand provides marketing copy
          │
          ▼
  POST /content/adapt
  { content, market, category, campaignId }
          │
          ▼
  Lambda builds prompt:
  ┌────────────────────────────────────────────────┐
  │ Target Market: Maharashtra                     │
  │ Target Language: Marathi                       │
  │ Category: Fashion                              │
  │ Task: Translate & adapt for local market.      │
  │       Add culturally relevant emojis.          │
  └────────────────────────────────────────────────┘
          │
          ▼
  Amazon Bedrock → Nova Lite (us-east-1)
  [3 retries with exponential backoff]
          │
          ├── Success → Localised content returned + stored in DynamoDB
          │
          └── Failure → Rule-based fallback
                        e.g. "🏙️ [Maharashtra — Marathi] {original content} 🏙️"
```

### Trend Alignment Scoring Flow

```
Campaign goals defined by brand
          │
          ▼
  POST /content/align
  { goals: "...", trends: [{ id, name, category }] }
          │
          ▼
  Bedrock scores each trend (0–100)
  Returns: { "trend-001": 87, "trend-002": 42, ... }
          │
          ├── Success → Scores applied to trend cards
          └── Failure → Default score of 50 applied
```

**Model Config:**
```
Model ID : us.amazon.nova-lite-v1:0
Region   : us-east-1
Max Tokens: 1024
Memory   : 512 MB  |  Timeout: 60s
```

---

## 🎨 Frontend Architecture

```
src/
├── pages/           # 9 lazy-loaded pages (LandingPage, Dashboard, Campaigns, ...)
├── components/
│   ├── common/      # BudgetSlider, CardCarousel, Chart, InfluencerCard, TrendCard
│   ├── layout/      # Header, Navigation, Footer
│   └── wizard/      # 5-step campaign wizard steps
├── context/         # AuthContext, CampaignContext, ThemeContext
├── hooks/           # useCampaigns, useInfluencers, useTrends, useAnalytics, ...
├── services/        # API service layer (auth, campaigns, influencers, trends, content)
├── styles/          # CSS modules + global variables
└── utils/           # constants, formatters, validators
```

**Key Frontend Decisions:**

| Decision | Why |
|---|---|
| `React.lazy()` + Suspense | Code-split all 9 pages, faster initial load |
| TanStack Query v5 | Server-state caching, background refetch, deduplication |
| React Context (3 contexts) | Lightweight global state without Redux overhead |
| CSS Modules + variables.css | Scoped styles, consistent design tokens, no CSS-in-JS overhead |
| Recharts | Lightweight, composable charts for analytics visualisations |

---

## 🗃️ Data Model — DynamoDB

### Table Design

```
virale-users
  PK: userId (S)
  GSI: email-index (email → userId)
  → Used for login lookups and profile management

virale-campaigns
  PK: userId (S)  SK: campaignId (S)
  GSI: status-index (userId + status)
  → Filtered campaign listing by status per user

virale-trends
  PK: state (S)  SK: trendId (S)
  GSI: category-index (category + alignmentScore ↑)
  → Fast regional + category-sorted trend discovery

virale-influencers
  PK: state (S)  SK: influencerId (S)
  GSI: cost-index (state + cost ↑)         → Budget filtering
  GSI: niche-index (niche + cost ↑)        → Niche filtering
  → Efficient budget-aware influencer matching

virale-analytics
  PK: campaignId (S)  SK: date (S)
  → Date-range queries for time-series analytics
  → Content adaptations stored with SK prefix: adaptation#{id}
```

---

## 🚀 DevOps & Deployment

### Infrastructure as Code

```yaml
# Single command deployment
sls deploy --stage prod

# Provisions:
# ✅ 6 Lambda functions
# ✅ API Gateway with all routes
# ✅ 5 DynamoDB tables with GSIs
# ✅ IAM roles (least-privilege)
# ✅ Shared Lambda Layer
# ✅ CloudWatch log groups
```

### Deployment Pipeline

```
Developer pushes code
        │
        ▼
sls deploy (Serverless Framework v3)
        │
        ├── Packages Lambda functions individually
        ├── Bundles virale-shared layer
        ├── Creates/updates CloudFormation stack
        └── Deploys to ap-south-1
```

### Docker (Frontend)

```dockerfile
# Production build containerised with Nginx
docker build -t virale-frontend .
docker run -p 80:80 virale-frontend

# nginx.conf serves the Vite SPA build
# with client-side routing support
```

### Environment Variables

| Variable | Description |
|---|---|
| `COGNITO_USER_POOL_ID` | Cognito pool for JWT validation |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `BEDROCK_REGION` | Bedrock invocation region (`us-east-1`) |
| `BEDROCK_MODEL_ID` | `us.amazon.nova-lite-v1:0` |
| `USERS_TABLE` · `CAMPAIGNS_TABLE` · etc. | DynamoDB table names |

---

## 📁 Project Structure

```
AWS_Team_DEBS/
├── src/                          # React frontend
│   ├── pages/                    # 9 application pages
│   ├── components/               # UI components + wizard
│   ├── context/                  # Global state (Auth, Campaign, Theme)
│   ├── hooks/                    # Custom data-fetching hooks
│   ├── services/                 # API service layer
│   ├── styles/                   # CSS modules + design tokens
│   └── utils/                    # Constants, formatters, validators
│
├── backend/
│   ├── lambda/
│   │   ├── shared-layer/         # Shared Python utilities (Layer)
│   │   │   └── python/shared/    # cache.py · db_helpers.py · response_builder.py
│   │   ├── virale_auth/          # Auth Lambda
│   │   ├── virale_campaigns/     # Campaigns Lambda
│   │   ├── virale_trends/        # Trends Lambda
│   │   ├── virale_influencers/   # Influencers Lambda
│   │   ├── virale_content/       # AI Content Lambda (Bedrock)
│   │   └── virale_analytics/     # Analytics Lambda
│   ├── scripts/
│   │   └── seed-data.py          # DynamoDB seed script
│   └── serverless.yml            # Infrastructure as Code
│
├── Dockerfile                    # Frontend container
├── nginx.conf                    # Nginx SPA routing config
├── vite.config.js                # Vite build config
└── package.json                  # Frontend dependencies
```

---

## 💡 Impact & Business Value

India's **$2B+ influencer marketing industry** is driven by regional micro-influencers, yet most platforms only serve English-language, metro-focused campaigns. Virale changes this:

| Value Proposition | Impact |
|---|---|
| 🌍 **Hyper-local AI localisation** | Adapts content to 28 states in seconds vs. days of manual work |
| 💰 **Budget-aware matching** | Any brand size can find in-budget influencers without manual outreach |
| 📊 **Data-driven trend alignment** | AI scoring surfaces the most relevant trends for each campaign goal |
| ⚡ **Zero infrastructure overhead** | Fully serverless, scales to zero, zero idle cost |
| 🔒 **Enterprise-grade auth** | Cognito JWT with least-privilege IAM across all services |
| 🇮🇳 **India-first design** | Built for regional diversity — not a global platform adapted for India |

---

## 🛠️ Tech Stack Summary

```
Frontend      React 18 · Vite · React Router v6 · TanStack Query v5
              Recharts · Lucide React · CSS Modules · Amazon Cognito JS SDK

Backend       Python 3.12 · AWS Lambda · Serverless Framework v3
              Boto3 · Amazon Bedrock · Amazon DynamoDB

Infrastructure AWS API Gateway · Amazon Cognito · Amazon DynamoDB
              Amazon Bedrock (Nova Lite) · AWS IAM · Amazon CloudWatch

DevOps        Docker · Nginx · Serverless Framework · AWS CloudFormation
```

---

> *Built on AWS · Serverless · AI-Native · India-First*
> 
> **AWS Team DEBS** — Virale v1.0
