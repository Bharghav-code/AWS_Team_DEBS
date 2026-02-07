# Design Document: Virale

## Overview

Virale is a production-ready global marketing platform specifically designed for Bharat brands. Built on AWS serverless architecture, the system provides a lightweight, mobile-first web application that works seamlessly on 3G networks. The platform uses AI-powered content adaptation via AWS Bedrock to help users create localized marketing campaigns matched with trending opportunities and relevant influencers in target markets.

The application features a fully serverless backend with AWS Lambda, API Gateway, and DynamoDB, with CloudFront CDN for global distribution. A silent fallback system ensures uninterrupted user experience during any backend unavailability.

The application follows a multi-page architecture with distinct views for landing, dashboard, campaign creation, trends exploration, influencer marketplace, and analytics. Each page is designed with consistent navigation and visual language while serving specific user needs.

## Architecture

### Technology Stack

#### Frontend

| Technology | Purpose |
|------------|---------|
| React 18+ | UI Framework with hooks |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| React Context API | Global state management |
| TanStack Query | Server state and caching |
| CSS3 | Styling with CSS Modules |
| Lucide React | Icon library |
| Recharts | Data visualization charts |

**Frontend Principles**:
- React with functional components and hooks
- Mobile-first responsive design
- Works on 3G networks (optimized bundle size)
- Progressive enhancement approach
- Code splitting for optimal performance

---

#### Hosting & CDN

| Service | Purpose |
|---------|---------|
| Amazon S3 | Static website hosting |
| CloudFront CDN | Global distribution, edge caching |
| Route 53 | DNS management, domain routing |

---

#### Backend (Serverless)

| Service | Purpose |
|---------|---------|
| AWS Lambda | Serverless compute functions |
| API Gateway | RESTful API endpoints |
| Node.js 20.x | Lambda runtime |

**Lambda Functions**:
- `virale-auth` - User authentication handlers
- `virale-campaigns` - Campaign CRUD operations
- `virale-trends` - Trend fetching and matching
- `virale-influencers` - Influencer search and recommendations
- `virale-content` - AI content adaptation
- `virale-analytics` - Metrics and reporting

---

#### AI/ML Integration

| Service | Model | Purpose |
|---------|-------|---------|
| AWS Bedrock | Claude 3.5 Sonnet | Content generation and localization |
| AWS Bedrock | Titan Embeddings | Trend-brand alignment matching |

---

#### Database

| Service | Purpose |
|---------|---------|
| DynamoDB | NoSQL database for trends, influencers, campaigns |
| S3 | Media asset storage (images, videos) |
| ElastiCache (Redis) | Session caching and API response caching |

---

#### Security

| Service | Purpose |
|---------|---------|
| IAM | Role-based access control |
| Cognito | User authentication and authorization |
| CloudFront | HTTPS/SSL termination |

---

#### Monitoring & Operations

| Service | Purpose |
|---------|---------|
| CloudWatch | Logs, metrics, and alarms |
| X-Ray | Distributed tracing |
| Cost Explorer | Budget tracking and optimization |

### DynamoDB Schema Design

#### Table: `virale-users`

```
Partition Key: userId (String - UUID)

Attributes:
- email (String)
- name (String)
- avatarUrl (String)
- createdAt (String - ISO8601)
- updatedAt (String - ISO8601)

GSI: email-index (for login lookup)
- Partition Key: email
```

#### Table: `virale-campaigns`

```
Partition Key: userId (String)
Sort Key: campaignId (String - UUID)

Attributes:
- name (String)
- status (String: draft | active | paused | completed)
- budget (Number)
- spent (Number)
- market (String)
- category (String)
- content (String)
- adaptedContent (String)
- selectedInfluencers (List<String>)
- selectedTrends (List<String>)
- startDate (String - ISO8601)
- endDate (String - ISO8601)
- createdAt (String - ISO8601)
- updatedAt (String - ISO8601)

GSI: status-index
- Partition Key: userId
- Sort Key: status
```

#### Table: `virale-trends`

```
Partition Key: market (String)
Sort Key: trendId (String - UUID)

Attributes:
- name (String)
- badge (String)
- alignmentScore (Number: 0-100)
- timing (String)
- description (String)
- category (String)
- reach (Number)
- expiresAt (String - ISO8601)
- createdAt (String - ISO8601)

GSI: category-index
- Partition Key: category
- Sort Key: alignmentScore
```

#### Table: `virale-influencers`

```
Partition Key: market (String)
Sort Key: influencerId (String - UUID)

Attributes:
- handle (String)
- name (String)
- cost (Number)
- followers (Number)
- engagementRate (Number)
- niche (String)
- avatarUrl (String)
- createdAt (String - ISO8601)

GSI: cost-index
- Partition Key: market
- Sort Key: cost

GSI: niche-index
- Partition Key: niche
- Sort Key: cost
```

#### Table: `virale-analytics`

