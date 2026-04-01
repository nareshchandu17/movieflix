import { Metadata } from "next";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Footer Demo | MovieFlix",
  description: "Premium 3D Animated Footer Demo",
};

export default function FooterDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black">
      {/* Demo Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Premium Footer Demo
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Scroll down to experience the next-level 3D animated footer with cinematic effects, 
            glass morphism, and premium interactions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">3D Effects</h3>
              <p className="text-gray-400">
                Floating animations with mouse-tilt interactions and parallax scrolling
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">Glass Morphism</h3>
              <p className="text-gray-400">
                Premium blur effects with subtle transparency and modern aesthetics
              </p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">Cinematic Theme</h3>
              <p className="text-gray-400">
                Dark theme with red accent colors and Netflix-level polish
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <p className="text-gray-500 animate-bounce">
              ↓ Scroll down to see the footer ↓
            </p>
          </div>
        </div>
      </div>
      
      {/* Spacer to ensure footer is visible */}
      <div className="h-screen"></div>
      
      {/* The Premium Footer */}
      <Footer />
    </div>
  );
}
