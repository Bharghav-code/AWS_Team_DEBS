# ⚛️ Frontend Documentation — Virale

## Overview

The Virale frontend is a **React 18+ Single Page Application** built with Vite, designed as a mobile-first, performance-optimized interface that works seamlessly on 3G networks. It features client-side routing, server state caching, and a silent fallback system for uninterrupted user experience.

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18+ | UI framework with hooks |
| Vite | 5+ | Build tool, dev server, HMR |
| React Router | v6 | Client-side routing |
| TanStack Query | v5 | Server state management & caching |
| React Context | Built-in | Global app state (Auth, Campaign, Theme) |
| CSS Modules | Built-in | Scoped component styling |
| Lucide React | Latest | Consistent SVG icon library |
| Recharts | Latest | Chart/data visualization |
| amazon-cognito-identity-js | Latest | AWS Cognito authentication |

---

## Project Structure

```
src/
├── main.jsx                    # App entry point, React DOM render
├── App.jsx                     # Root component with routing & providers
│
├── components/
│   ├── layout/
│   │   ├── Navigation.jsx      # Global nav bar (desktop + mobile hamburger)
│   │   ├── Header.jsx          # App header with logo & AWS badge
│   │   └── Footer.jsx          # Footer with "Powered by AWS"
│   │
│   ├── common/
│   │   ├── BudgetSlider.jsx    # Budget input (₹5K–₹5L) with real-time updates
│   │   ├── TrendCard.jsx       # Trend display with alignment bar
│   │   ├── InfluencerCard.jsx  # Influencer profile with metrics
│   │   ├── Chart.jsx           # Reusable Recharts wrapper
│   │   ├── Modal.jsx           # Reusable modal dialog
│   │   └── LoadingSkeleton.jsx # Shimmer loading states
│   │
│   ├── wizard/
│   │   ├── WizardStepper.jsx   # Progress indicator (5 steps)
│   │   ├── StepBudgetGoals.jsx # Step 1: Budget & campaign goals
│   │   ├── StepTargetState.jsx # Step 2: State (dropdown) & category selection
│   │   ├── StepContent.jsx     # Step 3: Content + AI adaptation
│   │   ├── StepInfluencers.jsx # Step 4: Influencer selection
│   │   └── StepReview.jsx      # Step 5: Review & launch
│   │
│   └── ProtectedRoute.jsx     # Auth guard for protected pages
│
├── pages/
│   ├── LandingPage.jsx         # Hero, features, social proof, CTA
│   ├── LoginPage.jsx           # Cognito login form
│   ├── RegisterPage.jsx        # Cognito registration form
│   ├── DashboardPage.jsx       # Metrics, campaigns, quick actions
│   ├── CreateCampaignPage.jsx  # Multi-step wizard container
│   ├── CampaignDetailsPage.jsx # Individual campaign view
│   ├── TrendsPage.jsx          # Trend explorer with filters
│   ├── InfluencersPage.jsx     # Influencer marketplace
│   └── AnalyticsPage.jsx       # Performance charts & exports
│
├── hooks/
│   ├── useAuth.js              # Authentication state & methods
│   ├── useCampaigns.js         # Campaign CRUD operations
│   ├── useTrends.js            # Trend data fetching & filtering
│   ├── useInfluencers.js       # Influencer data fetching
│   ├── useAnalytics.js         # Analytics data fetching
│   └── useContentAdaptation.js # Bedrock content adaptation
│
├── services/
│   ├── api.js                  # API client with silent fallback
│   ├── auth.js                 # Cognito auth service layer
│   ├── campaignService.js      # Campaign API operations
│   ├── trendService.js         # Trends API operations
│   ├── influencerService.js    # Influencer API operations
│   ├── contentService.js       # Content adaptation API
│   └── analyticsService.js     # Analytics API operations
│
├── context/
│   ├── AuthContext.jsx          # User session & token management
│   ├── CampaignContext.jsx      # Campaign draft state
│   └── ThemeContext.jsx         # Theme preferences
│
├── utils/
│   ├── formatters.js           # Currency, number, date formatters
│   ├── validators.js           # Form validation rules
│   └── constants.js            # App-wide constants, routes, config
│
└── styles/
    ├── global.css              # Global resets & base styles
    ├── variables.css           # CSS custom properties (design tokens)
    └── components/
        ├── Navigation.module.css
        ├── BudgetSlider.module.css
        ├── TrendCard.module.css
        └── InfluencerCard.module.css
```

---

## Routing Configuration

