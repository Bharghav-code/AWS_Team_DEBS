# Requirements Document

## Introduction

VIRALÉ is a 24-hour hackathon prototype for a global marketing platform specifically designed for Bharat brands. The system provides a minimalist, mobile-responsive interface that enables users to create marketing campaigns by matching their budget with trending opportunities and relevant influencers in target markets.

## Glossary

- **System**: The VIRALÉ web application
- **User**: A marketer or brand representative using the platform
- **Campaign**: A marketing initiative with budget, content, and target parameters
- **Trend**: A popular hashtag or content theme in a specific market
- **Influencer**: A social media personality available for brand partnerships
- **Budget_Slider**: The primary input control for campaign budget selection
- **Alignment_Bar**: Visual progress indicator showing trend-brand compatibility
- **Mock_Response**: Hardcoded data simulating real API responses for demo purposes

## Requirements

### Requirement 1: Budget-Driven Campaign Creation

**User Story:** As a marketer, I want to set my campaign budget using an intuitive slider, so that I can see relevant opportunities within my price range.

#### Acceptance Criteria

1. WHEN a user loads the application, THE System SHALL display a budget slider with range ₹5,000 to ₹500,000
2. WHEN a user moves the budget slider, THE System SHALL update the displayed budget value in real-time
3. WHEN a budget is selected, THE System SHALL filter influencer recommendations to match the budget range
4. THE Budget_Slider SHALL include tick marks at ₹5K, ₹10K, ₹50K, ₹1L, and ₹5L
5. THE System SHALL display the selected budget in the format "Selected Budget: ₹X,XXX"

### Requirement 2: Market and Category Selection

**User Story:** As a marketer, I want to select my product category and target market, so that I can receive relevant trend and influencer recommendations.

#### Acceptance Criteria

1. THE System SHALL provide a dropdown for product category selection with at least "Fitness" option
2. THE System SHALL provide a dropdown for target market selection with at least "India" option
3. WHEN category or market selections change, THE System SHALL update trend recommendations accordingly
4. THE System SHALL maintain user selections throughout the session
5. THE System SHALL use dropdown selections to filter all recommendations

### Requirement 3: Trending Opportunities Display

**User Story:** As a marketer, I want to see trending opportunities in my target market, so that I can align my campaign with popular content themes.

#### Acceptance Criteria

1. THE System SHALL display exactly 3 trending opportunities in card format
2. WHEN displaying trends, THE System SHALL show trend name, alignment percentage, and timing information
3. THE System SHALL use Alignment_Bar visualization with gradient progress bars instead of plain percentages
4. EACH trend card SHALL include a trend badge, title, alignment bar, and contextual information
5. THE System SHALL highlight trends with alignment percentages above 90% using visual emphasis

### Requirement 4: Budget-Matched Influencer Recommendations

**User Story:** As a marketer, I want to see influencers within my budget range, so that I can select appropriate partners for my campaign.

#### Acceptance Criteria

1. THE System SHALL display exactly 3 influencer recommendations matching the selected budget
2. WHEN displaying influencers, THE System SHALL show profile placeholder, name, cost, follower count, and engagement rate
3. THE System SHALL update influencer recommendations when budget slider changes
4. EACH influencer card SHALL include budget tag, follower metrics, and niche information
5. THE System SHALL only show influencers whose cost is within 20% of the selected budget

### Requirement 5: Content Adaptation and Localization

**User Story:** As a marketer, I want to see how my content will be adapted for the target market, so that I can understand the localized campaign output.

#### Acceptance Criteria

1. THE System SHALL provide a text input for original campaign content
2. WHEN content is entered, THE System SHALL display a localized adaptation based on target market
3. THE System SHALL show projected engagement improvement as a percentage badge
4. THE System SHALL adapt content language and cultural references for the selected market
5. THE System SHALL maintain the core message while localizing tone and hashtags

### Requirement 6: Responsive Design Implementation

**User Story:** As a user on various devices, I want the interface to work seamlessly on both desktop and mobile, so that I can access the platform from any device.

#### Acceptance Criteria

1. WHEN viewed on desktop (1200px+), THE System SHALL display a two-panel layout with input on left and output on right
2. WHEN viewed on mobile, THE System SHALL stack components vertically in logical flow order
3. THE Budget_Slider SHALL become full-width with large thumb control on mobile devices
4. THE System SHALL maintain sticky positioning for the generate campaign button on mobile
5. ALL interactive elements SHALL be touch-friendly with minimum 44px touch targets on mobile

### Requirement 7: Visual Design System Compliance

**User Story:** As a user, I want a visually cohesive interface that reflects Bharat brand aesthetics, so that the platform feels culturally appropriate and professional.

#### Acceptance Criteria

1. THE System SHALL use saffron (#FF9933) as the primary accent color for buttons and badges
2. THE System SHALL use teal (#138D75) for success states and positive indicators
3. THE System SHALL use system font stack for optimal performance and readability
4. ALL trend cards SHALL have white background with subtle shadow and saffron left border
5. THE System SHALL use gradient progress bars from #FF9933 to #FFD700 for alignment visualization

### Requirement 8: Hackathon Prototype Constraints

**User Story:** As a hackathon participant, I want to demonstrate core functionality quickly without complex backend dependencies, so that I can focus on user experience during the time-limited event.

#### Acceptance Criteria

1. THE System SHALL use only hardcoded Mock_Response data instead of real API calls
2. THE System SHALL load all content instantly without loading states or spinners
3. THE System SHALL use emoji and icon placeholders instead of custom illustrations
4. THE System SHALL pre-load exactly 3 trends and 3 influencers for demonstration
5. THE System SHALL function as a static demo without requiring JavaScript for core interactions

### Requirement 9: Campaign Generation Workflow

**User Story:** As a marketer, I want to generate a complete campaign recommendation with one click, so that I can quickly see all relevant information in a single view.

#### Acceptance Criteria

1. THE System SHALL provide a prominent "Generate Campaign" button
2. WHEN the generate button is clicked, THE System SHALL instantly display all recommendations using Mock_Response data
3. THE System SHALL show trending opportunities, matched influencers, and adapted content simultaneously
4. THE System SHALL maintain all user inputs while displaying generated results
5. THE System SHALL provide visual feedback confirming successful campaign generation

### Requirement 10: Header and Footer Information

**User Story:** As a user, I want to understand what platform I'm using and its technical foundation, so that I can have confidence in the tool and understand its prototype nature.

#### Acceptance Criteria

1. THE System SHALL display "Aura: Global Marketing for Bharat Brands" in the header
2. THE System SHALL include an AWS badge in the header to indicate cloud infrastructure
3. THE System SHALL display "Powered by AWS Bedrock • Hackathon Prototype" in the footer
4. THE System SHALL maintain header and footer visibility across all screen sizes
5. THE System SHALL clearly indicate the prototype nature of the application to users