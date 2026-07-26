/**
 * Utility functions for generating deterministic color palettes based on IDs or names.
 */

// A curated list of premium, cinematic hues (avoiding pure red, blue, green)
const PREMIUM_HUES = [
  210, // Deep Cinematic Blue
  340, // Cyberpunk Pink
  45,  // Gold / John Wick
  190, // Cyan / Avatar
  25,  // Orange / Dune
  280, // Deep Purple
  160, // Teal / Matrix
];

/**
 * Generates a deterministic color palette based on an ID.
 * Returns HSL strings for a primary color and a darker background variant.
 */
export function generateDeterministicPalette(id: number) {
  // Simple deterministic hash
  const hash = Math.sin(id) * 10000;
  const index = Math.floor(Math.abs(hash) * PREMIUM_HUES.length) % PREMIUM_HUES.length;
  
  const hue = PREMIUM_HUES[index];
  
  return {
    primary: `hsl(${hue}, 80%, 50%)`,
    secondary: `hsl(${hue}, 60%, 40%)`,
    background: `hsl(${hue}, 40%, 10%)`,
    gradient: `linear-gradient(to bottom right, hsl(${hue}, 40%, 15%), hsl(${hue}, 20%, 5%))`
  };
}

/**
 * Client-side utility to extract average color from an image URL using Canvas.
 * Falls back to deterministic palette on error.
 */
export async function extractAverageColorFromImage(imageUrl: string, fallbackId: number) {
  if (typeof window === 'undefined') return generateDeterministicPalette(fallbackId);

  return new Promise<ReturnType<typeof generateDeterministicPalette>>((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          return resolve(generateDeterministicPalette(fallbackId));
        }

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        // Sample middle of the image to avoid borders
        const imageData = context.getImageData(
          Math.floor(img.width * 0.25), 
          Math.floor(img.height * 0.25), 
          Math.floor(img.width * 0.5), 
          Math.floor(img.height * 0.5)
        );
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Sample every 4th pixel to speed up
        for (let i = 0; i < data.length; i += 16) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Convert to HSL to adjust saturation and lightness for a premium feel
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        
        const hue = Math.floor(h * 360);
        
        resolve({
          primary: `hsl(${hue}, 80%, 50%)`,
          secondary: `hsl(${hue}, 60%, 40%)`,
          background: `hsl(${hue}, 40%, 10%)`,
          gradient: `linear-gradient(to bottom right, hsl(${hue}, 40%, 15%), hsl(${hue}, 20%, 5%))`
        });
      } catch (e) {
        resolve(generateDeterministicPalette(fallbackId));
      }
    };
    
    img.onerror = () => {
      resolve(generateDeterministicPalette(fallbackId));
    };
    
    // Construct TMDB image URL
    img.src = imageUrl.startsWith('http') ? imageUrl : `https://image.tmdb.org/t/p/w500${imageUrl}`;
  });
}

