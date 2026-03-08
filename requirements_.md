# Requirements Document

## Introduction

Virale is a production-ready influencer marketing platform specifically designed for **Bharat brands and India's regional markets**. Built on AWS serverless architecture, the system provides a lightweight, mobile-first web application. The platform uses AI-powered content adaptation via **Amazon Bedrock (Nova Lite)** to help users create localised marketing campaigns matched with trending opportunities and relevant influencers across **India's 28 states**.

The application features a fully serverless backend with AWS Lambda, API Gateway, and DynamoDB, with a **Docker + Nginx** production container for frontend deployment. A silent fallback system ensures uninterrupted user experience during any backend unavailability. The application features multiple pages including landing, dashboard, campaign creation, trends explorer, influencer marketplace, and analytics views.

## Glossary

- **System**: The Virale web application
- **User**: A marketer or brand representative using the platform
- **Campaign**: A marketing initiative with budget, content, and target parameters
- **Trend**: A popular hashtag or content theme in a specific market
- **Influencer**: A social media personality available for brand partnerships
- **Budget_Slider**: The primary input control for campaign budget selection
- **Alignment_Bar**: Visual progress indicator showing trend-brand compatibility
- **Navigation**: Global navigation system for moving between pages
- **Page**: A distinct view in the application with its own URL route
- **Lambda_Function**: Serverless compute unit handling specific API functionality — **implemented in Python 3.12**
- **API_Gateway**: AWS service routing HTTP requests to Lambda functions
- **DynamoDB**: NoSQL database storing all application data
- **Cognito**: AWS authentication service managing user identity
- **Bedrock**: AWS AI service powering content adaptation — **uses Amazon Nova Lite (`us.amazon.nova-lite-v1:0`)**
- **Fallback_Data**: Pre-loaded substitute mock data used silently when backend is unavailable (`src/data/mockData.js`)
- **SharedLayer**: Lambda Layer (`virale-shared`) bundling Python utilities for all functions

## Requirements

### Requirement 1: Multi-Page Navigation System

**User Story:** As a user, I want to navigate between different sections of the platform, so that I can access various features and information efficiently.

#### Acceptance Criteria

1. THE System SHALL provide a persistent navigation bar across all pages
2. THE Navigation SHALL include links to: Home, Dashboard, Create Campaign, Trends, Influencers, Analytics
3. WHEN a user clicks a navigation link, THE System SHALL route to the corresponding page
4. THE System SHALL highlight the active page in the navigation
5. THE Navigation SHALL be responsive and collapse to a hamburger menu on mobile devices
6. THE System SHALL maintain user session state across page transitions
7. THE Navigation SHALL include user profile access and logout functionality

### Requirement 1.1: Application Routes

**User Story:** As a developer, I need clear route definitions, so that I can implement consistent navigation.

#### Route Definitions

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | First impression and onboarding |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| Dashboard | `/dashboard` | Campaign overview and metrics |
| Create Campaign | `/campaigns/create` | Multi-step campaign wizard |
| Campaign Details | `/campaigns/:id` | Individual campaign view |
| Trends Explorer | `/trends` | Browse trending opportunities |
| Influencer Marketplace | `/influencers` | Browse and compare influencers |
| Analytics | `/analytics` | Performance metrics and reports |

### Requirement 1.2: User Authentication (Cognito)

**User Story:** As a user, I want to securely log in using AWS Cognito, so that my campaigns and data are protected.

#### Acceptance Criteria

1. THE System SHALL provide login and registration pages
2. THE System SHALL authenticate users via AWS Cognito User Pools
3. THE System SHALL store JWT tokens (access, id, refresh) in localStorage
4. THE System SHALL automatically refresh tokens before expiration
5. THE System SHALL redirect unauthenticated users to the login page
6. THE System SHALL display user profile information from Cognito in the navigation
7. THE System SHALL provide logout functionality that clears all tokens
8. WHEN authentication fails, THE System SHALL display user-friendly error messages
9. THE System SHALL protect all API Gateway endpoints with Cognito authorizer

### Requirement 2: Landing Page

