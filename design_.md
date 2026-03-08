# Design Document: Virale

## Overview

Virale is a production-ready influencer marketing platform specifically designed for **Bharat brands targeting India's regional markets**. Built on AWS serverless architecture, the system provides a lightweight, mobile-first web application. The platform uses AI-powered content adaptation via **Amazon Bedrock (Nova Lite)** to help users create localised marketing campaigns matched with trending opportunities and relevant influencers across **India's 28 states**.

The application features a fully serverless backend with AWS Lambda (Python 3.12), API Gateway, and DynamoDB. The frontend is containerised with **Docker + Nginx** for production deployment. A silent fallback system using `src/data/mockData.js` ensures uninterrupted user experience during any backend unavailability.

The application follows a multi-page architecture with distinct views for landing, dashboard, campaign creation, trends exploration, influencer marketplace, and analytics. Each page is designed with consistent navigation and visual language while serving specific user needs.

---

## Architecture

### Technology Stack

#### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework with hooks and `React.lazy()` code-splitting |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing with protected routes |
| React Context API | Global state management (Auth, Campaign, Theme) |
| TanStack Query v5 | Server state and caching |
| CSS3 + CSS Modules | Scoped component styling with global design tokens |
| Lucide React | Icon library |
| Recharts | Data visualization charts |
| amazon-cognito-identity-js | Cognito auth SDK |

**Frontend Principles**:
- React with functional components and hooks
- All 9 pages lazy-loaded via `React.lazy()` + `Suspense`
- Mobile-first responsive design
- Code splitting for optimal performance
- Dark warm-toned theme (Coffee / Antique Brass palette)

---

#### Hosting & Deployment

| Service | Purpose |
|---------|---------|
| Docker | Frontend container packaging |
| Nginx | Static file serving + SPA routing fallback |
| AWS Lambda | Serverless backend compute |
| AWS API Gateway | RESTful HTTP routing |

> ⚠️ **Change from original design**: CloudFront CDN, Amazon S3 static hosting, and Route 53 are **not part of the implemented deployment**. The frontend is served via a **Docker + Nginx container**.

---

#### Backend (Serverless)

| Service | Purpose |
|---------|---------|
| AWS Lambda | Serverless compute functions |
| API Gateway | RESTful API endpoints |
| **Python 3.12** | Lambda runtime *(not Node.js)* |
| Serverless Framework v3 | Infrastructure as Code deployment |

**Lambda Functions**:
- `virale_auth` — User authentication handlers
- `virale_campaigns` — Campaign CRUD operations
- `virale_trends` — Trend fetching and matching
- `virale_influencers` — Influencer search and recommendations
- `virale_content` — AI content adaptation + trend alignment (Bedrock)
- `virale_analytics` — Metrics and reporting

**Shared Lambda Layer (`virale-shared`)**:
All functions share a common layer bundling:
- `shared/response_builder.py` — Standard HTTP response helpers
- `shared/db_helpers.py` — DynamoDB CRUD wrappers
- `shared/cache.py` — In-memory TTL-based caching

> ⚠️ **Change from original design**: Lambda runtime is **Python 3.12**, not Node.js 20.x.

---

#### AI/ML Integration

| Service | Model | Purpose |
|---------|-------|---------|
| AWS Bedrock | **Amazon Nova Lite (`us.amazon.nova-lite-v1:0`)** | Content localisation for Indian states |
| AWS Bedrock | **Amazon Nova Lite (`us.amazon.nova-lite-v1:0`)** | Trend-brand alignment scoring (0–100) |

Bedrock is invoked from `us-east-1` region. The content Lambda has 512 MB memory and 60s timeout.

> ⚠️ **Change from original design**: The system uses **Amazon Nova Lite**, not Claude 3.5 Sonnet. **Titan Embeddings is not used** — alignment scoring is also handled by Nova Lite via a structured JSON prompt.

---

