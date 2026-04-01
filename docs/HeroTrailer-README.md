# Premium Auto-Play Hero Trailer System

A comprehensive, production-ready hero trailer system for streaming web applications built with Next.js, Tailwind CSS, and modern React patterns.

## 🎬 Features

### Core Functionality
- **Smart Auto-Play**: Intelligently decides when to auto-play based on device, network, and user context
- **Performance Optimized**: Lazy loading, intersection observer, and efficient resource management
- **Responsive Design**: Adapts seamlessly between mobile and desktop experiences
- **Accessibility**: Full keyboard navigation and screen reader support
- **User Preferences**: Persistent audio settings and interaction tracking

### Technical Highlights
- **Device Detection**: Mobile, network speed, and battery level awareness
- **Visibility Management**: Intersection Observer for play/pause based on viewport
- **Tab Management**: Automatic pause when tab becomes inactive
- **Error Handling**: Graceful fallbacks for video loading failures
- **State Management**: LocalStorage for user preferences

## 📁 File Structure

```
/components/
  HeroTrailer.tsx              # Main component (self-contained)
  HeroTrailerOptimized.tsx     # Optimized version with custom hooks
  
/hooks/
  useAutoPlay.ts               # Auto-play logic hook
  useDeviceDetection.ts        # Device and network detection hooks
  
/app/
  home/page.tsx               # Example usage implementation
```

## 🚀 Quick Start

### Basic Usage

```tsx
import HeroTrailer from '@/components/HeroTrailer';

<HeroTrailer
  title="Your Content Title"
  description="Engaging description of your content"
  videoUrl="https://example.com/trailer.mp4"
  posterUrl="https://example.com/poster.jpg"
  contentId="unique-content-id"
/>
```

### Optimized Usage (Recommended)

```tsx
import HeroTrailerOptimized from '@/components/HeroTrailerOptimized';

<HeroTrailerOptimized
  title="Your Content Title"
  description="Engaging description of your content"
  videoUrl="https://example.com/trailer.mp4"
  posterUrl="https://example.com/poster.jpg"
  contentId="unique-content-id"
/>
```

## 🎛️ Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | ✅ | Content title displayed in hero |
| `description` | `string` | ✅ | Content description |
| `videoUrl` | `string` | ✅ | URL to trailer video (MP4 or HLS) |
| `posterUrl` | `string` | ✅ | Fallback image displayed before video loads |
| `contentId` | `string` | ✅ | Unique identifier for navigation/analytics |
| `className` | `string` | ❌ | Additional CSS classes |

## 🧠 Smart Auto-Play Logic

The system automatically determines whether to auto-play based on:

### ✅ Auto-Play Conditions
- Desktop device (not mobile)
- Fast network connection (not 2G/slow-2G)
- Sufficient battery level (>20%)
- Content is visible in viewport
- User hasn't interacted yet

### ❌ No Auto-Play Conditions
- Mobile devices
- Slow network connections
- Low power mode
- Content not visible
- User has interacted with component

## 🎨 Customization

### Styling with Tailwind

The component uses Tailwind CSS classes that can be customized:

```tsx
// Override default styles
<HeroTrailer
  className="custom-hero-styles"
  // ... other props
/>
```

### Custom Hooks

Use the individual hooks for custom implementations:

```tsx
import { useAutoPlay, useVisibility, useDeviceDetection } from '@/hooks/useDeviceDetection';

const MyCustomComponent = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const isVisible = useVisibility(containerRef);
  const { isMobile, networkSlow } = useDeviceDetection();
  
  const { isPlaying, handleVideoReady } = useAutoPlay(
    videoRef,
    !isMobile && !networkSlow && isVisible,
    false,
    isVisible
  );
  
  // Custom implementation
};
```

## 📱 Responsive Behavior

### Desktop/Tablet
- Auto-play video with smooth fade-in
- Hover effects and interactions
- Audio controls when playing
- Gradient overlays for text readability

### Mobile
- Static poster image (no auto-play)
- Prominent play button overlay
- Optimized touch interactions
- Simplified controls

## 🔧 Configuration Options

### Video Settings
```tsx
// In HeroTrailer.tsx, modify these values:
const AUTO_PLAY_DELAY = 1500; // Delay before auto-play (ms)
const VISIBILITY_THRESHOLD = 0.5; // Intersection observer threshold
```

### Network Detection
```tsx
// Adjust network speed thresholds
const SLOW_NETWORK_TYPES = ['slow-2g', '2g'];
const SAVE_DATA_THRESHOLD = true;
```

## 🎯 Performance Optimizations

### Lazy Loading
- Videos use `preload="metadata"`
- Intersection Observer for viewport detection
- Conditional rendering based on visibility

### Resource Management
- Cleanup on component unmount
- Timeout management
- Event listener cleanup

### Memory Efficiency
- Ref-based DOM access
- Minimal state updates
- Efficient animation libraries

## 🐛 Troubleshooting

### Video Not Auto-Playing
1. Check device detection (mobile devices disabled)
2. Verify network connection
3. Ensure video format is supported
4. Check browser console for errors

### Performance Issues
1. Reduce video resolution
2. Optimize poster image size
3. Check for memory leaks
4. Monitor intersection observer performance

### Mobile Issues
1. Ensure touch events work
2. Check viewport meta tag
3. Verify responsive breakpoints

## 🚀 Production Deployment

### Environment Variables
```env
# Enable/disable debug info
NODE_ENV=production

# Video CDN settings
NEXT_PUBLIC_VIDEO_CDN=https://your-cdn.com
```

### Build Optimization
```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm run analyze
```

## 📊 Analytics Integration

Track user interactions:

```tsx
const handlePlayClick = () => {
  // Analytics tracking
  analytics.track('hero_trailer_play_clicked', {
    contentId,
    title,
    autoPlay: shouldAutoPlay
  });
  
  router.push(`/watch/${contentId}`);
};
```

## 🔮 Future Enhancements

### Planned Features
- [ ] HLS.js integration for adaptive streaming
- [ ] Picture-in-picture support
- [ ] Gesture controls for mobile
- [ ] A/B testing framework
- [ ] Advanced analytics tracking
- [ ] Multiple trailer support
- [ ] Chapter markers
- [ ] Social sharing integration

### Performance Improvements
- [ ] Web Workers for video processing
- [ ] Service Worker caching
- [ ] Predictive preloading
- [ ] Bandwidth-adaptive quality

## 📄 License

This implementation is provided as-is for educational and production use. Feel free to modify and distribute according to your project needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for modern streaming platforms**