**User Story:** As a new visitor, I want to understand what Virale offers, so that I can decide if the platform meets my needs.

#### Acceptance Criteria

1. THE Landing Page SHALL display a hero section with tagline and platform introduction
2. THE System SHALL showcase key features: Trend Discovery, Influencer Matching, AI Content Adaptation
3. THE Landing Page SHALL include a prominent "Get Started" call-to-action button
4. THE System SHALL display social proof with statistics: 10K+ Campaigns, 500+ Influencers, 50+ Markets
5. THE Landing Page SHALL have a footer with links
6. WHEN "Get Started" is clicked, THE System SHALL navigate to the Dashboard

### Requirement 3: Dashboard Overview Page

**User Story:** As a logged-in user, I want to see an overview of my campaigns and key metrics, so that I can quickly assess my marketing performance.

#### Acceptance Criteria

1. THE Dashboard SHALL display summary cards for: Active Campaigns, Total Reach, Engagement Rate, Budget Spent
2. THE System SHALL show a list of recent campaigns with status indicators
3. THE Dashboard SHALL include quick action buttons for creating new campaigns
4. THE System SHALL display a chart showing campaign performance over time
5. THE Dashboard SHALL show trending opportunities relevant to user's interests
6. WHEN a campaign is clicked, THE System SHALL navigate to campaign details

### Requirement 4: Budget-Driven Campaign Creation

**User Story:** As a marketer, I want to set my campaign budget using an intuitive slider, so that I can see relevant opportunities within my price range.

#### Acceptance Criteria

1. WHEN a user loads the application, THE System SHALL display a budget slider with range **₹5,000 to ₹1,00,000**
2. WHEN a user moves the budget slider, THE System SHALL update the displayed budget value in real-time
3. WHEN a budget is selected, THE System SHALL filter influencer recommendations to match the budget range
4. THE Budget_Slider SHALL include steps at **₹5K, ₹20K, ₹35K, ₹50K, ₹65K, ₹80K, ₹95K, ₹1L**
5. THE System SHALL display the selected budget in the format "Selected Budget: ₹X,XXX"

### Requirement 5: Market and Category Selection

**User Story:** As a marketer, I want to select my product category and target Indian state, so that I can receive relevant trend and influencer recommendations.

#### Acceptance Criteria

1. THE System SHALL provide a dropdown for product category selection with options: Fitness, Beauty, Technology, Food, Travel, Fashion, Health, Entertainment
2. THE System SHALL provide a dropdown for **target Indian state** selection covering **all 28 states** including Maharashtra, Karnataka, Tamil Nadu, Kerala, West Bengal, Gujarat, Punjab, Andhra Pradesh, Telangana, and more
3. WHEN category or state selections change, THE System SHALL update trend recommendations accordingly
4. THE System SHALL maintain user selections throughout the session
5. THE System SHALL use dropdown selections to filter all recommendations

### Requirement 6: Trends Explorer Page

**User Story:** As a marketer, I want to explore trending opportunities in different Indian states, so that I can discover new campaign ideas.

#### Acceptance Criteria

1. THE Trends Page SHALL display a grid of trending opportunities across Indian markets
2. THE System SHALL provide filters for state/market, category, and time range
3. THE System SHALL allow sorting by alignment score, recency, or popularity
4. EACH trend SHALL be clickable to view detailed information
5. THE Trends Page SHALL include a search functionality for finding specific trends
6. THE System SHALL display trend analytics including reach, engagement, and timing

### Requirement 7: Trending Opportunities Display

**User Story:** As a marketer, I want to see trending opportunities in my target state, so that I can align my campaign with popular content themes.

#### Acceptance Criteria

1. THE Campaign Creation workflow SHALL display trending opportunities in card format based on user selections
2. WHEN displaying trends, THE System SHALL show trend name, alignment percentage, and timing information
3. THE System SHALL use Alignment_Bar visualization with solid color progress bars instead of plain percentages
4. EACH trend card SHALL include a trend badge, title, alignment bar, and contextual information
5. THE System SHALL highlight trends with alignment percentages above 90% using visual emphasis