#### Database

| Service | Purpose |
|---------|---------|
| DynamoDB | NoSQL database for trends, influencers, campaigns, users, analytics |

> ⚠️ **Change from original design**: **ElastiCache (Redis) is not used**. Caching is handled by an **in-memory TTL-based cache** (`shared/cache.py`) within each Lambda execution environment.
> S3 is not used for media asset storage in the current implementation.

---

#### Security

| Service | Purpose |
|---------|---------|
| IAM | Least-privilege role-based access control per Lambda function |
| Cognito | User authentication and JWT authorization |
| API Gateway | CORS headers and HTTP routing |

---

#### Monitoring & Operations

| Service | Purpose |
|---------|---------|
| CloudWatch | Lambda logs via Serverless Framework |

> ⚠️ **Change from original design**: **AWS X-Ray distributed tracing is not implemented** in the current version.

---

### DynamoDB Schema Design

#### Table: `virale-users`

```
Partition Key: userId (String — UUID)

Attributes:
- email (String)
- name (String)
- createdAt (String — ISO8601)
- updatedAt (String — ISO8601)

GSI: email-index (for login lookup)
- Partition Key: email
```

#### Table: `virale-campaigns`

```
Partition Key: userId (String)
Sort Key: campaignId (String — UUID)

Attributes:
- name (String)
- status (String: draft | active | paused | completed)
- budget (Number)
- spent (Number)
- market (String — Indian state slug)
- category (String)
- content (String)
- adaptedContent (String)
- selectedInfluencers (List<String>)
- selectedTrends (List<String>)
- startDate (String — ISO8601)
- endDate (String — ISO8601)
- createdAt (String — ISO8601)
- updatedAt (String — ISO8601)

GSI: status-index
- Partition Key: userId
- Sort Key: status
```

#### Table: `virale-trends`

```
Partition Key: state (String)   ← Indian state slug (e.g. "karnataka")
Sort Key: trendId (String — UUID)

Attributes:
- name (String)
- badge (String)
- alignmentScore (Number: 0–100)
- timing (String)
- category (String)
- createdAt (String — ISO8601)

GSI: category-index
- Partition Key: category
- Sort Key: alignmentScore
```

> ⚠️ **Change from original design**: Partition key is `state` (not `market`) to reflect India-specific geography.

#### Table: `virale-influencers`

```
Partition Key: state (String)   ← Indian state slug
Sort Key: influencerId (String — UUID)

Attributes:
- handle (String)
- name (String)
- cost (Number)
- followers (Number)
- engagementRate (Number)
- niche (String)
- createdAt (String — ISO8601)

GSI: cost-index
- Partition Key: state
- Sort Key: cost

GSI: niche-index
- Partition Key: niche
- Sort Key: cost
```

> ⚠️ **Change from original design**: Partition key is `state` (not `market`).

#### Table: `virale-analytics`

```
Partition Key: campaignId (String)
Sort Key: date (String — YYYY-MM-DD or "adaptation#{id}")

Attributes:
- impressions (Number)
- reach (Number)
- engagement (Number)
- clicks (Number)
- conversions (Number)
- createdAt (String — ISO8601)

Note: Content adaptations are stored in this same table using SK prefix "adaptation#{adaptationId}"
```

