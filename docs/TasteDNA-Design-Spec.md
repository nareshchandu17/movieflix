# Taste DNA - Premium OTT Feature Design Specification

## 1) Objectives and User Flow

### Concept

**"Your Taste DNA"** is an advanced personalization feature that analyzes user viewing behavior to create a unique taste profile. It transforms raw viewing data into actionable insights that power personalized recommendations and content discovery.

**Purpose:**
- Provide users with deep insights into their viewing preferences
- Enable fine-tuned control over recommendation algorithms
- Create a sense of personal connection with the platform
- Increase engagement through personalized content discovery

**Data Inputs:**
- Watch history (titles, duration, completion rates)
- User ratings and interactions (likes, dislikes, skips)
- Time-of-day viewing patterns
- Genre preferences and mood associations
- Binge-watching vs. casual viewing behavior
- Re-watch frequency and patterns
- Device and context preferences

**Outputs:**
- Genre distribution visualization
- Mood spectrum analysis
- Viewing behavior metrics
- Personalized recommendation strength controls
- Taste similarity with friends
- Viewing pattern insights

### User Access & Flow

**Access Path:**
1. User clicks profile avatar in main navigation
2. Dropdown menu appears with profile options
3. User clicks "Your Taste DNA" option
4. Slide-out panel opens from the right with taste analysis

**Interaction Steps:**
1. **Discovery** - Overview tab shows personality type and key metrics
2. **Exploration** - Navigate through Genres, Moods, Behavior, Patterns tabs
3. **Analysis** - View detailed charts and insights
4. **Customization** - Adjust personalization settings
5. **Comparison** - Compare taste profile with friends (optional)
6. **Action** - Apply insights to improve recommendations

**Micro-interactions:**
- Smooth slide-out panel animation (300ms ease-out)
- Chart animations on data load
- Hover states on all interactive elements
- Scale transforms on buttons and cards
- Progress bar animations for metrics
- Tooltip animations on charts

**Recommendation Impact:**
- Taste DNA data feeds into homepage algorithm
- "For You" section prioritizes matching content
- Genre filters auto-adjust based on preferences
- Mood-based recommendations (e.g., "Relaxing Evening" suggestions)
- Personalization strength slider controls recommendation diversity

## 2) Design Requirements

### Visual Language

**Typography Scale:**
```css
--text-xs: 0.75rem (12px) - Labels, metadata
--text-sm: 0.875rem (14px) - Secondary text
--text-base: 1rem (16px) - Body text
--text-lg: 1.125rem (18px) - Small headings
--text-xl: 1.25rem (20px) - Section headings
--text-2xl: 1.5rem (24px) - Main headings
--text-3xl: 1.875rem (30px) - Page titles
```

**Color Palette:**
```css
/* Primary - Purple/Pink gradient theme */
--primary-gradient: linear-gradient(135deg, #8b5cf6, #ec4899);
--primary-50: #faf5ff;
--primary-500: #8b5cf6;
--primary-600: #7c3aed;
--primary-700: #6d28d9;

/* Analytics Colors */
--chart-blue: #06b6d4;
--chart-green: #10b981;
--chart-orange: #f59e0b;
--chart-red: #ef4444;
--chart-purple: #8b5cf6;
--chart-yellow: #eab308;

/* Neutral */
--bg-primary: #000000;
--bg-secondary: #111827;
--bg-tertiary: #1f2937;
--border-primary: rgba(255, 255, 255, 0.1);
--text-primary: #ffffff;
--text-secondary: #9ca3af;
--text-tertiary: #6b7280;
```

**Iconography Style:**
- **Style:** Minimal, filled icons with consistent stroke width
- **Size System:** 16px, 20px, 24px for different hierarchy levels
- **Color:** White for primary, accent colors for active states
- **Library:** Lucide React (consistent with existing codebase)

**Visual Density:**
- **Compact:** Optimized for slide-out panel (max-width: 1024px)
- **Comfortable spacing:** 16px base unit, 24px for sections
- **Breathing room:** Cards and charts have adequate padding
- **Scrollable:** Vertical scroll for content overflow

### Layout

**Responsive Behavior:**
- **Mobile (320px - 768px):** Full-screen overlay, stack charts vertically
- **Tablet (768px - 1024px):** Slide-out panel, single column layout
- **Desktop (1024px+):** Slide-out panel, multi-column charts

**Dropdown Integration:**
- **Trigger:** Profile avatar in main navigation
- **Panel:** Right-side slide-out (max-width: 1024px)
- **Animation:** 300ms ease-out slide from right
- **Backdrop:** Semi-transparent black with blur
- **Z-index:** 50 (above all other content)