### Requirement 8: Influencer Marketplace Page

**User Story:** As a marketer, I want to browse and filter influencers, so that I can find the best partners for my campaigns.

#### Acceptance Criteria

1. THE Influencer Page SHALL display a grid of influencer profiles
2. THE System SHALL provide filters for budget range, niche, follower count, and engagement rate
3. THE System SHALL allow sorting by cost, followers, or engagement
4. EACH influencer profile SHALL be clickable to view detailed information
5. THE System SHALL display influencer portfolio with past campaign examples

### Requirement 9: Budget-Matched Influencer Recommendations

**User Story:** As a marketer, I want to see influencers within my budget range, so that I can select appropriate partners for my campaign.

#### Acceptance Criteria

1. THE Campaign Creation workflow SHALL display recommended influencers matching the selected budget
2. WHEN displaying influencers, THE System SHALL show profile placeholder, name, cost, follower count, and engagement rate
3. THE System SHALL update influencer recommendations when budget slider changes
4. EACH influencer card SHALL include budget tag, follower metrics, and niche information
5. THE System SHALL only show influencers whose cost is within range of the selected budget

### Requirement 10: Content Adaptation and Localization (Amazon Bedrock)

**User Story:** As a marketer, I want AI to adapt my content for target Indian states, so that my campaigns resonate with local audiences.

#### Acceptance Criteria

1. THE System SHALL provide a text input for original campaign content
2. WHEN content is entered, THE System SHALL send it to the Bedrock content adaptation Lambda
3. THE System SHALL use **Amazon Bedrock Nova Lite (`us.amazon.nova-lite-v1:0`)** for content localisation
4. THE System SHALL use **Amazon Bedrock Nova Lite** for **trend-brand alignment scoring** (0–100 per trend)
5. THE adaptation response SHALL include: adapted text and target language for the selected Indian state
6. IF the Bedrock API is unavailable, THE System SHALL use a **rule-based fallback** that applies a state-specific emoji prefix and language label
7. THE System SHALL add culturally relevant emojis to adapted content
8. THE System SHALL maintain the core message while localising tone and language for the target state
9. THE System SHALL support content adaptation for all 28 Indian states in their native languages

### Requirement 11: Analytics Dashboard Page

**User Story:** As a marketer, I want to view detailed analytics of my campaigns, so that I can measure ROI and optimize future campaigns.

#### Acceptance Criteria

1. THE Analytics Page SHALL display comprehensive campaign performance metrics
2. THE System SHALL provide interactive charts for reach and engagement
3. THE Analytics Page SHALL allow filtering by date range and campaign
4. THE System SHALL show comparative analysis between campaigns
5. THE Analytics Page SHALL include export functionality for reports via `POST /analytics/export`
6. THE System SHALL display audience reach and geographic distribution

### Requirement 12: Responsive Design Implementation

**User Story:** As a user on various devices, I want the interface to work seamlessly on both desktop and mobile, so that I can access the platform from any device.

#### Acceptance Criteria

1. WHEN viewed on desktop (1200px+), THE System SHALL display full navigation and multi-column layouts
2. WHEN viewed on mobile, THE System SHALL show hamburger menu and stack components vertically
3. THE System SHALL maintain consistent navigation across all pages and devices
4. ALL pages SHALL be responsive and adapt to different screen sizes
5. ALL interactive elements SHALL be touch-friendly with minimum 44px touch targets on mobile
6. THE System SHALL use smooth page transitions and maintain scroll position appropriately

### Requirement 12.1: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the platform to be usable with assistive technologies, so that I can access all features.

#### Acceptance Criteria

1. ALL interactive elements SHALL be keyboard navigable using Tab, Enter, and Arrow keys
2. ALL images and icons SHALL have descriptive alt text or aria-labels
3. THE System SHALL maintain readable color contrast ratios for text
4. THE System SHALL display visible focus indicators on all interactive elements
5. THE System SHALL use semantic HTML elements (nav, main, section, article, button)
6. ALL form inputs SHALL have associated label elements

### Requirement 13: Visual Design System Compliance