```jsx
// App.jsx — Route Structure
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected Routes (require Cognito auth) */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/campaigns/create" element={<CreateCampaignPage />} />
      <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
      <Route path="/trends" element={<TrendsPage />} />
      <Route path="/influencers" element={<InfluencersPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
    </Route>

    {/* Catch-all redirect */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

---

## State Management

### Architecture

```
┌─────────────────────────────────────────────┐
│            React Context Providers          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ AuthCtx  │ │ Campaign │ │  ThemeCtx   │ │
│  │          │ │  Context │ │             │ │
│  │ user     │ │ draft    │ │ darkMode    │ │
│  │ tokens   │ │ wizard   │ │ preferences │ │
│  │ login()  │ │ save()   │ │             │ │
│  │ logout() │ │ reset()  │ │             │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
├─────────────────────────────────────────────┤
│         TanStack Query (Server State)       │
│  ┌──────────────────────────────────────┐   │
│  │ Cached: trends, influencers,         │   │
│  │         campaigns, analytics         │   │
│  │ Stale time: 5 min                    │   │
│  │ Cache time: 10 min                   │   │
│  │ Auto-refetch on reconnect            │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### TanStack Query Configuration

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 2,                       // Retry twice before fallback
      refetchOnWindowFocus: false,    // Don't refetch on tab focus
    }
  }
});
```

---

## Silent Fallback System

The frontend includes a **completely invisible** fallback mechanism. When API calls fail, pre-loaded JSON data is served seamlessly:

```
public/data/
├── fallback-trends.json        # Pre-computed trend data
├── fallback-influencers.json   # Sample influencer profiles
├── fallback-campaigns.json     # Demo campaign data
├── fallback-analytics.json     # Sample analytics
└── fallback-adaptations.json   # Pre-computed content adaptations
```

**How it works:**
1. App initializes → loads all fallback JSON into memory
2. API request fails after 2 retries (5s timeout each)
3. API client silently returns matching fallback data
4. User sees data normally — no error indicators whatsoever
5. Write operations are queued in `localStorage` for sync

---

## Key Component APIs

### BudgetSlider

```jsx
<BudgetSlider
  min={5000}
  max={500000}
  value={budget}
  onChange={(value) => setBudget(value)}
  ticks={[5000, 10000, 50000, 100000, 500000]}
/>
```

### TrendCard

```jsx
<TrendCard
  trend={{
    id: "mumbai-fitness",
    name: "#MumbaiFitness Challenge",
    badge: "Fitness Trend",
    alignmentPercentage: 92,
    timing: "Hot in Mumbai • 24h peak window"
  }}
/>
```

### InfluencerCard

```jsx
<InfluencerCard
  influencer={{
    id: "fit-mumbai",
    handle: "@FitMumbai",
    cost: 8500,
    followers: 28000,
    engagement: 12,
    niche: "Fitness • Gym Workouts"
  }}
  isWithinBudget={true}
/>
```

---

## Performance Optimizations

| Technique | Implementation |
|-----------|---------------|
| **Code Splitting** | `React.lazy()` for all route-level pages |
| **Memoization** | `React.memo` for TrendCard, InfluencerCard |
| **Caching** | TanStack Query with 5-min stale time |
| **Lazy Loading** | Non-critical components loaded on demand |
| **Bundle Optimization** | Vite tree-shaking + minification |
| **Image Optimization** | SVG icons, optimized asset loading |
| **CSS Modules** | Dead CSS elimination per component |

### Target Performance

| Metric | Target | Method |
|--------|--------|--------|
| Bundle Size (gzipped) | < 200KB | Code splitting + tree-shaking |
| FCP | < 1.5s | Critical CSS inlining |
| LCP | < 2.5s | Lazy loading non-critical content |
| TTI | < 3.0s | Deferred script loading |
| 3G Load | < 5s | Compressed assets, edge caching |

---

## Element ID Conventions

All interactive elements use consistent IDs for testing:

| Element | ID Pattern | Example |
|---------|-----------|---------|
| Navigation links | `nav-{page-name}` | `nav-dashboard` |
| Budget slider | `budget-slider` | `budget-slider` |
| Generate button | `btn-generate-campaign` | `btn-generate-campaign` |
| Trend cards | `trend-card-{index}` | `trend-card-0` |
| Influencer cards | `influencer-card-{index}` | `influencer-card-0` |
| Wizard steps | `wizard-step-{number}` | `wizard-step-1` |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| **Desktop** | ≥1200px | Full nav, multi-column grids, sidebars |
| **Tablet** | 768–1199px | Collapsible sidebars, 2-column grids |
| **Mobile** | <768px | Hamburger menu, single column, sticky buttons |

### Mobile-Specific Features
- Touch targets minimum 44×44px
- Hamburger navigation with slide-in overlay
- Sticky action buttons at bottom
- Full-width cards with reduced spacing
- Optimized for 3G data usage