```
Partition Key: campaignId (String)
Sort Key: date (String - YYYY-MM-DD)

Attributes:
- impressions (Number)
- reach (Number)
- engagement (Number)
- clicks (Number)
- conversions (Number)
- createdAt (String - ISO8601)
```

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend (S3 + CloudFront)"
        A[HTML/CSS/JS] --> B[API Client]
        B --> C[Fallback Data]
    end
    
    subgraph "AWS API Gateway"
        D[/auth/*]
        E[/campaigns/*]
        F[/trends/*]
        G[/influencers/*]
        H[/content/*]
        I[/analytics/*]
    end
    
    subgraph "AWS Lambda"
        J[virale-auth]
        K[virale-campaigns]
        L[virale-trends]
        M[virale-influencers]
        N[virale-content]
        O[virale-analytics]
    end
    
    subgraph "Data Layer"
        P[(DynamoDB)]
        Q[(S3 Assets)]
        R[(ElastiCache)]
    end
    
    subgraph "AI Layer"
        S[Bedrock Claude 3.5]
        T[Bedrock Titan]
    end
    
    B --> D & E & F & G & H & I
    D --> J
    E --> K
    F --> L
    G --> M
    H --> N
    I --> O
    
    J --> P
    K --> P
    L --> P
    M --> P
    O --> P
    
    J --> R
    L --> R
    M --> R
    
    N --> S
    L --> T
    
    C -.->|Fallback if API fails| A
```

### API Gateway Endpoints

Base URL: `https://api.virale.app/v1`

#### Authentication (Cognito Integration)

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | `virale-auth` | User registration via Cognito |
| POST | `/auth/login` | `virale-auth` | User login, returns Cognito tokens |
| POST | `/auth/logout` | `virale-auth` | Invalidate session |
| POST | `/auth/refresh` | `virale-auth` | Refresh access token |
| GET | `/auth/me` | `virale-auth` | Get current user profile |

#### Campaigns

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/campaigns` | `virale-campaigns` | List user's campaigns |
| GET | `/campaigns/{id}` | `virale-campaigns` | Get campaign details |
| POST | `/campaigns` | `virale-campaigns` | Create new campaign |
| PUT | `/campaigns/{id}` | `virale-campaigns` | Update campaign |
| DELETE | `/campaigns/{id}` | `virale-campaigns` | Delete campaign |
| POST | `/campaigns/{id}/launch` | `virale-campaigns` | Launch campaign |
| POST | `/campaigns/{id}/pause` | `virale-campaigns` | Pause campaign |

#### Trends

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/trends` | `virale-trends` | List trends with filters |
| GET | `/trends/{id}` | `virale-trends` | Get trend details |
| GET | `/trends/recommended` | `virale-trends` | Get AI-matched trends for campaign |

Query Parameters for `/trends`:
- `market` (required): Target market (e.g., "brazil")
- `category` (optional): Product category
- `minAlignment` (optional): Minimum alignment score
- `limit` (optional): Number of results (default: 10)

#### Influencers

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/influencers` | `virale-influencers` | List influencers with filters |
| GET | `/influencers/{id}` | `virale-influencers` | Get influencer details |
| GET | `/influencers/recommended` | `virale-influencers` | Get budget-matched influencers |
| POST | `/influencers/compare` | `virale-influencers` | Compare up to 3 influencers |

Query Parameters for `/influencers`:
- `market` (required): Target market
- `minBudget` (optional): Minimum cost
- `maxBudget` (optional): Maximum cost
- `niche` (optional): Influencer niche
- `minFollowers` (optional): Minimum follower count
- `limit` (optional): Number of results (default: 10)

#### Content Adaptation (Bedrock Integration)

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| POST | `/content/adapt` | `virale-content` | AI-powered content localization |
| POST | `/content/hashtags` | `virale-content` | Get trending hashtag suggestions |
| POST | `/content/alignment` | `virale-content` | Calculate trend-brand alignment |

Request Body for `/content/adapt`:
```json
{
  "originalContent": "Crush your summer goals!",
  "targetMarket": "brazil",
  "category": "fitness",
  "brandTone": "energetic"
}
```

Response:
```json
{
  "adaptedContent": "Bora arrasar nesse verão! 💪",
  "language": "Portuguese (Brazil)",
  "culturalElements": ["Bora (Let's go)", "arrasar (crush it)"],
  "suggestedHashtags": ["#DesafioVerão", "#FitnessBrasil"],
  "projectedEngagementLift": 240,
  "confidence": 0.92
}
```

#### Analytics

| Method | Endpoint | Lambda | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/dashboard` | `virale-analytics` | Dashboard summary metrics |
| GET | `/analytics/campaign/{id}` | `virale-analytics` | Campaign-specific analytics |
| GET | `/analytics/export` | `virale-analytics` | Export as CSV |

### Frontend Architecture (React)

The application uses a modern React architecture with functional components and hooks:

```
/
├── public/
│   └── data/
│       ├── fallback-trends.json
│       ├── fallback-influencers.json
│       ├── fallback-campaigns.json
│       ├── fallback-analytics.json
│       └── fallback-adaptations.json
│
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Root component with routing
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── BudgetSlider.jsx
│   │   │   ├── TrendCard.jsx
│   │   │   ├── InfluencerCard.jsx
│   │   │   ├── Chart.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSkeleton.jsx
│   │   │
│   │   └── wizard/
│   │       ├── WizardStepper.jsx
│   │       ├── StepBudgetGoals.jsx
│   │       ├── StepTargetMarket.jsx
│   │       ├── StepContent.jsx
│   │       ├── StepInfluencers.jsx
│   │       └── StepReview.jsx
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CreateCampaignPage.jsx
│   │   ├── TrendsPage.jsx
│   │   ├── InfluencersPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   └── CampaignDetailsPage.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCampaigns.js
│   │   ├── useTrends.js
│   │   ├── useInfluencers.js
│   │   ├── useAnalytics.js
│   │   └── useContentAdaptation.js
│   │
│   ├── services/
│   │   ├── api.js              # API client with fallback
│   │   ├── auth.js             # Cognito authentication
│   │   ├── campaignService.js
│   │   ├── trendService.js
│   │   ├── influencerService.js
│   │   ├── contentService.js
│   │   └── analyticsService.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CampaignContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   └── styles/
│       ├── global.css
│       ├── variables.css
│       └── components/
│           ├── Navigation.module.css
│           ├── BudgetSlider.module.css
│           ├── TrendCard.module.css
│           └── InfluencerCard.module.css
│
├── index.html
├── package.json
├── vite.config.js
└── .env
```

### React Component Architecture

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import TrendsPage from './pages/TrendsPage';
import InfluencersPage from './pages/InfluencersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CampaignDetailsPage from './pages/CampaignDetailsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CampaignProvider>
          <BrowserRouter>
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
          </BrowserRouter>
        </CampaignProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### API Client with Silent Fallback (React)

```javascript
// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'https://api.virale.app/v1';
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

class APIClient {
  constructor() {
    this.fallbackData = {};
    this.isOnline = true;
    this.pendingQueue = [];
    this.loadFallbackData();
  }

  async loadFallbackData() {
    // Pre-load all fallback data on app init
    const files = ['trends', 'influencers', 'campaigns', 'analytics', 'adaptations'];
    for (const file of files) {
      const response = await fetch(`/data/fallback-${file}.json`);
      this.fallbackData[file] = await response.json();
    }
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`,
            ...options.headers
          }
        });

        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        this.isOnline = true;
        return await response.json();

      } catch (error) {
        if (attempt === MAX_RETRIES) {
          // Silent fallback - no error shown to user
          this.isOnline = false;
          return this.getFallback(endpoint, options);
        }
        await this.delay(1000 * (attempt + 1)); // Exponential backoff
      }
    }
  }

  getFallback(endpoint, options) {
    // Return appropriate fallback data based on endpoint
    // User never sees any indication of fallback mode
    if (endpoint.startsWith('/trends')) return this.fallbackData.trends;
    if (endpoint.startsWith('/influencers')) return this.fallbackData.influencers;
    if (endpoint.startsWith('/campaigns')) return this.fallbackData.campaigns;
    if (endpoint.startsWith('/analytics')) return this.fallbackData.analytics;
    if (endpoint.startsWith('/content')) return this.fallbackData.adaptations;
    return null;
  }

  // Queue mutations for later sync
  queueMutation(endpoint, options) {
    this.pendingQueue.push({ endpoint, options, timestamp: Date.now() });
    localStorage.setItem('pendingQueue', JSON.stringify(this.pendingQueue));
  }

  // Sync queued mutations when back online
  async syncPendingMutations() {
    if (!this.isOnline || this.pendingQueue.length === 0) return;

    for (const item of this.pendingQueue) {
      try {
        await this.request(item.endpoint, item.options);
        this.pendingQueue.shift();
      } catch (e) {
        break; // Stop if sync fails
      }
    }
    localStorage.setItem('pendingQueue', JSON.stringify(this.pendingQueue));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getToken() {
    return localStorage.getItem('accessToken') || '';
  }
}

export const api = new APIClient();
```

### Cognito Authentication Hook

```javascript
// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
        } else {
          setUser({
            username: cognitoUser.getUsername(),
            token: session.getAccessToken().getJwtToken()
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (result) => {
          localStorage.setItem('accessToken', result.getAccessToken().getJwtToken());
          localStorage.setItem('idToken', result.getIdToken().getJwtToken());
          localStorage.setItem('refreshToken', result.getRefreshToken().getToken());
          setUser({
            username: email,
            token: result.getAccessToken().getJwtToken()
          });
          resolve(result);
        },
        onFailure: reject
      });
    });
  };

  const logout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Custom Hook Example

```javascript
// src/hooks/useTrends.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTrends = (filters = {}) => {
  return useQuery({
    queryKey: ['trends', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      return await api.request(`/trends?${params}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!filters.market // Only fetch if market is selected
  });
};

export const useTrendDetails = (trendId) => {
  return useQuery({
    queryKey: ['trend', trendId],
    queryFn: async () => {
      return await api.request(`/trends/${trendId}`);
    },
    enabled: !!trendId
  });
};
```

### Data Flow

1. **User Navigation**: User clicks navigation links triggering React Router
2. **Component Mount**: React component mounts and runs useEffect hooks
3. **Authentication Check**: Cognito token validation via AuthContext
4. **Data Fetching**: TanStack Query triggers API calls with caching
5. **API Gateway**: HTTP requests routed to appropriate Lambda function
6. **Lambda Execution**: Serverless function processes request
7. **Database Operations**: Lambda queries/updates DynamoDB tables
8. **AI Processing**: Content adaptation requests sent to AWS Bedrock
9. **Caching**: ElastiCache stores frequently accessed data
10. **Response Handling**: TanStack Query receives data or silently uses fallback
11. **React Re-render**: Component state updates trigger UI re-render
12. **Offline Queue**: Mutations queued for sync when backend unavailable

## Page Designs

### Landing Page

**Purpose**: First impression and user acquisition
**Route**: `/` or `/home`

**Layout**:
- Full-width hero section with animated gradient background
- Feature cards in 3-column grid (desktop) / single column (mobile)
- Social proof section with statistics
- Call-to-action section with "Get Started" button
- Footer with links

**Key Elements**:
- Hero headline: "Go Viral with Bharat Brands"
- Subheadline: "Connect with trending opportunities and influencers across global markets"
- Animated statistics: "10K+ Campaigns", "500+ Influencers", "50+ Markets"
- Feature cards: Budget Optimization, Trend Matching, Global Reach, Real-time Analytics
- Professional blue gradient background in hero
- Clean, structured layout with clear hierarchy

### Dashboard Page

**Purpose**: Campaign overview and quick actions
**Route**: `/dashboard`

**Layout**:
- 4-column metric cards at top (desktop) / 2-column (mobile)
- Campaign list with status indicators
- Performance chart (line graph)
- Trending opportunities sidebar
- Quick action floating button

**Key Elements**:
- Metric cards: Active Campaigns, Total Reach, Engagement Rate, Budget Spent
- Campaign cards with: Name, Status, Budget, Performance indicator
- Chart showing 30-day performance trend
- "Create Campaign" floating action button

### Create Campaign Page

**Purpose**: Multi-step campaign creation wizard
**Route**: `/campaigns/create`

**Layout**:
- Progress stepper at top showing 5 steps
- Main content area for current step
- Navigation buttons: Back, Next, Save Draft
- Sidebar with campaign summary (desktop only)

**Steps**:
1. **Budget & Goals**: Budget slider, campaign objectives, duration
2. **Target Market**: Market selection, category, audience demographics
3. **Content Creation**: Content input, AI adaptation preview, hashtag suggestions
4. **Influencer Selection**: Filtered influencer grid, comparison tool, selection
5. **Review & Launch**: Campaign summary, cost breakdown, launch button

### Trends Explorer Page

**Purpose**: Browse and discover trending opportunities
**Route**: `/trends`

**Layout**:
- Filter panel on left (desktop) / collapsible (mobile)
- Trend grid in main area (3 columns desktop / 1 column mobile)
- Search bar at top
- Sort dropdown: Alignment, Recency, Popularity

**Key Elements**:
- Filters: Market, Category, Time Range, Alignment Score
- Trend cards with: Badge, Title, Alignment bar, Timing, Reach metrics
- Click to expand for detailed view with analytics

### Influencer Marketplace Page

**Purpose**: Browse and compare influencers
**Route**: `/influencers`

**Layout**:
- Filter panel on left (desktop) / collapsible (mobile)
- Influencer grid in main area (4 columns desktop / 2 columns mobile)
- Search bar at top
- Sort dropdown: Cost, Followers, Engagement
- Comparison bar at bottom (when influencers selected)

**Key Elements**:
- Filters: Budget Range, Niche, Follower Count, Engagement Rate, Market
- Influencer cards with: Profile, Handle, Cost, Metrics, Niche tags
- Checkbox for comparison (max 3)
- Comparison modal with side-by-side metrics

### Analytics Page

**Purpose**: Campaign performance analysis
**Route**: `/analytics`

**Layout**:
- Date range selector at top
- Campaign selector dropdown
- 4 metric cards
- 2-column chart layout (desktop) / stacked (mobile)
- Export button

**Key Elements**:
- Charts: Reach over time, Engagement by platform, Geographic distribution, Audience demographics
- Metric cards: Total Impressions, Click-through Rate, Conversion Rate, ROI
- Comparative analysis table
- Export to PDF/CSV functionality

### Campaign Details Page

**Purpose**: View and manage specific campaign
**Route**: `/campaigns/:id`

**Layout**:
- Campaign header with status badge
- 3-column layout: Overview, Performance, Actions (desktop) / stacked (mobile)
- Timeline of events
- Content variations section
- Action buttons: Edit, Pause, Stop, Duplicate

**Key Elements**:
- Overview: Budget, Duration, Markets, Status
- Performance: Real-time metrics, engagement chart
- Selected trends and influencers
- Content adaptations by market
- Event timeline with key milestones

## Components and Interfaces

### Core Components

#### Budget Slider Component

**Purpose**: Primary input control for campaign budget selection
**Props**:
- `min`: number (5000)
- `max`: number (500000)
- `value`: number (current budget)
- `onChange`: function (budget update handler)
- `ticks`: array of tick mark values

**State**:
- `currentBudget`: number
- `displayValue`: string (formatted currency)

**Behavior**:
- Real-time value updates as user drags slider
- Automatic currency formatting (₹X,XXX)
- Tick marks at specified intervals
- Mobile-optimized large thumb control
- Gradient track with smooth transitions

#### Trend Card Component

**Purpose**: Display trending opportunities with alignment visualization
**Props**:
- `trend`: object containing name, alignment, timing, badge
- `alignmentPercentage`: number (0-100)

**Structure**:
```typescript
interface Trend {
  id: string;
  name: string;
  badge: string;
  alignmentPercentage: number;
  timing: string;
  description: string;
}
```

**Visual Elements**:
- Clean white card with subtle shadow
- Trend badge with solid background
- Title with hashtag formatting
- Solid color alignment progress bar
- Contextual timing information with icons

#### Influencer Card Component

**Purpose**: Display budget-matched influencer recommendations
**Props**:
- `influencer`: object containing profile, metrics, cost
- `isWithinBudget`: boolean

**Structure**:
```typescript
interface Influencer {
  id: string;
  handle: string;
  cost: number;
  followers: number;
  engagement: number;
  niche: string;
  avatarUrl: string;
}
```

**Visual Elements**:
- Circular profile with clean border
- Handle with @ prefix
- Budget tag with solid background
- Follower and engagement metrics with icons
- Niche specialization tags with modern styling

### Layout Components

#### Navigation Component

**Desktop Navigation**:
- Horizontal bar with logo on left
- Navigation links in center: Dashboard, Create, Trends, Influencers, Analytics
- User menu on right with avatar and dropdown
- Clean white background with subtle shadow
- Active link highlighted with blue underline

**Mobile Navigation**:
- Hamburger menu icon on left
- Logo in center
- User avatar on right
- Slide-in menu overlay with full-screen navigation
- Smooth open/close animations

#### Page Layout Engine

**Desktop Layout (1200px+)**:
- Full-width navigation bar (sticky)
- Content area with max-width 1400px, centered
- Sidebar layouts where applicable (filters, summaries)
- Footer at bottom

**Tablet Layout (768px-1199px)**:
- Collapsible sidebars
- 2-column grids instead of 3-4 columns
- Adjusted spacing and padding

**Mobile Layout (<768px)**:
- Hamburger navigation
- Single-column layouts
- Full-width cards
- Sticky action buttons
- Reduced spacing for content density

## Data Models

### Application State Model (Frontend)

```typescript
interface AppState {
  // User session
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    token: string;
  } | null;
  
  // Navigation state
  currentRoute: string;
  previousRoute: string;
  
  // Global filters
  selectedMarket: string;
  selectedCategory: string;
  
  // Campaign creation state (persisted across steps)
  campaignDraft: {
    budget: number;
    goals: string[];
    market: string;
    category: string;
    content: string;
    selectedInfluencers: string[];
    selectedTrends: string[];
    currentStep: number;
  };
  
  // Dashboard state
  campaigns: Campaign[];
  metrics: DashboardMetrics;
  
  // Trends state
  trends: Trend[];
  trendFilters: TrendFilters;
  
  // Influencers state
  influencers: Influencer[];
  influencerFilters: InfluencerFilters;
  selectedForComparison: string[];
  
  // Analytics state
  analyticsData: AnalyticsData;
  selectedCampaignId: string;
  dateRange: DateRange;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  markets: string[];
  performance: {
    reach: number;
    engagement: number;
    conversions: number;
  };
}

interface DashboardMetrics {
  activeCampaigns: number;
  totalReach: number;
  engagementRate: number;
  budgetSpent: number;
}
```

### Backend Data Models

#### API Request/Response Models

```typescript
// Authentication
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

// Campaign
interface CreateCampaignRequest {
  name: string;
  budget: number;
  markets: string[];
  category: string;
  content: string;
  selectedTrends: string[];
  selectedInfluencers: string[];
  startDate: string;
  endDate: string;
}

interface CampaignResponse {
  campaignId: string;
  userId: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  markets: string[];
  category: string;
  content: string;
  selectedTrends: TrendSummary[];
  selectedInfluencers: InfluencerSummary[];
  createdAt: string;
  updatedAt: string;
}

// Content Adaptation
interface AdaptContentRequest {
  content: string;
  targetMarket: string;
  category: string;
}

interface AdaptContentResponse {
  original: string;
  adapted: string;
  language: string;
  culturalElements: string[];
  projectedEngagement: number;
  confidence: number;
}
```

### Sample Data Models

#### Trend Data Structure

```typescript
interface TrendData {
  fitness_brazil: Trend[];
  // Additional category-market combinations for future expansion
}

const sampleTrends = {
  fitness_brazil: [
    {
      id: "verao-fitness",
      name: "#VerãoFitness Challenge",
      badge: "Fitness Trend",
      alignmentPercentage: 92,
      timing: "Hot in São Paulo • 24h peak window",
      description: "Summer fitness challenge trending across Brazil"
    },
    {
      id: "samba-workout",
      name: "Samba Workout Challenge",
      badge: "Dance Fitness",
      alignmentPercentage: 87,
      timing: "Rising in Rio • 48h window",
      description: "Dance-based fitness combining traditional samba moves"
    },
    {
      id: "beach-protein",
      name: "Beach Protein Shake Trend",
      badge: "Nutrition",
      alignmentPercentage: 84,
      timing: "Peak in coastal cities • 72h window",
      description: "Post-workout nutrition trend at beach locations"
    }
  ]
};
```

#### Influencer Data Structure

```typescript
const sampleInfluencers = {
  fitness_brazil: [
    {
      id: "fit-brazil",
      handle: "@FitBrazil",
      cost: 8500,
      followers: 28000,
      engagement: 12,
      niche: "Fitness • Beach Workouts",
      avatarUrl: "/assets/avatars/placeholder-user.svg"
    },
    {
      id: "sao-paulo-gym",
      handle: "@SaoPauloGym",
      cost: 9200,
      followers: 35000,
      engagement: 10,
      niche: "Urban Fitness • Gym Culture",
      avatarUrl: "/assets/avatars/placeholder-fitness.svg"
    },
    {
      id: "rio-wellness",
      handle: "@RioWellness",
      cost: 7800,
      followers: 22000,
      engagement: 15,
      niche: "Wellness • Outdoor Training",
      avatarUrl: "/assets/avatars/placeholder-wellness.svg"
    }
  ]
};
```

#### Content Adaptation Model

```typescript
interface AdaptedContent {
  original: string;
  adapted: string;
  language: string;
  culturalElements: string[];
  projectedEngagement: number;
}

const contentAdaptation = {
  "Crush your summer goals!": {
    original: "Crush your summer goals!",
    adapted: "Bora arrasar nesse verão! 💪 #DesafioVerão",
    language: "Portuguese (Brazil)",
    culturalElements: ["Bora" (Let's go), "arrasar" (crush it), local hashtag],
    projectedEngagement: 240
  }
};
```

## Visual Design System

### Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Deep Blue | #1E3A8A | Primary buttons, headers, key actions |
| Professional Blue | #3B82F6 | Links, interactive elements, highlights |
| Slate Gray | #475569 | Secondary text, borders |
| Light Gray | #F1F5F9 | Background, subtle sections |
| White | #FFFFFF | Card backgrounds, main content areas |
| Success Green | #10B981 | Success states, positive metrics |
| Warning Orange | #F59E0B | Alerts, important notices |
| Error Red | #EF4444 | Errors, critical actions |
| Accent Teal | #0891B2 | Secondary accents, data visualization |
| Text Primary | #0F172A | Main text content |
| Text Secondary | #64748B | Supporting text, captions |
| Text Muted | #94A3B8 | Placeholder text, disabled states |
| Border Light | #E2E8F0 | Card borders, dividers |
| Border Medium | #CBD5E1 | Input borders, separators |
| Shadow | rgba(15, 23, 42, 0.08) | Card shadows, depth |

### Typography

**Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Font Sizes**:
- Header: 28px (desktop), 24px (mobile)
- Subheader: 20px (desktop), 18px (mobile)
- Card Title: 18px (desktop), 16px (mobile)
- Body Text: 15px (desktop), 14px (mobile)
- Caption: 13px (desktop), 12px (mobile)
- Button Text: 15px (all devices)

**Font Weights**:
- Headers: 700 (bold)
- Subheaders: 600 (semi-bold)
- Card Titles: 600 (semi-bold)
- Body Text: 400 (regular)
- Captions: 400 (regular)
- Buttons: 600 (semi-bold)
- Labels: 500 (medium)

**Line Heights**:
- Headers: 1.2
- Body Text: 1.5
- Captions: 1.4

### Component Styling

#### Page Background Styling

```css
body {
  background: #F8FAFC;
  min-height: 100vh;
  color: #0F172A;
}

.page-container {
  background: transparent;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
  border-radius: 12px;
  padding: 80px 40px;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(30, 58, 138, 0.15);
  color: #FFFFFF;
}
```

#### Navigation Styling

```css
.navigation {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  padding: 16px 32px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.nav-link {
  color: #64748B;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
}

.nav-link:hover {
  color: #1E3A8A;
  background: #F1F5F9;
}

.nav-link.active {
  color: #1E3A8A;
  background: #EFF6FF;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -17px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3B82F6;
}

@media (max-width: 767px) {
  .navigation {
    padding: 12px 16px;
  }
  
  .nav-menu {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    background: #FFFFFF;
    transition: left 0.3s ease;
    padding: 80px 24px 24px;
    box-shadow: 4px 0 12px rgba(15, 23, 42, 0.1);
  }
  
  .nav-menu.open {
    left: 0;
  }
}
```

#### Budget Slider Styling

```css
.budget-slider {
  width: 100%;
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  position: relative;
}

.budget-slider-thumb {
  width: 20px;
  height: 20px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 2px solid #FFFFFF;
}

.budget-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  background: #1E3A8A;
}

.budget-slider-track {
  height: 6px;
  background: #3B82F6;
  border-radius: 3px;
  transition: all 0.3s ease;
}

@media (max-width: 1199px) {
  .budget-slider-thumb {
    width: 28px;
    height: 28px;
  }
}
```

#### Card Styling

```css
.trend-card, .influencer-card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #E2E8F0;
  margin-bottom: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.trend-card:hover, .influencer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  border-color: #CBD5E1;
}

.alignment-bar {
  width: 100%;
  height: 6px;
  background: #E2E8F0;
  border-radius: 3px;
  overflow: hidden;
}

.alignment-bar-fill {
  height: 100%;
  background: #3B82F6;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
}

.alignment-bar-fill.high-alignment {
  background: #10B981;
}
```

#### Button Styling

```css
.generate-button {
  background: #3B82F6;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
}

.generate-button:hover {
  background: #1E3A8A;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.generate-button:active {
  transform: translateY(1px);
}

.generate-button.secondary {
  background: #FFFFFF;
  color: #3B82F6;
  border: 1px solid #3B82F6;
}

.generate-button.secondary:hover {
  background: #EFF6FF;
}

@media (max-width: 1199px) {
  .generate-button {
    position: sticky;
    bottom: 20px;
    width: calc(100% - 40px);
    margin: 20px;
    padding: 14px 24px;
  }
}
```

### Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px

### Layout Grid

**Desktop Grid**:
- Container: 1400px max-width, centered
- Navigation: Full-width, sticky
- Content area: 1400px with 32px side padding
- Card grids: 3-4 columns with 24px gaps
- Sidebar: 300px width when present

**Tablet Grid**:
- Container: 100% width with 24px side margins
- Card grids: 2 columns with 20px gaps
- Sidebar: Collapsible or bottom-positioned

**Mobile Grid**:
- Container: 100% width with 20px side margins
- Single column layout
- 16px vertical spacing between sections
- Full-width cards

### Routing System

**Client-Side Routes**:
- `/` - Landing Page
- `/dashboard` - Dashboard Overview
- `/campaigns/create` - Create Campaign Wizard
- `/campaigns/:id` - Campaign Details
- `/trends` - Trends Explorer
- `/influencers` - Influencer Marketplace
- `/analytics` - Analytics Dashboard

**Route Transitions**:
- Fade transition between pages (0.3s)
- Maintain scroll position for back navigation
- Loading state for data-heavy pages
- 404 page for invalid routes

**Navigation Guards**:
- Redirect to landing if not authenticated
- Preserve form state when navigating away
- Confirm before leaving unsaved changes

### Animation System

**Page Transitions**:
- Fade in/out: 0.2s ease
- Slide transitions for mobile menu: 0.3s ease
- Route changes: Subtle fade

**Component Transitions**:
- Card hover: 0.2s ease with subtle lift
- Button interactions: 0.15s ease
- Slider movements: 0.3s ease
- Content reveals: 0.3s ease with fade
- Modal open/close: 0.25s ease

**Keyframe Animations**:
- Fade-in: opacity 0 to 1 over 0.3s
- Slide-up: translateY(10px) to 0 over 0.3s
- Minimal animations for professional feel

**Loading States**:
- Skeleton screens with subtle shimmer in gray tones
- Spinner with blue color for data loading
- Progress bars with solid blue fills for multi-step processes

**Micro-interactions**:
- Button press: slight scale down (0.98)
- Icon hover: color change only
- Card selection: border color change
- Input focus: blue border

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis and property reflection to eliminate redundancy, the following properties validate the core behaviors of the Virale system:

### Property 1: Navigation consistency across pages
*For any* valid route navigation, the system should update the URL, render the correct page component, and highlight the active navigation link
**Validates: Requirements 1.3, 1.4**

### Property 2: State persistence across page transitions
*For any* page navigation, user session data and global filters should be preserved and accessible on the new page
**Validates: Requirements 1.6**

### Property 3: Budget slider real-time synchronization
*For any* valid budget value within the slider range, moving the slider to that position should immediately update the displayed budget text to match the slider position with proper currency formatting
**Validates: Requirements 4.2, 4.5**

### Property 4: Budget-based influencer filtering
*For any* selected budget value, all displayed influencer recommendations should have costs within 20% of the selected budget, and the recommendations should update immediately when the budget changes
**Validates: Requirements 4.3, 9.3, 9.5**

### Property 5: Multi-step wizard progress preservation
*For any* step in the campaign creation wizard, navigating forward or backward should preserve all previously entered data
**Validates: Requirements 15.3, 15.4**

### Property 6: Dropdown state consistency
*For any* combination of category and market selections, the system should maintain these selections throughout the session and update all recommendations (trends and influencers) to match the selected filters
**Validates: Requirements 5.3, 5.4, 5.5**

### Property 7: Trend card completeness
*For any* displayed trend card, it should contain all required elements: trend badge, title, alignment bar with solid color visualization, and contextual timing information
**Validates: Requirements 7.2, 7.4**

### Property 8: High-alignment trend emphasis
*For any* trend with alignment percentage above 90%, the system should apply visual emphasis to distinguish it from lower-alignment trends
**Validates: Requirements 7.5**

### Property 9: Influencer card completeness
*For any* displayed influencer card, it should contain all required elements: profile placeholder, handle, budget tag, follower metrics, engagement rate, and niche information
**Validates: Requirements 9.2, 9.4**

### Property 10: Content adaptation consistency
*For any* input content and target market combination, the adapted content should maintain the core message while applying appropriate language localization, cultural references, and market-specific hashtags
**Validates: Requirements 10.2, 10.4, 10.5**

### Property 11: Touch target accessibility
*For any* interactive element on mobile devices, the touch target should be at least 44px in both width and height to ensure accessibility compliance
**Validates: Requirements 12.5**

### Property 12: Professional card visual consistency
*For any* trend or influencer card, it should have clean white background with subtle shadows, professional borders, and minimal hover animations
**Validates: Requirements 13.4**

### Property 13: Responsive navigation behavior
*For any* screen size below 768px, the navigation should display as a hamburger menu, and above 768px should display as a horizontal navigation bar
**Validates: Requirements 1.5, 12.2**

### Property 14: Campaign draft auto-save
*For any* input change in the campaign creation wizard, the draft should be automatically saved to state within 2 seconds
**Validates: Requirements 15.3**

### Property 15: Filter application consistency
*For any* combination of filters applied on the Trends or Influencers page, the displayed results should match all active filter criteria
**Validates: Requirements 6.2, 8.2**

### Property 16: Cross-device header/footer visibility
*For any* screen size or device orientation, the header navigation and footer should remain visible and properly formatted
**Validates: Requirements 17.4**

## Error Handling

### Input Validation Strategies

**Budget Slider Constraints**:
- Automatic clamping to valid range (₹5,000 - ₹500,000)
- Graceful handling of invalid programmatic values
- Fallback to default budget (₹25,000) on initialization errors

**Dropdown Selection Validation**:
- Default selection enforcement (Fitness, Brazil)
- Invalid option rejection with fallback to defaults
- State recovery mechanisms for corrupted selections

**Content Input Sanitization**:
- Maximum character limit enforcement (500 characters)
- Special character encoding for safe display
- Empty input handling with placeholder suggestions

### API Error Handling

**Missing Data Scenarios**:
- Fallback trend data when category-market combination unavailable
- Default influencer set when budget filtering returns empty results
- Generic content adaptation when AWS Bedrock is unavailable

**Data Integrity Checks**:
- Validation of API response structure on load
- Graceful degradation when required fields missing
- Error boundary implementation for component-level failures

### User Experience Error Recovery

**Graceful Degradation**:
- Partial functionality when some features fail
- Clear error messaging without technical jargon
- Automatic retry mechanisms for transient issues

**State Recovery**:
- Session state persistence across page refreshes
- Input value recovery after errors
- Consistent UI state regardless of error conditions

## Testing Strategy

The testing approach for Virale combines unit tests for specific component behaviors with property-based tests for universal system properties, ensuring comprehensive coverage of the production application.

### Unit Testing Focus

**Component-Specific Testing**:
- Budget slider initialization with correct range and tick marks
- Dropdown population with required options (Fitness, Brazil)
- Card rendering with exact count requirements (3 trends, 3 influencers)
- Button click behavior for campaign generation
- Responsive layout switching at breakpoints
- Color scheme compliance for design system elements
- Animation triggers and smooth transitions

**Integration Testing**:
- Complete user workflow from input to campaign generation
- State management across components
- API integration and data flow
- Cross-device layout consistency
- Error boundary behavior and recovery
- Animation sequences and timing

### Property-Based Testing Configuration

**Testing Framework**: Fast-check for JavaScript/TypeScript property-based testing
**Test Configuration**: Minimum 100 iterations per property test to ensure comprehensive input coverage
**Test Tagging**: Each property test tagged with format: **Feature: virale, Property {number}: {property_text}**

**Property Test Implementation Requirements**:
- Each correctness property must be implemented as a single property-based test
- Tests must generate random valid inputs within specified constraints
- Property validation must be deterministic and repeatable
- Test failures must provide clear counterexamples for debugging

### Testing Balance

**Unit Tests (30% of test effort)**:
- Specific examples demonstrating correct behavior
- Edge cases and boundary conditions
- Error handling scenarios
- Integration points between components

**Property Tests (70% of test effort)**:
- Universal behaviors across all valid inputs
- Comprehensive input space coverage through randomization
- System invariants and consistency rules
- Cross-component interaction validation

This balanced approach ensures that specific requirements are validated through concrete examples while universal system behaviors are thoroughly tested across the entire input space, providing confidence in the application's reliability and correctness.
