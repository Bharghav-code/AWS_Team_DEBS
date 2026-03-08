# 🎨 UI/UX Design System — Virale

## Design Philosophy

Virale follows a **professional, corporate-modern** aesthetic — clean, structured, and data-focused. The design prioritizes clarity and usability while maintaining visual sophistication through subtle animations, consistent spacing, and a cohesive color system.

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Deep Blue** | `#1E3A8A` | 30, 58, 138 | Primary buttons, headers, key CTA |
| **Professional Blue** | `#3B82F6` | 59, 130, 246 | Links, interactive elements, highlights |
| **Accent Teal** | `#0891B2` | 8, 145, 178 | Secondary accents, data visualization |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success Green** | `#10B981` | Positive metrics, success states, high alignment |
| **Warning Orange** | `#F59E0B` | Alerts, important notices |
| **Error Red** | `#EF4444` | Errors, validation failures, critical actions |

### Neutral Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Text Primary** | `#0F172A` | Main text content |
| **Text Secondary** | `#64748B` | Supporting text, captions |
| **Text Muted** | `#94A3B8` | Placeholders, disabled states |
| **Slate Gray** | `#475569` | Secondary borders |
| **Background** | `#F8FAFC` | Page background |
| **Light Gray** | `#F1F5F9` | Section backgrounds |
| **White** | `#FFFFFF` | Cards, content areas |
| **Border Light** | `#E2E8F0` | Card borders, dividers |
| **Border Medium** | `#CBD5E1` | Input borders, separators |
| **Shadow** | `rgba(15,23,42,0.08)` | Card shadows |

### Gradient

```css
/* Hero section & primary gradient */
background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
```

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Scale

| Element | Desktop | Mobile | Weight | Line Height |
|---------|---------|--------|--------|-------------|
| Header (h1) | 28px | 24px | 700 (Bold) | 1.2 |
| Subheader (h2) | 20px | 18px | 600 (Semi-bold) | 1.2 |
| Card Title (h3) | 18px | 16px | 600 (Semi-bold) | 1.3 |
| Body Text | 15px | 14px | 400 (Regular) | 1.5 |
| Caption | 13px | 12px | 400 (Regular) | 1.4 |
| Button Text | 15px | 15px | 600 (Semi-bold) | 1.0 |
| Label | 14px | 13px | 500 (Medium) | 1.4 |

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Inline spacing |
| `sm` | 8px | Tight padding |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section spacing, card padding |
| `xl` | 32px | Container padding |
| `2xl` | 40px | Section gaps |
| `3xl` | 80px | Hero section padding |

---

## Component Design

### Navigation Bar

```
Desktop:
┌──────────────────────────────────────────────────────┐
│  🔵 Virale    Dashboard  Create  Trends  Influencers │ 👤
│                            Analytics                  │
└──────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────┐
│  ☰      🔵 Virale    👤 │
└──────────────────────────┘
     │
     ├── Dashboard
     ├── Create Campaign
     ├── Trends
     ├── Influencers
     ├── Analytics
     └── Logout
```

**Styling:**
- Background: `#FFFFFF`
- Border bottom: `1px solid #E2E8F0`
- Shadow: `0 1px 3px rgba(15, 23, 42, 0.06)`
- Position: `sticky top-0`
- Active link: Blue underline + light blue background

---

### Trend Card

```
┌─────────────────────────────────────┐
│  ┌───────────────┐                  │
│  │ Fitness Trend │  ← Badge         │
│  └───────────────┘                  │
│                                     │
│  #MumbaiFitness Challenge    ← Title   │
│                                     │
│  ████████████████████░░░  92%       │
│  ← Alignment Bar (green if >90%)    │
│                                     │
│  🕐 Hot in Mumbai • 24h peak        │
│  ← Timing context                   │
└─────────────────────────────────────┘
```

**Styling:**
- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Border radius: `8px`
- Padding: `20px`
- Shadow: `0 1px 3px rgba(15, 23, 42, 0.08)`
- Hover: `translateY(-2px)`, enhanced shadow
- Alignment bar: `#3B82F6` (normal), `#10B981` (≥90%)

---

### Influencer Card

```
┌─────────────────────────────────────┐
│       ┌─────┐                       │
│       │ 👤  │  ← Profile Circle     │
│       └─────┘                       │
│                                     │
│  @FitMumbai              ← Handle   │
│                                     │
│  ┌──────────┐                       │
│  │ ₹8,500   │  ← Budget Tag        │
│  └──────────┘                       │
│                                     │
│  👥 28K followers                   │
│  📈 12% engagement                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Fitness • Gym Workouts        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### Budget Slider

```
┌─────────────────────────────────────────┐
│  Selected Budget: ₹25,000               │
│                                         │
│  ₹5K ──────────●──────────── ₹5L       │
│        5K  10K  50K  1L  5L            │
│        ← Tick marks                     │
└─────────────────────────────────────────┘
```

**Styling:**
- Track: `6px` height, `#E2E8F0` background
- Active track: `#3B82F6`
- Thumb: `20px` (desktop) / `28px` (mobile), blue with white border
- Hover: Scale 1.1, enhanced shadow