**Expansion Behavior:**
- **Default:** Slide-out panel within current page
- **Optional:** Can expand to full page on mobile
- **Responsive:** Adapts layout based on available space
- **Persistent:** Remains open during navigation

### UI Patterns

**Cards:**
- **Style:** Glass morphism with backdrop blur
- **Border:** Subtle white/10 border
- **Shadow:** Multi-layered shadow system
- **Hover:** Scale transform (1.05) + glow effect
- **Padding:** 16px - 24px based on content

**Charts:**
- **Library:** Recharts (React-compatible)
- **Style:** Dark theme with accent colors
- **Animation:** Staggered entrance animations
- **Tooltips:** Dark background with blur
- **Responsive:** Auto-resize with container

**Progress Indicators:**
- **Style:** Gradient fills with rounded corners
- **Animation:** Smooth width transitions (1s ease-out)
- **Color:** Contextual (green for positive, red for negative)
- **Labels:** Percentage or absolute values

**Micro-interactions:**
- **Hover:** Scale (1.05) + shadow + glow
- **Active:** Gradient background + shadow
- **Loading:** Skeleton loaders with shimmer effect
- **Transitions:** 300ms ease-out for all interactions

## 3) Required Features

### 1. Personal Taste Profiling

**Genre Distribution:**
- Donut chart showing percentage breakdown
- Interactive legend with color coding
- Top 5 genres with percentages
- Click to filter recommendations

**Mood Preferences:**
- Radar chart with 6 mood dimensions
- Score from 0-100 for each mood
- Visual mood spectrum visualization
- Time-based mood analysis

**Watch Time Behavior:**
- Average session duration
- Peak viewing times
- Session frequency patterns
- Device-specific preferences

**Completion Rates:**
- Overall completion percentage
- Genre-specific completion rates
- Skip rate analysis
- Re-watch frequency

### 2. Dynamic Recommendation Impact

**Homepage Integration:**
- "Based on Your Taste DNA" section
- Personalized content carousels
- Mood-based recommendations
- Strength control slider

**Personalization Controls:**
- Recommendation strength (0-100%)
- Genre influence weights
- Mood preference toggles
- Discovery vs. familiarity balance

**Real-time Updates:**
- Immediate impact on recommendations
- Visual feedback for changes
- Undo/redo capabilities
- Reset to defaults option

### 3. Edit / Clear / Reset Taste Data

**Transparent Controls:**
- Clear data source explanations
- Opt-out options for tracking
- Data retention settings
- Export functionality

**Confirmation Patterns:**
- Warning dialogs for destructive actions
- Undo capability for recent changes
- Progress indicators for data processing
- Success/error feedback

**Privacy Controls:**
- Data sharing preferences
- Friend comparison opt-in/out
- Anonymous mode option
- Data deletion requests

### 4. Visual Analytics

**Donut Chart (Genre %):**
- Interactive segments with hover effects
- Animated entrance (staggered)
- Tooltips with detailed information
- Click to drill down functionality

**Radar Chart (Mood Spectrum):**
- 6-axis mood visualization
- Smooth animation on load
- Interactive data points
- Comparative analysis mode

**Sparkline (Watch Activity):**
- 7-day activity trend
- 30-day viewing pattern
- Hover for detailed values
- Color-coded intensity levels

### 5. Compare with Friend Profiles

**Similarity Algorithm:**
- Genre overlap calculation
- Mood correlation analysis
- Viewing pattern matching
- Overall similarity score

**Visual Comparison:**
- Side-by-side taste profiles
- Overlap visualization
- Shared interests highlighting
- Difference analysis

**Social Features:**
- Friend discovery based on taste
- Group viewing suggestions
- Watch party recommendations
- Taste-based communities

### 6. Accessibility Targets

**WCAG Compliance:**
- **Contrast Ratios:** AAA level (7:1 minimum)
- **Keyboard Navigation:** Full keyboard access
- **Screen Reader:** Comprehensive ARIA labels
- **Focus Management:** Logical tab order

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter/Space for activation
- Escape to close panel
- Arrow keys for chart navigation

**ARIA Labels:**
- Chart descriptions for screen readers
- Button and link purposes
- Status announcements
- Error messages

**Screen Reader Support:**
- Alt text for all visualizations
- Data table alternatives for charts
- Progress announcements
- Contextual help text

## 4. Technical Guidance

### Frontend Stack

**React Components:**
- **Structure:** Functional components with hooks
- **State:** useState for local state, useContext for global
- **Effects:** useEffect for animations and API calls
- **Performance:** useMemo for expensive calculations

**Chart Libraries:**
- **Primary:** Recharts (React-native, customizable)
- **Alternative:** Nivo (more complex visualizations)
- **Fallback:** Custom SVG implementations
- **Animation:** Framer Motion for micro-interactions

