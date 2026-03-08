<div align="center">

# ⚡ VIRALE

### AI-Powered Influencer Marketing Platform for India

[![AWS](https://img.shields.io/badge/AWS-Powered-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://serverless.com/)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-Database-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![Bedrock](https://img.shields.io/badge/Amazon-Bedrock-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock/)

> **Discover trends. Match influencers. Localise content with AI. Measure everything.**
> Built for India's 28 states, 20+ languages, and 1 billion potential customers.

---

[Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure) · [Team](#-team)

</div>

---

## 📌 Overview

**Virale** is a full-stack, cloud-native influencer marketing platform built entirely on **AWS**, purpose-designed for India's diverse, multilingual market. It enables brands to:

- 🔥 **Discover** trending topics by state and category with AI alignment scoring
- 👥 **Match** regional micro-influencers filtered by budget, niche, and location
- 🤖 **Localise** marketing content for any of India's 28 states in their native language using **Amazon Bedrock**
- 📊 **Measure** campaign performance with real-time analytics and exportable reports

Virale is **100% serverless** — no servers to provision, no infrastructure to manage, zero idle cost.

---

## ✨ Features

### 🔥 Trend Discovery Engine
- Browse live trends filtered by **state** and **content category**
- AI-powered **alignment scoring** (0–100) via Amazon Bedrock — scores each trend against your campaign goals
- Backed by DynamoDB GSIs for sub-millisecond sorted queries

### 👥 Influencer Discovery & Matching
- Regional micro-influencer directory with filters for **state**, **niche**, **followers**, and **cost-per-post**
- Budget-aware queries powered by DynamoDB cost-index GSI
- Direct campaign assignment and persistent influencer-campaign linking

### 🤖 AI Content Localisation (Amazon Bedrock)
- One-click content adaptation for all **28 Indian states** in their native language
- Powered by **Amazon Nova Lite** (`us.amazon.nova-lite-v1:0`) via Bedrock
- Culturally contextualised output with relevant emojis
- **Exponential backoff retry** (3 attempts) + graceful rule-based fallback
- Adaptation history persisted per campaign in DynamoDB

### 🧙 Campaign Management Wizard
- Guided **5-step wizard**: Target Market → Budget & Goals → Influencers → Content → Review
- Form validation at every step with React Context state persistence
- Campaign lifecycle: `Draft` → `Active` → `Paused` → `Completed`

### 📊 Analytics Dashboard
- Real-time metrics: active campaigns, total reach, avg. engagement, budget spent
- Interactive time-series charts (Recharts)
- Analytics export via REST API

### 🔐 Authentication & Security
- **Amazon Cognito** user pool with JWT token-based auth
- Protected routes enforced at both client (React) and server (API Gateway) layers
- Least-privilege IAM — each Lambda only accesses its required resources

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│           React 18 + Vite  ·  Docker + Nginx                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────────────┐
│                   Amazon Cognito                                  │
│               JWT Tokens  ·  User Pool                          │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                  AWS API Gateway (REST)                          │
│              CORS Enabled  ·  Proxy Integration                  │
└──┬──────┬───────┬──────┬───────┬──────────────────────────────────┘
   │      │       │      │       │
┌──▼──┐ ┌─▼───┐ ┌▼────┐ ┌▼────┐ ┌▼─────┐ ┌────────┐
│Auth │ │Camp │ │Trend│ │Infl │ │Conte│ │Analyt │
│     │ │aign │ │s    │ │uenc │ │nt   │ │ics    │  ← Lambda (Python 3.12)
└──┬──┘ └─┬───┘ └┬────┘ └┬────┘ └┬─────┘ └───┬────┘
   │      │      │       │       │             │
   └──────┴──────┴───────┴───┬───┴─────────────┘
                              │
         ┌────────────────────┼──────────────────────┐
         │                    │                      │
  ┌──────▼──────┐   ┌─────────▼──────┐   ┌──────────▼──────┐
  │  DynamoDB   │   │ Amazon Bedrock  │   │  Shared Lambda  │
  │  5 Tables   │   │  Nova Lite v1  │   │  Layer (utils)  │
  │  + 6 GSIs   │   │  (us-east-1)   │   │  cache/db/resp  │
  └─────────────┘   └────────────────┘   └─────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, TanStack Query v5, Recharts, Lucide React |
| **Auth** | Amazon Cognito (User Pool + JWT) |
| **API** | AWS API Gateway (REST, CORS) |
| **Compute** | AWS Lambda — Python 3.12 (6 functions) |
| **AI / ML** | Amazon Bedrock — Nova Lite `us.amazon.nova-lite-v1:0` |
| **Database** | Amazon DynamoDB (5 tables, PAY\_PER\_REQUEST) |
| **IaC** | Serverless Framework v3 + AWS CloudFormation |
| **Container** | Docker + Nginx |
| **Region** | `ap-south-1` (Mumbai) · Bedrock: `us-east-1` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- Python `3.12`
- AWS CLI configured (`aws configure`)
- Serverless Framework v3 (`npm install -g serverless`)
- Docker (for frontend container)

---

### 1. Clone the Repository

```bash
git clone https://github.com/aws-team-debs/virale.git
cd virale
```

---

### 2. Backend — Deploy to AWS

```bash
cd backend

# Set required environment variables
export COGNITO_USER_POOL_ID=us-south-1_XXXXXXXXX
export COGNITO_CLIENT_ID=your_client_id_here

# Deploy all Lambda functions, API Gateway, DynamoDB tables
serverless deploy --stage v1

# (Optional) Seed DynamoDB with sample data
python scripts/seed-data.py
```

> After deployment, note the **API Gateway base URL** from the output — you'll need it for the frontend.

---

### 3. Frontend — Local Development

```bash
# From project root
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/v1
VITE_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your_client_id_here
VITE_COGNITO_REGION=ap-south-1
```

```bash
# Start development server
npm run dev
```

App runs at `http://localhost:5173`

---

### 4. Frontend — Production (Docker)

```bash
# Build and run with Docker
docker build -t virale-frontend .
docker run -p 80:80 virale-frontend
```

App runs at `http://localhost:80`

---

## ⚙️ Backend Microservices

All functions share the **`virale-shared`** Lambda Layer containing response builders, DynamoDB helpers, and a TTL cache module.

| Function | Route(s) | Method(s) | Description |
|---|---|---|---|
| `virale_auth` | `/auth/{proxy+}` | ANY | Cognito login, register, token refresh |
| `virale_campaigns` | `/campaigns` · `/campaigns/{id}` | ANY | Full CRUD for campaign objects |
| `virale_trends` | `/trends` · `/trends/{id}` | GET | Trend listing with market & category filters |
| `virale_influencers` | `/influencers` · `/influencers/{id}` | GET | Influencer directory with budget-aware filters |
| `virale_content` | `/content/adapt` · `/content/align` · `/content/{id}` | POST / GET | Bedrock AI localisation & alignment scoring |
| `virale_analytics` | `/analytics` · `/analytics/export` · `/analytics/{id}` | GET / POST | Campaign metrics & data export |

---

## 📡 API Reference

### Authentication

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

---

### Trends

```http
GET /trends
GET /trends?market=karnataka&category=fashion
GET /trends/{trendId}
```

---

### Influencers

```http
GET /influencers
GET /influencers?state=maharashtra&niche=lifestyle&maxCost=5000
GET /influencers/{influencerId}
```

---

### Campaigns

```http
GET    /campaigns
POST   /campaigns
GET    /campaigns/{id}
PUT    /campaigns/{id}
DELETE /campaigns/{id}
```

---

### AI Content Localisation

```http
POST /content/adapt
Content-Type: application/json

{
  "content": "Discover freshness this summer.",
  "market": "karnataka",
  "category": "lifestyle",
  "campaignId": "camp-abc123"
}
```

**Response:**
```json
{
  "id": "adapt-a1b2c3d4",
  "originalContent": "Discover freshness this summer.",
  "adaptedContent": "🌿 ಈ ಬೇಸಿಗೆಯಲ್ಲಿ ತಾಜಾತನವನ್ನು ಅನ್ವೇಷಿಸಿ. 🌿",
  "market": "karnataka",
  "language": "kn-IN",
  "category": "lifestyle",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Trend Alignment Scoring

```http
POST /content/align
Content-Type: application/json

{
  "goals": "Increase brand awareness among young professionals in South India",
  "trends": [
    { "id": "trend-001", "name": "Sustainable Fashion", "category": "fashion" },
    { "id": "trend-002", "name": "Street Food Tours", "category": "food" }
  ]
}
```

**Response:**
```json
{
  "scores": {
    "trend-001": 87,
    "trend-002": 34
  }
}
```

---

### Analytics

```http
GET  /analytics
GET  /analytics/{campaignId}
POST /analytics/export
```

---

## 🗃️ Data Model

### DynamoDB Tables

```
virale-users
  PK  : userId        (String)
  GSI : email-index   → email (for login lookups)

virale-campaigns
  PK  : userId        (String)
  SK  : campaignId    (String)
  GSI : status-index  → userId + status

virale-trends
  PK  : state         (String)   ← Indian state slug
  SK  : trendId       (String)
  GSI : category-index → category + alignmentScore (sorted)

virale-influencers
  PK  : state         (String)
  SK  : influencerId  (String)
  GSI : cost-index    → state + cost (budget filtering)
  GSI : niche-index   → niche + cost (niche filtering)

virale-analytics
  PK  : campaignId    (String)
  SK  : date          (String)   ← ISO date or "adaptation#{id}"
```

---

## 🌐 State → Language Mapping

Virale natively supports all 28 Indian states:

| State | Language | Code |
|---|---|---|
| Andhra Pradesh | Telugu | te-IN |
| Assam | Assamese | as-IN |
| Bihar | Hindi | hi-IN |
| Goa | Konkani | kok-IN |
| Gujarat | Gujarati | gu-IN |
| Karnataka | Kannada | kn-IN |
| Kerala | Malayalam | ml-IN |
| Maharashtra | Marathi | mr-IN |
| Punjab | Punjabi | pa-IN |
| Rajasthan | Hindi | hi-IN |
| Tamil Nadu | Tamil | ta-IN |
| Telangana | Telugu | te-IN |
| West Bengal | Bengali | bn-IN |
| Jammu & Kashmir | Urdu | ur-IN |
| Uttar Pradesh | Hindi | hi-IN |
| + 13 more states | Native language | — |

---

## 📁 Project Structure

```
virale/
│
├── src/                              # React Frontend
│   ├── pages/                        # 9 lazy-loaded pages
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CreateCampaignPage.jsx
│   │   ├── CampaignDetailsPage.jsx
│   │   ├── TrendsPage.jsx
│   │   ├── InfluencersPage.jsx
│   │   └── AnalyticsPage.jsx
│   │
│   ├── components/
│   │   ├── common/                   # BudgetSlider, Chart, InfluencerCard, TrendCard ...
│   │   ├── layout/                   # Header, Navigation, Footer
│   │   └── wizard/                   # 5-step campaign wizard steps
│   │
│   ├── context/                      # AuthContext, CampaignContext, ThemeContext
│   ├── hooks/                        # useCampaigns, useInfluencers, useTrends ...
│   ├── services/                     # API service layer
│   ├── styles/                       # CSS Modules + global design tokens
│   └── utils/                        # constants, formatters, validators
│
├── backend/
│   ├── lambda/
│   │   ├── shared-layer/             # Shared Python Lambda Layer
│   │   │   └── python/shared/
│   │   │       ├── cache.py          # TTL in-memory cache
│   │   │       ├── db_helpers.py     # DynamoDB CRUD helpers
│   │   │       └── response_builder.py
│   │   │
│   │   ├── virale_auth/              # Auth Lambda
│   │   ├── virale_campaigns/         # Campaigns Lambda
│   │   ├── virale_trends/            # Trends Lambda
│   │   ├── virale_influencers/       # Influencers Lambda
│   │   ├── virale_content/           # AI Content Lambda (Bedrock)
│   │   └── virale_analytics/         # Analytics Lambda
│   │
│   ├── scripts/
│   │   └── seed-data.py              # DynamoDB seed script
│   │
│   └── serverless.yml                # Infrastructure as Code
│
├── public/                           # Static assets
├── Dockerfile                        # Frontend container
├── nginx.conf                        # Nginx SPA routing config
├── vite.config.js                    # Vite build configuration
├── package.json                      # Frontend dependencies
└── README.md
```

---

## 🔧 Environment Variables

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API Gateway base URL |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `VITE_COGNITO_REGION` | AWS Region for Cognito |

### Backend (Serverless / Lambda)

| Variable | Description |
|---|---|
| `COGNITO_USER_POOL_ID` | Cognito pool for JWT validation |
| `COGNITO_CLIENT_ID` | Cognito app client ID |
| `BEDROCK_REGION` | Bedrock invocation region (`us-east-1`) |
| `BEDROCK_MODEL_ID` | `us.amazon.nova-lite-v1:0` |
| `USERS_TABLE` | DynamoDB users table name |
| `CAMPAIGNS_TABLE` | DynamoDB campaigns table name |
| `TRENDS_TABLE` | DynamoDB trends table name |
| `INFLUENCERS_TABLE` | DynamoDB influencers table name |
| `ANALYTICS_TABLE` | DynamoDB analytics table name |

---

## 🧪 Local Development Tips

```bash
# Install frontend dependencies
npm install

# Run frontend dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Seed DynamoDB with sample data (after backend deploy)
cd backend && python scripts/seed-data.py

# Deploy backend to a specific stage
serverless deploy --stage dev
serverless deploy --stage prod
```

---

## 🔒 Security

- All API routes except `/auth/*` require a valid **Cognito JWT** token
- Lambda IAM roles follow **least-privilege** — each function only has access to its own DynamoDB table(s)
- Bedrock invocation permission is scoped to the content Lambda only
- CORS headers are configured per-endpoint in API Gateway
- Environment secrets are injected at deploy time via Serverless Framework — never hardcoded

---

## 📦 Dependencies

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.3.1 | UI framework |
| `react-dom` | 18.3.1 | DOM rendering |
| `react-router-dom` | 6.28.0 | Client-side routing |
| `@tanstack/react-query` | 5.62.0 | Server state management |
| `amazon-cognito-identity-js` | 6.3.12 | Cognito auth SDK |
| `recharts` | 2.13.3 | Analytics charts |
| `lucide-react` | 0.460.0 | Icon library |
| `vite` | 5.4.11 | Build tool |

### Backend

| Package | Purpose |
|---|---|
| `boto3` | AWS SDK for Python (DynamoDB, Bedrock) |
| `serverless` v3 | Infrastructure as Code framework |

---

## 🙌 Team

**AWS Team DEBS**

> Built with ❤️ for India's regional markets using the power of AWS.

---

## 📄 License

This project is developed for educational and demonstration purposes as part of an AWS hackathon/project submission by Team DEBS.

---

<div align="center">

**Built on AWS · Serverless · AI-Native · India-First**

⭐ Star this repo if you found it useful!

</div>