---

### Button System

| Type | Background | Text | Border | Hover |
|------|-----------|------|--------|-------|
| Primary | `#3B82F6` | `#FFFFFF` | None | `#1E3A8A` |
| Secondary | `#FFFFFF` | `#3B82F6` | `1px #3B82F6` | `#EFF6FF` bg |
| Danger | `#EF4444` | `#FFFFFF` | None | `#DC2626` |
| Ghost | Transparent | `#64748B` | None | `#F1F5F9` bg |

All buttons: `border-radius: 6px`, `padding: 12px 24px`, `font-weight: 600`

---

### Wizard Stepper

```
Desktop:
  ① Budget ──── ② State ──── ③ Content ──── ④ Influencers ──── ⑤ Review
  ✓ Done        ✓ Done        ● Current      ○ Upcoming        ○ Upcoming

Mobile:
  Step 3 of 5
  ████████████████░░░░░░░░░░░░░░  60%
  Content Creation
```

---

## Page Layouts

### Landing Page

```
┌───────────────────────────────────────────────┐
│  Navigation                                    │
├───────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐  │
│  │           HERO (Gradient Blue)          │  │
│  │                                         │  │
│  │     Go Viral with Bharat Brands        │  │
│  │     Connect with trending opportunities │  │
│  │                                         │  │
│  │          [ Get Started ]                │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Feature │  │ Feature │  │ Feature │       │
│  │  Card 1 │  │  Card 2 │  │  Card 3 │       │
│  └─────────┘  └─────────┘  └─────────┘       │
│                                               │
│  10K+ Campaigns   500+ Influencers  28+ States│
│                                               │
├───────────────────────────────────────────────┤
│  Footer: Powered by AWS                       │
└───────────────────────────────────────────────┘
```

### Dashboard

```
┌───────────────────────────────────────────────┐
│  Navigation                                    │
├───────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│
│  │Active  │ │ Reach  │ │ Engmt  │ │ Budget ││
│  │Campgns │ │ Total  │ │ Rate   │ │ Spent  ││
│  │   5    │ │ 125K   │ │ 8.2%   │ │ ₹2.4L  ││
│  └────────┘ └────────┘ └────────┘ └────────┘│
│                                               │
│  ┌─────────────────────────────────┐ ┌──────┐│
│  │  Campaign List                  │ │Trends││
│  │  ├─ Summer Fitness   ● Active  │ │Panel ││
│  │  ├─ Beach Workout    ⏸ Paused  │ │      ││
│  │  └─ Protein Launch   📝 Draft  │ │      ││
│  └─────────────────────────────────┘ └──────┘│
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │  Performance Chart (30 days)             │  │
│  └─────────────────────────────────────────┘  │
│                                   [+ Create]  │
└───────────────────────────────────────────────┘
```

---

## Responsive Design

| Breakpoint | Width | Grid | Navigation | Cards |
|-----------|-------|------|-----------|-------|
| **Desktop** | ≥1200px | Max 1400px, centered | Full horizontal | 3-4 columns |
| **Tablet** | 768–1199px | 100%, 24px margins | Collapsible sidebar | 2 columns |
| **Mobile** | <768px | 100%, 20px margins | Hamburger slide-in | 1 column |

---

## Animation System

| Interaction | Duration | Easing | Effect |
|------------|----------|--------|--------|
| Page transition | 0.2s | ease | Fade in/out |
| Card hover | 0.2s | ease | `translateY(-2px)`, deeper shadow |
| Button press | 0.15s | ease | `scale(0.98)` |
| Slider drag | 0.3s | ease | Smooth track fill |
| Mobile menu | 0.3s | ease | Slide from left |
| Modal open | 0.25s | ease | Fade + scale up |
| Content reveal | 0.3s | ease | Fade + `translateY(10px→0)` |
| Skeleton shimmer | 1.5s | infinite | Gradient sweep |
| Icon hover | 0.2s | ease | Color change only |

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | Tab, Enter, Arrow keys for all interactive elements |
| Focus indicators | Visible blue outline on focus |
| Color contrast | ≥4.5:1 for text (WCAG 2.1 AA) |
| Touch targets | Minimum 44×44px on mobile |
| Semantic HTML | `nav`, `main`, `section`, `article`, `button` |
| Alt text | All images and icons have descriptive alt/aria-label |
| Form labels | All inputs have associated `<label>` elements |
| Screen readers | ARIA roles and live regions for dynamic content |
