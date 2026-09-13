import { MonumentalNav } from "@/components/common/MonumentalNav";
import { MonumentalFooter } from "@/components/common/MonumentalFooter";
import { InteractiveHeroExperience } from "@/components/hero/InteractiveHeroExperience";
import { FullBleedTicker } from "@/components/scenes/FullBleedTicker";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#080806] text-[#F2EFE9] selection:bg-[#E05A2B]/30 selection:text-[#F2EFE9] overflow-x-hidden">
      {/* 00 // Architectural Sticky Navigation Header */}
      <MonumentalNav />

      {/* 01 // 3D Interactive Hero & Inside Universe Product Story Experience */}
      {/* Hero -> Enter Cube -> All 7 Product Story Waypoints -> Exit Cube -> Knowledge Keeps Up + CTA */}
      <InteractiveHeroExperience />

      {/* Full-Bleed Kinetic Ticker Transition Marquee */}
      <FullBleedTicker />

      {/* Architectural Minimalist Footer */}
      <div id="footer">
        <MonumentalFooter />
      </div>
    </main>
  );
}