**State Management:**
- **Local:** useState + useReducer for component state
- **Global:** React Context for taste data
- **Persistence:** localStorage for user preferences
- **API:** Custom hooks for data fetching

**Styling:**
- **Base:** Tailwind CSS utility classes
- **Components:** Styled-components for complex animations
- **Theme:** CSS custom properties for consistency
- **Responsive:** Mobile-first approach

### Loading & Error States

**Skeleton Loaders:**
- Chart placeholders with shimmer effect
- Card skeletons with proper aspect ratios
- Text placeholders with line height
- Staggered entrance animations

**Empty States:**
- No data illustrations
- Helpful messaging
- Call-to-action buttons
- Onboarding guidance

**Error Fallbacks:**
- Graceful degradation for chart failures
- Retry mechanisms
- Error logging and reporting
- User-friendly error messages

**Offline Behavior:**
- Cached data display
- Offline indicators
- Sync status notifications
- Queue actions for later

### Performance Constraints

**Lazy Loading:**
- Chart components load on demand
- Image optimization for avatars
- Intersection Observer for animations
- Code splitting for large components

**Animation Performance:**
- CSS transforms over layout changes
- RequestAnimationFrame for smooth animations
- Reduced motion support
- 60fps target for all interactions

**Efficient Re-renders:**
- Memo for expensive calculations
- Callback optimization
- Dependency arrays in useEffect
- Virtualization for large datasets

**Dropdown Constraints:**
- Panel animation under 16ms
- Smooth 60fps slide-out
- No layout thrashing
- Memory usage under 50MB

## 5. Deliverables

### Component Map (Hierarchy)
```
TasteDNA/
├── Header/
│   ├── Logo & Title
│   ├── Tab Navigation
│   └── Action Buttons
├── Content/
│   ├── Overview/
│   │   ├── Personality Card
│   │   ├── Quick Stats
│   │   └── Insights
│   ├── Genres/
│   │   ├── Donut Chart
│   │   └── Genre List
│   ├── Moods/
│   │   └── Radar Chart
│   ├── Behavior/
│   │   └── Progress Bars
│   └── Patterns/
│       ├── Weekly Activity
│       └── Monthly Trends
└── Footer/
    ├── Action Buttons
    └── Settings
```

### Interaction Storyboard

**1. Panel Open**
- User clicks profile avatar
- Dropdown appears with smooth animation
- User clicks "Your Taste DNA"
- Panel slides out from right (300ms)

**2. Data Exploration**
- Overview tab loads first
- Charts animate in staggered fashion
- User navigates between tabs
- Smooth transitions between content

**3. Data Interaction**
- User hovers over chart segments
- Tooltips appear with detailed info
- Click actions update recommendations
- Visual feedback for all interactions

**4. Personalization**
- User adjusts recommendation strength
- Real-time preview of changes
- Apply button updates homepage
- Success confirmation appears

### Design Tokens

```css
/* Colors */
--taste-purple: #8b5cf6;
--taste-pink: #ec4899;
--taste-blue: #06b6d4;
--taste-green: #10b981;
--taste-orange: #f59e0b;
--taste-red: #ef4444;

/* Spacing */
--taste-xs: 0.25rem (4px);
--taste-sm: 0.5rem (8px);
--taste-md: 1rem (16px);
--taste-lg: 1.5rem (24px);
--taste-xl: 2rem (32px);

/* Typography */
--taste-font-sans: 'Inter', system-ui, sans-serif;
--taste-font-mono: 'JetBrains Mono', monospace;

/* Shadows */
--taste-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--taste-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
--taste-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
--taste-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.3);

/* Border Radius */
--taste-radius-sm: 0.5rem (8px);
--taste-radius-md: 0.75rem (12px);
--taste-radius-lg: 1rem (16px);
--taste-radius-xl: 1.25rem (20px);
```

### CSS Structure Example
```css
.taste-dna-panel {
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--taste-radius-lg);
  box-shadow: var(--taste-shadow-xl);
}

.taste-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--taste-radius-md);
  transition: all 0.3s ease-out;
}

.taste-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}
```

### React Component Skeleton
```tsx
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TasteData {
  genres: Array<{ name: string; percentage: number; color: string }>;
  // ... other properties
}

const TasteDNA: React.FC<TasteDNAProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [tasteData, setTasteData] = useState<TasteData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTasteData();
    }
  }, [isOpen]);

  const loadTasteData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTasteData();
      setTasteData(data);
    } catch (error) {
      console.error('Failed to load taste data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="taste-dna-panel">
      {/* Component implementation */}
    </div>
  );
};
```

This design specification provides a comprehensive blueprint for implementing the "Your Taste DNA" feature with production-ready quality, modern OTT UI standards, and excellent user experience.