**User Story:** As a user, I want a visually cohesive interface that reflects modern, creative aesthetics, so that the platform feels contemporary and professional.

#### Acceptance Criteria

1. THE System SHALL use a **dark theme** with the following core palette:
   - Chinese Black (`#0C1519`) as the primary background
   - Dark Jungle Green (`#162127`) as surface/card backgrounds
   - Jet (`#3A3534`) for borders and secondary surfaces
   - Coffee (`#724B39`) for primary actions and accents
   - Antique Brass (`#CF9D7B`) as the primary text and highlight colour
2. THE System SHALL use Inter or system fonts for optimal readability
3. ALL trend cards SHALL have dark surface backgrounds with subtle brass-tone borders
4. THE System SHALL use solid color progress bars with smooth transitions for alignment visualization
5. THE System SHALL maintain a consistent dark, warm-toned aesthetic throughout

### Requirement 14: Serverless Backend and Resilience

**User Story:** As a user, I want the platform to work reliably with real data from AWS services, and seamlessly continue functioning even during temporary backend issues.

#### Acceptance Criteria

1. THE System SHALL connect to AWS API Gateway endpoints for all data operations
2. THE System SHALL authenticate users via AWS Cognito
3. THE System SHALL store data in DynamoDB tables
4. THE System SHALL use Amazon Bedrock for AI-powered content adaptation and trend alignment scoring
5. THE System SHALL implement a silent fallback mechanism when backend is unavailable
6. THE Fallback mechanism SHALL be completely invisible to users
7. WHEN backend is unavailable, THE System SHALL serve pre-loaded mock data from `src/data/mockData.js`
8. THE System SHALL cache API responses using TanStack Query to minimize latency
9. THE System SHALL display skeleton loading states during API calls
10. THE System SHALL use React code splitting via `React.lazy()` for optimal bundle size
11. THE System SHALL use consistent element IDs for testability:
    - Navigation: `nav-{page-name}`
    - Budget slider: `budget-slider`
    - Campaign generation: `btn-generate-campaign`
    - Trend cards: `trend-card-{index}`
    - Influencer cards: `influencer-card-{index}`
    - Step indicators: `wizard-step-{number}`

### Requirement 15: Campaign Creation Workflow

**User Story:** As a marketer, I want to create a campaign through a guided multi-step process, so that I can configure all aspects of my campaign effectively.

#### Acceptance Criteria

1. THE Create Campaign Page SHALL provide a multi-step wizard interface
2. THE System SHALL include steps in the following order: **Budget & Goals, Target State, Content, Influencer Selection, Review & Launch**
3. WHEN moving between steps, THE System SHALL save progress automatically via React Context
4. THE System SHALL display a progress indicator showing current step
5. THE System SHALL validate inputs before allowing progression to next step
6. WHEN campaign is launched, THE System SHALL navigate to campaign details page
7. THE System SHALL allow users to save campaigns as drafts

#### Form Validation Rules

1. THE System SHALL validate the following fields before allowing step progression:
   - **Step 1 (Budget & Goals)**: Budget must be set (default ₹25,000), at least one goal selected
   - **Step 2 (Target State)**: Indian state and category must be selected
   - **Step 3 (Content)**: Content field is optional, max 500 characters if provided
   - **Step 4 (Influencer Selection)**: At least 1 influencer must be selected
   - **Step 5 (Review)**: No additional validation, summary only
2. THE System SHALL display inline validation errors below invalid fields
3. THE System SHALL disable the "Next" button until current step validation passes

### Requirement 16: Campaign Details Page

**User Story:** As a marketer, I want to view detailed information about a specific campaign, so that I can monitor its progress and performance.

#### Acceptance Criteria

1. THE Campaign Details Page SHALL display campaign overview with status, budget, and timeline
2. THE System SHALL show selected trends and influencers for the campaign
3. THE Campaign Details Page SHALL include real-time performance metrics
4. THE System SHALL provide action buttons for editing, pausing, or stopping campaigns
5. THE Campaign Details Page SHALL display content variations and adaptations per Indian state
6. THE System SHALL show engagement timeline and key events

### Requirement 17: Header and Footer Information

