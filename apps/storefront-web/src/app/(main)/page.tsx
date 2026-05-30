"use client";

import HeroSection from "@/features/home/components/HeroSection";
import EssentializedSection from "@/features/home/components/EssentializedSection";
import DiscoverSection from "@/features/home/components/DiscoverSection";
import StyleOutlookSection from "@/features/home/components/StyleOutlookSection";
import ScienceSection from "@/features/home/components/ScienceSection";

export default function HomePage() {
  return (
    <main style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Section 1: Dark hero with cursor-following clothes */}
      <HeroSection />

      {/* Section 2: Essentialized - */}
      <EssentializedSection />

      {/* Section 3: Discover Reimagined - product grid */}
      <DiscoverSection />

      {/* Section 4: Style Outlook - Parallax Bento Grid */}
      <StyleOutlookSection />

      {/* Section 5: Science of Everyday Comfort */}
      <ScienceSection />
    </main>
  );
}
