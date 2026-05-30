"use client";

import { useScroll } from "framer-motion";
import GlowOrb from "@/shared/components/ui/GlowOrb";
import AboutHero from "@/features/about/components/AboutHero";
import AboutStory from "@/features/about/components/AboutStory";
import AboutTeam from "@/features/about/components/AboutTeam";
import AboutValues from "@/features/about/components/AboutValues";
import AboutCTA from "@/features/about/components/AboutCTA";

export default function AboutPage() {
  const { scrollYProgress } = useScroll();

  return (
    <main className="min-h-screen bg-[#f5f5f3] relative overflow-hidden">
      {/* Decorative Orbs with correct types */}
      <GlowOrb color="rgba(156, 173, 143, 0.2)" size={800} top="-200px" right="-200px" />
      <GlowOrb color="rgba(155, 81, 224, 0.1)" size={600} bottom="-100px" left="-100px" />
      
      {/* Sections with required props */}
      <AboutHero scrollYProgress={scrollYProgress} />
      <AboutStory studioModel1="/images/model1.jpg" />
      <AboutValues />
      <AboutTeam />
      <AboutCTA />
    </main>
  );
}