**User Story:** As a user, I want to understand what platform I'm using and its technical foundation, so that I can have confidence in the tool.

#### Acceptance Criteria

1. THE System SHALL display "Virale" logo and tagline in the header across all pages
2. THE System SHALL include an AWS badge in the header to indicate cloud infrastructure
3. THE System SHALL display "Powered by AWS" in the footer
4. THE System SHALL maintain header and footer visibility across all pages and screen sizes
5. THE System SHALL present a polished, production-ready interface

### Requirement 18: AWS Lambda Functions

**User Story:** As a developer, I need serverless Lambda functions, so that the backend scales automatically and costs are optimized.

#### Acceptance Criteria

1. THE System SHALL implement the following Lambda functions:
   - `virale_auth` - User authentication handlers
   - `virale_campaigns` - Campaign CRUD operations
   - `virale_trends` - Trend fetching and matching
   - `virale_influencers` - Influencer search and recommendations
   - `virale_content` - AI content adaptation and trend alignment (Bedrock)
   - `virale_analytics` - Metrics and reporting
2. ALL Lambda functions SHALL use **Python 3.12** runtime
3. ALL Lambda functions SHALL share the **`virale-shared` Lambda Layer** containing `response_builder`, `db_helpers`, and `cache` utilities
4. ALL Lambda functions SHALL have appropriate IAM roles for DynamoDB and Bedrock access
5. THE System SHALL implement proper error handling in all Lambda functions
6. THE System SHALL log all Lambda executions to CloudWatch
7. THE System SHALL use environment variables for configuration

### Requirement 19: DynamoDB Data Management

**User Story:** As a user, I want my campaigns and data to be saved reliably, so that I can access them across sessions.

#### Acceptance Criteria

1. THE System SHALL persist all campaign data to DynamoDB `virale-campaigns` table
2. THE System SHALL store user data in DynamoDB `virale-users` table
3. THE System SHALL store trends in DynamoDB `virale-trends` table
4. THE System SHALL store influencers in DynamoDB `virale-influencers` table
5. THE System SHALL store analytics and **content adaptations** in DynamoDB `virale-analytics` table
6. THE System SHALL use Global Secondary Indexes for efficient queries
7. ALL DynamoDB tables SHALL use **PAY_PER_REQUEST billing mode**
8. THE System SHALL support data export via the analytics export endpoint

### Requirement 20: AWS Bedrock AI Integration

**User Story:** As a marketer, I want AI-powered content adaptation, so that my campaigns are optimized for each Indian state.

#### Acceptance Criteria

1. THE System SHALL use **Amazon Bedrock Nova Lite (`us.amazon.nova-lite-v1:0`)** for content localisation across all 28 Indian states
2. THE System SHALL use **Amazon Bedrock Nova Lite** for trend-brand alignment scoring
3. THE System SHALL analyze trend alignment using the AI model and return scores (0–100) per trend
4. THE System SHALL generate culturally adapted content with emojis for the target Indian state
5. THE System SHALL handle AWS Bedrock API errors gracefully with a **rule-based fallback**
6. THE System SHALL implement **exponential backoff retry** (3 attempts) for Bedrock API calls
7. THE content Lambda SHALL use 512 MB memory and a 60-second timeout to handle Bedrock latency
8. THE System SHALL use **in-memory TTL-based Lambda cache** to reduce repeated Bedrock invocations

### Requirement 21: Frontend Deployment

**User Story:** As a user, I want the application to load quickly, so that I can use it efficiently.

#### Acceptance Criteria

1. THE System SHALL use **Docker + Nginx** for production frontend deployment
2. THE System SHALL configure Nginx to support **client-side React Router routing** (SPA fallback)
3. THE System SHALL use React code splitting via `React.lazy()` to reduce initial bundle size
4. THE System SHALL use lazy loading for routes and non-critical components via `Suspense`
5. THE System SHALL minify all JavaScript and CSS files via Vite build
6. THE System SHALL use TanStack Query for efficient data caching
7. THE System SHALL be deployed to **`ap-south-1` (Mumbai)** AWS region
