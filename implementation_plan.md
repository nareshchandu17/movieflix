# Premium Netflix-Style UI/UX Overhaul

This plan addresses the 10 major issues highlighted to improve readability, visual hierarchy, spacing, interactions, and overall OTT feel.

## User Review Required

> [!IMPORTANT]
> **Simulation Mode Enabled**: The AI Insights feature now uses high-quality mock data when no API key is provided. This prevents the "Failed to fetch AI insights" error and ensures a "WOW" experience even in development environments where a key might be missing.
> 
> **Standardized Look**: All series cards will now show a brief description on hover, exactly matching the Home page behavior.
> 
> The Hero section length will be reduced from `100vh` to `75vh` to properly showcase the trending rows. Is `75vh` the exact height you want, or should we use `80vh-[...]` for larger screens?
> Also, modifying all carousel padding to `pl-[60px]` means we'll replace the responsive `pl-4 sm:pl-6...` which could affect mobile layout. To ensure it looks great on all devices, my plan is to enforce `pl-[60px]` (`pl-14` or `pl-16` in Tailwind) on desktop sizes while maintaining tight paddings on mobile (e.g., `md:pl-[60px]`). Let me know if you prefer strict 60px everywhere.

## Proposed Changes

### Infrastructure (AI Insights Fix)

#### [MODIFY] [geminiService.ts](file:///c:/projects/movieflix/lib/geminiService.ts)
- Implement `isSimulated()` checks across all methods.
- Add high-quality mock data for `generateSeriesInsights`, `generateFacts`, `generateMoodExplanation`, etc.
- **STATUS**: COMPLETED

#### [MODIFY] [series/route.ts](file:///c:/projects/movieflix/app/api/ai-insights/series/route.ts)
- Removed hard-block 503 check for `GEMINI_API_KEY` to allow Simulation Mode to take over.
- **STATUS**: COMPLETED

#### [MODIFY] [ai-facts/route.ts](file:///c:/projects/movieflix/app/api/ai-facts/route.ts)
- Removed hard-block 503 check for `GEMINI_API_KEY`.
- **STATUS**: COMPLETED

### Series Page UI (Hover Overlays)

#### [MODIFY] [SeriesCarousels.tsx](file:///c:/projects/movieflix/components/series/SeriesCarousels.tsx)
- Inject `{item.overview}` into the `SeriesCarousel` hover overlay.
- Ensure proper styling (line-clamp, typography) matching `MediaCard.tsx`.

#### [MODIFY] [RecentlyAddedSeries.tsx](file:///c:/projects/movieflix/components/series/RecentlyAddedSeries.tsx)
- Add description to hover overlay.

#### [MODIFY] [PopularOnMovieFlix.tsx](file:///c:/projects/movieflix/components/series/PopularOnMovieFlix.tsx)
- Add description to hover overlay.

#### [MODIFY] [BingeWorthySeries.tsx](file:///c:/projects/movieflix/components/series/BingeWorthySeries.tsx)
- Add description to hover overlay.

#### [MODIFY] [TopPicksForYou.tsx](file:///c:/projects/movieflix/components/series/TopPicksForYou.tsx)
- Add description to hover overlay.

#### [MODIFY] [ContinueWatchingSeries.tsx](file:///c:/projects/movieflix/components/series/ContinueWatchingSeries.tsx) (Optional but recommended)
- Check if descriptions are appropriate for "Continue Watching".

### Global Styling & Background
Update `globals.css` to add the new gradient overlay behind the main layout and ensure a smooth, noise-resistant background.
#### [MODIFY] [globals.css](file:///c:/projects/movieflix/app/globals.css)
- Alter `.app-bg-enhanced` to use a `radial-gradient` instead of a distracting background.
- Add utility `.row-title-alignment` for exact 60px padding.

---

### Navigation & Search
Fix the visibility of navigation items by adding a gradient background, and make the search input feel more premium.
#### [MODIFY] [Header.tsx](file:///c:/projects/movieflix/components/navbar/Header.tsx)
- Apply a `bg-gradient-to-b from-black/95 via-black/70 to-transparent` overlay so navigation links "Movies", "Series", etc. never blend into bright posters.
#### [MODIFY] [SmartSearch.tsx](file:///c:/projects/movieflix/components/search/SmartSearch.tsx)
- Enhance the search bar with `backdrop-filter: blur(10px)` (glass effect), placeholder "Search movies, series, actors...", and improve the expand animation.

---

### Hero Section
Adjust the height to correctly establish focus and allow the rows to sit appropriately in the visual hierarchy.
#### [MODIFY] [Hero.tsx](file:///c:/projects/movieflix/components/hero/Hero.tsx)
- Change hero height to `75vh` instead of `100vh`.

---

### Posters & Rows
Enhance the layout and interactivity of the collection rows.
#### [MODIFY] [EnhancedMediaCard.tsx](file:///c:/projects/movieflix/components/display/EnhancedMediaCard.tsx)
- **Hover Effects:** Add `hover:scale-[1.15] hover:z-50` with quick action buttons that appear smoothly on hover. Add a hover glow.
- **Aspect Ratio:** Enforce a strict `aspect-[2/3]` rule for poster images with `object-fit: cover`.
#### [MODIFY] [TrendingNow.tsx](file:///c:/projects/movieflix/components/info/TrendingNow.tsx)
- **Movie Cards Spacing:** Increase `gap` between cards inside the row to `gap-6` (24px).
- **Row Title Alignment:** Align section titles strictly with the start of the grid (`padding-left: 60px`).
- **Row Nav Arrows:** Ensure scroll arrows appear smoothly on hover and implement smooth scrolling functionality.
*(Note: I will also apply similar gap/padding changes to other carousels if needed, but will start with `TrendingNow` and `EnhancedMediaCard` which controls all carousels)*

## Open Questions

1. Should the `pl-[60px]` (padding-left) requirement be strictly 60px on mobile phones as well, or scale down on smaller screens for better mobile usability?
2. By increasing the hover scale to `1.15` and adding `z-10`, the cards will overlap neighboring cards on hover, which is standard for OTT. Do you want this to happen on all carousels or specifically in the Trending ones?
3. Should we also update `NewEpisodesThisWeek`? It has a slightly different layout.
4. For "Continue Watching", do you want descriptions or keep it focused on progress?

## Verification Plan

### Manual Verification
- Launch the application locally and ensure the header is fully readable.
- Check the Hero Banner height vs. the content below.
- Hover over posters to verify the `1.15x` scale, quick actions visibility, and glowing effects.
- Verify row arrows.
- Ensure the background gradient prevents visual noise.