---

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (Docker + Nginx)"
        A[React 18 SPA] --> B[API Client]
        B --> C[mockData.js Fallback]
    end

    subgraph "AWS Cognito"
        AUTH[User Pool + JWT]
    end

    subgraph "AWS API Gateway"
        D[/auth/*]
        E[/campaigns/*]
        F[/trends/*]
        G[/influencers/*]
        H[/content/*]
        I[/analytics/*]
    end

    subgraph "AWS Lambda — Python 3.12"
        J[virale_auth]
        K[virale_campaigns]
        L[virale_trends]
        M[virale_influencers]
        N[virale_content]
        O[virale_analytics]
    end

    subgraph "Shared Lambda Layer"
        SL[virale-shared\nresponse_builder / db_helpers / cache]
    end

    subgraph "Data Layer"
        P[(DynamoDB\n5 Tables + GSIs)]
    end

    subgraph "AI Layer — Bedrock us-east-1"
        S[Nova Lite — Content Localisation]
        T[Nova Lite — Alignment Scoring]
    end

    B --> AUTH
    B --> D & E & F & G & H & I
    D --> J
    E --> K
    F --> L
    G --> M
    H --> N
    I --> O

    J & K & L & M & N & O --> SL
    J & K & L & M & O --> P

    N --> S
    N --> T

    C -.->|Silent fallback if API fails| A
```

---

### API Gateway Endpoints

Base URL: `https://{api-id}.execute-api.ap-south-1.amazonaws.com/v1`

#### Authentication

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | `virale_auth` | User login via Cognito |
| POST | `/auth/register` | `virale_auth` | New user registration |
| POST | `/auth/refresh` | `virale_auth` | Refresh access token |
| GET | `/auth/me` | `virale_auth` | Get current user profile |

#### Campaigns

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/campaigns` | `virale_campaigns` | List user's campaigns |
| GET | `/campaigns/{id}` | `virale_campaigns` | Get campaign details |
| POST | `/campaigns` | `virale_campaigns` | Create new campaign |
| PUT | `/campaigns/{id}` | `virale_campaigns` | Update campaign |
| DELETE | `/campaigns/{id}` | `virale_campaigns` | Delete campaign |

#### Trends

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/trends` | `virale_trends` | List trends with filters |
| GET | `/trends/{id}` | `virale_trends` | Get trend details |

Query Parameters for `/trends`:
- `market` — Target Indian state slug (e.g. `"karnataka"`)
- `category` — Product category (e.g. `"fashion"`)

#### Influencers

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/influencers` | `virale_influencers` | List influencers with filters |
| GET | `/influencers/{id}` | `virale_influencers` | Get influencer details |

Query Parameters for `/influencers`:
- `state` — Target Indian state slug
- `niche` — Influencer niche
- `maxCost` — Maximum cost per post (budget filter)

#### Content Adaptation (Bedrock)

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| POST | `/content/adapt` | `virale_content` | AI content localisation via Bedrock |
| POST | `/content/align` | `virale_content` | Trend-brand alignment scoring via Bedrock |
| GET | `/content/{id}` | `virale_content` | Retrieve past adaptations for a campaign |

Request Body for `/content/adapt`:
```json
{
  "content": "Discover freshness this summer.",
  "market": "karnataka",
  "category": "lifestyle",
  "campaignId": "camp-abc123"
}
```

Response:
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

Request Body for `/content/align`:
```json
{
  "goals": "Increase brand awareness among young professionals in South India",
  "trends": [
    { "id": "trend-001", "name": "Sustainable Fashion", "category": "fashion" },
    { "id": "trend-002", "name": "Street Food Tours", "category": "food" }
  ]
}
```

Response:
```json
{
  "scores": {
    "trend-001": 87,
    "trend-002": 34
  }
}
```

> ⚠️ **Change from original design**: The `/content/hashtags` endpoint is **not implemented**. The field name in the adapt request is `content` (not `originalContent`). The alignment endpoint is `/content/align` (not `/content/alignment`).

#### Analytics

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/analytics` | `virale_analytics` | Dashboard summary metrics |
| GET | `/analytics/{id}` | `virale_analytics` | Campaign-specific analytics |
| POST | `/analytics/export` | `virale_analytics` | Export analytics data |

---

### Frontend Architecture (React)

The application uses a modern React architecture with functional components, hooks, and full lazy-loading:

```
src/
├── main.jsx                    # Application entry point
├── App.jsx                     # Root component with routing + ErrorBoundary
│
├── components/
│   ├── ProtectedRoute.jsx      # Auth guard for protected routes
│   ├── layout/
│   │   ├── Navigation.jsx
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   │
│   ├── common/
│   │   ├── BudgetSlider.jsx
│   │   ├── TrendCard.jsx
│   │   ├── InfluencerCard.jsx
│   │   ├── CardCarousel.jsx    ← Added in implementation
│   │   ├── Chart.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSkeleton.jsx
│   │
│   └── wizard/
│       ├── WizardStepper.jsx
│       ├── StepBudgetGoals.jsx
│       ├── StepTargetMarket.jsx
│       ├── StepContent.jsx
│       ├── StepInfluencers.jsx
│       └── StepReview.jsx
│
├── pages/                      # All pages lazy-loaded via React.lazy()
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CreateCampaignPage.jsx
│   ├── TrendsPage.jsx
│   ├── InfluencersPage.jsx
│   ├── AnalyticsPage.jsx
│   └── CampaignDetailsPage.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCampaigns.js
│   ├── useCampaignInfluencers.js   ← Added in implementation
│   ├── useTrends.js
│   ├── useInfluencers.js
│   ├── useAnalytics.js
│   ├── useContentAdaptation.js
│   ├── useAdaptations.js           ← Added in implementation
│   └── useAlignTrends.js           ← Added in implementation
│
├── services/
│   ├── api.js                  # API client
│   ├── auth.js                 # Cognito authentication
│   ├── campaignService.js
│   ├── trendService.js
│   ├── influencerService.js
│   ├── contentService.js
│   └── analyticsService.js
│
├── context/
│   ├── AuthContext.jsx
│   ├── CampaignContext.jsx
│   └── ThemeContext.jsx         ← Added in implementation
│
├── data/
│   └── mockData.js             # Fallback data (replaces public/data/*.json)
│
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   └── constants.js
│
└── styles/
    ├── global.css
    ├── variables.css           # Design tokens (dark theme)
    └── components/
        ├── Navigation.module.css
        ├── BudgetSlider.module.css
        ├── TrendCard.module.css
        ├── CardCarousel.module.css ← Added in implementation
        └── InfluencerCard.module.css
```

> ⚠️ **Change from original design**:
> - Fallback data is `src/data/mockData.js`, **not** `public/data/fallback-*.json` files
> - `ThemeContext.jsx` is added
> - `CardCarousel.jsx` component is added
> - Three new hooks added: `useAdaptations`, `useAlignTrends`, `useCampaignInfluencers`

---

### React Component Architecture

```jsx
// src/App.jsx — actual implementation
import { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// All pages are code-split via React.lazy()
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateCampaignPage = lazy(() => import('./pages/CreateCampaignPage'));
const CampaignDetailsPage = lazy(() => import('./pages/CampaignDetailsPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const InfluencersPage = lazy(() => import('./pages/InfluencersPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <CampaignProvider>
              <BrowserRouter>
                <Navigation />
                <main>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/campaigns/create" element={<CreateCampaignPage />} />
                        <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
                        <Route path="/trends" element={<TrendsPage />} />
                        <Route path="/influencers" element={<InfluencersPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                      </Route>

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </BrowserRouter>
            </CampaignProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

> ⚠️ **Change from original design**: All pages use `React.lazy()`. `ThemeProvider` wraps the app. `ErrorBoundary` class component handles runtime errors.

---

### Data Flow

1. **User Navigation**: User clicks navigation links triggering React Router
2. **Component Mount**: React component mounts; `React.lazy()` loads page bundle on demand
3. **Authentication Check**: Cognito token validation via AuthContext
4. **Data Fetching**: TanStack Query triggers API calls with caching
5. **API Gateway**: HTTP requests routed to appropriate Lambda function
6. **Lambda Execution**: Python 3.12 serverless function processes request using shared layer
7. **Database Operations**: Lambda queries/updates DynamoDB tables via `db_helpers`
8. **In-memory Cache Check**: Lambda checks TTL cache before hitting DynamoDB
9. **AI Processing**: Content adaptation and alignment scoring via Amazon Bedrock Nova Lite (`us-east-1`)
10. **Response Handling**: TanStack Query receives data or silently uses `mockData.js` fallback
11. **React Re-render**: Component state updates trigger UI re-render with dark theme styling

---

## Page Designs

### Landing Page

**Purpose**: First impression and user acquisition
**Route**: `/`

**Key Elements**:
- Hero with Virale branding and dark gradient background (`#0C1519` → `#162127` → `#724B39`)
- Feature cards: Trend Discovery, Influencer Matching, AI Content Adaptation
- Animated statistics: "10K+ Campaigns", "500+ Influencers", "50+ Markets"
- Influencer and trend carousels using `CardCarousel` component

### Dashboard Page

**Purpose**: Campaign overview and quick actions
**Route**: `/dashboard`

**Key Elements**:
- 4 metric cards: Active Campaigns, Total Reach, Avg Engagement, Budget Spent
- Campaign list with status indicators (active, paused, draft, completed)
- Recharts line graph for 30-day performance
- "Create Campaign" button linking to wizard

### Create Campaign Page

**Purpose**: Multi-step campaign creation wizard
**Route**: `/campaigns/create`

**Steps** *(in order as implemented)*:
1. **Budget & Goals** — Budget slider (₹5K–₹1L), campaign objectives
2. **Target State** — Indian state selection, product category
3. **Content** — Content input, Bedrock AI adaptation preview
4. **Influencer Selection** — Budget-filtered influencer grid, selection
5. **Review & Launch** — Campaign summary, confirm and launch

### Trends Explorer Page

**Purpose**: Browse and discover trending opportunities by Indian state
**Route**: `/trends`

**Key Elements**:
- Filters: State/Market, Category
- Trend cards with: Badge, Title, Alignment bar, Timing
- AI alignment scores updated via `/content/align` Bedrock call

### Influencer Marketplace Page

**Purpose**: Browse and find influencers by state and budget
**Route**: `/influencers`

**Key Elements**:
- Filters: State, Niche, Budget range
- Influencer cards with: Handle, Cost, Followers, Engagement, Niche tags

### Analytics Page

**Purpose**: Campaign performance analysis
**Route**: `/analytics`

**Key Elements**:
- Metrics: Total Reach, Engagement Rate, Budget Spent, Active Campaigns
- Recharts graphs for time-series data
- Export button calling `POST /analytics/export`

### Campaign Details Page

**Purpose**: View and manage a specific campaign
**Route**: `/campaigns/:id`

**Key Elements**:
- Campaign status, budget, timeline overview
- Selected trends and influencers display
- Content adaptations per Indian state
- Action buttons: Edit, Pause, Stop

---

## Components and Interfaces

### Core Components

#### Budget Slider Component

**Props**:
- `min`: number (`5000`)
- `max`: number (`100000`)
- `value`: number (current budget)
- `onChange`: function (budget update handler)
- `steps`: `[5000, 20000, 35000, 50000, 65000, 80000, 95000, 100000]`

**Behaviour**:
- Real-time value updates as user drags slider
- Automatic currency formatting (₹X,XXX)
- Mobile-optimized large thumb control

#### Trend Card Component

**Structure**:
```typescript
interface Trend {
  id: string;
  name: string;
  badge: string;
  alignmentPercentage: number;  // 0–100
  timing: string;
  category: string;
  market: string;               // Indian state slug
}
```

#### Influencer Card Component

**Structure**:
```typescript
interface Influencer {
  id: string;
  handle: string;
  name: string;
  cost: number;
  followers: number;
  engagementRate: number;
  niche: string;
  category: string;
  market: string;               // Indian state slug
}
```

#### Card Carousel Component *(added in implementation)*

Used on the Landing Page to display scrollable influencer and trend card previews.

---

## Visual Design System

### Color Palette *(Dark Theme — actual implementation)*

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Chinese Black | `#0C1519` | Page background |
| Dark Jungle Green | `#162127` | Card/surface background |
| Jet | `#3A3534` | Borders, secondary surfaces |
| Coffee | `#724B39` | Primary actions, buttons, warnings |
| Antique Brass | `#CF9D7B` | Primary text, highlights, success states |
| Text Secondary | `rgba(207,157,123,0.65)` | Supporting text |
| Text Muted | `rgba(207,157,123,0.40)` | Placeholder, disabled |
| Border Light | `rgba(207,157,123,0.12)` | Subtle card borders |
| Border Medium | `rgba(207,157,123,0.20)` | Input borders |
| Shadow | `rgba(0,0,0,0.3)` | Card depth |

> ⚠️ **Change from original design**: The colour palette is a **dark warm-tone scheme**, not the blue/white professional palette originally specified. The original `#3B82F6` blue, `#10B981` green, and white card backgrounds are **not used**.

### Hero Gradient

```css
background: linear-gradient(135deg, #0C1519 0%, #162127 40%, #724B39 100%);
```

### Typography

**Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Font Sizes** (same as original design):
- H1: 28px (desktop) / 24px (mobile)
- H2: 20px (desktop) / 18px (mobile)
- H3: 18px (desktop) / 16px (mobile)
- Body: 15px (desktop) / 14px (mobile)
- Caption: 13px (desktop) / 12px (mobile)

---

### Routing System

**Client-Side Routes**:
- `/` — Landing Page
- `/login` — Login Page *(added)*
- `/register` — Register Page *(added)*
- `/dashboard` — Dashboard
- `/campaigns/create` — Create Campaign Wizard
- `/campaigns/:id` — Campaign Details
- `/trends` — Trends Explorer
- `/influencers` — Influencer Marketplace
- `/analytics` — Analytics Dashboard

**Navigation Guards**:
- `ProtectedRoute` component wraps all post-auth routes
- Redirect to `/` if not authenticated

---

## Data Models

### State → Language Mapping (content Lambda)

```python
STATE_LANGUAGES = {
    "andhra-pradesh": ("Telugu", "te-IN"),
    "assam": ("Assamese", "as-IN"),
    "bihar": ("Hindi", "hi-IN"),
    "goa": ("Konkani", "kok-IN"),
    "gujarat": ("Gujarati", "gu-IN"),
    "karnataka": ("Kannada", "kn-IN"),
    "kerala": ("Malayalam", "ml-IN"),
    "maharashtra": ("Marathi", "mr-IN"),
    "punjab": ("Punjabi", "pa-IN"),
    "rajasthan": ("Hindi", "hi-IN"),
    "tamil-nadu": ("Tamil", "ta-IN"),
    "telangana": ("Telugu", "te-IN"),
    "west-bengal": ("Bengali", "bn-IN"),
    "jammu-kashmir": ("Urdu", "ur-IN"),
    "uttar-pradesh": ("Hindi", "hi-IN"),
    # ... all 28 states
}
```

### Markets / States (frontend constants)

```javascript
export const MARKETS = [
  { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'kerala', name: 'Kerala' },
  { id: 'maharashtra', name: 'Maharashtra' },
  { id: 'tamil-nadu', name: 'Tamil Nadu' },
  // ... all 28 Indian states
];
```

### Budget Constants

```javascript
export const BUDGET = {
  MIN: 5000,
  MAX: 100000,
  STEPS: [5000, 20000, 35000, 50000, 65000, 80000, 95000, 100000],
};
```

> ⚠️ **Change from original design**: Budget max is **₹1,00,000** (not ₹5,00,000). Step values differ from the originally specified tick marks.

### Wizard Steps (as implemented)

```javascript
export const WIZARD_STEPS = [
  { number: 1, label: 'Budget & Goals', key: 'budget' },
  { number: 2, label: 'Target State',   key: 'market' },
  { number: 3, label: 'Content',        key: 'content' },
  { number: 4, label: 'Influencers',    key: 'influencers' },
  { number: 5, label: 'Review',         key: 'review' },
];
```

---

## Correctness Properties

### Property 1: Navigation consistency across pages
*For any* valid route navigation, the system should update the URL, render the correct page component, and highlight the active navigation link.

### Property 2: State persistence across page transitions
*For any* page navigation, user session data and global filters should be preserved and accessible on the new page.

### Property 3: Budget slider real-time synchronization
*For any* valid budget value within ₹5,000–₹1,00,000, moving the slider should immediately update the displayed budget text with proper currency formatting.

### Property 4: Budget-based influencer filtering
*For any* selected budget value, all displayed influencer recommendations should have costs within range of the selected budget and update immediately when the budget changes.

### Property 5: Multi-step wizard progress preservation
*For any* step in the campaign creation wizard, navigating forward or backward should preserve all previously entered data via React Context.

### Property 6: Indian state filter consistency
*For any* state and category selection, the system should maintain these selections throughout the session and update all trend and influencer recommendations accordingly.

### Property 7: Trend card completeness
*For any* displayed trend card, it should contain all required elements: trend badge, title, alignment bar with solid colour visualisation, and contextual timing information.

### Property 8: High-alignment trend emphasis
*For any* trend with alignment percentage above 90%, the system should apply visual emphasis to distinguish it from lower-alignment trends.

### Property 9: Influencer card completeness
*For any* displayed influencer card, it should contain all required elements: profile placeholder, handle, cost tag, follower metrics, engagement rate, and niche information.

### Property 10: Content adaptation — Indian state coverage
*For any* of the 28 Indian states, the content adaptation system should return localised content in the correct native language, either via Bedrock or rule-based fallback.

### Property 11: Touch target accessibility
*For any* interactive element on mobile devices, the touch target should be at least 44px in both dimensions.

### Property 12: Dark theme visual consistency
*For any* page or component, backgrounds should use the dark palette (Chinese Black / Jungle Green) and text should use Antique Brass tones.

### Property 13: Responsive navigation behaviour
*For any* screen size below 768px, the navigation should display as a hamburger menu; above 768px as a horizontal navigation bar.

### Property 14: Campaign draft auto-save
*For any* input change in the campaign creation wizard, the draft state should be automatically preserved in React Context.

### Property 15: Filter application consistency
*For any* combination of filters on the Trends or Influencers page, the displayed results should match all active filter criteria.

### Property 16: Cross-device header/footer visibility
*For any* screen size or device orientation, the header and footer should remain visible and properly formatted.

---

## Error Handling

### Bedrock Fallback Strategy

```
Bedrock invocation attempt 1
  └── Failure → wait 1s (exponential backoff)
Bedrock invocation attempt 2
  └── Failure → wait 2s
Bedrock invocation attempt 3
  └── Failure → Rule-based fallback:
      e.g. "🏙️ [Maharashtra — Marathi] {original content} 🏙️"
```

### API Error Handling

- All Lambda functions return standardised JSON via `response_builder`
- TanStack Query retries failed requests up to 2 times
- `mockData.js` provides silent client-side fallback
- `ErrorBoundary` class component catches unexpected React render errors

---

## Testing Strategy

### Property-Based Testing Configuration

**Testing Framework**: Fast-check for JavaScript/TypeScript property-based testing
**Test Configuration**: Minimum 100 iterations per property test
**Test Tagging**: `Feature: virale, Property {number}: {property_text}`

### Testing Balance

- **Unit Tests (30%)**: Specific examples, edge cases, error handling
- **Property Tests (70%)**: Universal behaviours across all valid inputs, system invariants
