/**
 * @file app/see-all/page.tsx
 * @description See All Page wrapper supporting Suspense and client-side URL search param parsing.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import React, { Suspense } from "react";
import SeeAllClient from "./SeeAllClient";

export const metadata = {
  title: "Explore Content | MovieFlix",
  description: "Browse Netflix-quality curated content, sports documentaries, crime suspense, and mind-bending thrillers.",
};

export default function SeeAllPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SeeAllClient />
    </Suspense>
  );
}
