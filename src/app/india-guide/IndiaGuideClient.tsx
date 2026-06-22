"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./components/ProgressBar";
import TableOfContents from "./components/TableOfContents";
import GuideHero from "./components/GuideHero";
import WelcomeSection from "./components/WelcomeSection";
import EssentialsSection from "./components/EssentialsSection";
import HealthSafetySection from "./components/HealthSafetySection";
import ScamShield from "./components/ScamShield";
import RoutePlanner from "./components/RoutePlanner";
import Destinations from "./components/Destinations";

export default function IndiaGuideClient() {
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hasPaid = localStorage.getItem('hasPaidIndiaGuide');
    if (!hasPaid) {
      router.push('/india-tour');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return <div className="min-h-screen bg-[#0c0c0e]"></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <ProgressBar />
      <div className="fixed bottom-8 right-6 md:top-24 md:bottom-auto z-[90]">
        <button
          onClick={() => setIsTocOpen(true)}
          className="bg-slate-900 text-white font-bold font-heading px-6 py-3 rounded-full shadow-2xl hover:bg-orange-500 hover:scale-105 transition-all flex items-center gap-2"
        >
          <span>📑</span> Contents
        </button>
      </div>
      <TableOfContents isOpen={isTocOpen} onClose={() => setIsTocOpen(false)} />
      <GuideHero />
      <WelcomeSection />
      <EssentialsSection />
      <HealthSafetySection />
      <ScamShield />
      <RoutePlanner />
      <Destinations />
      <section className="bg-slate-900 text-center py-24 border-t border-slate-800">
        <div className="max-w-2xl mx-auto px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-orange-500 uppercase mb-4">One Last Thing</p>
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Go. Seriously — go.</h2>
          <p className="text-lg text-slate-300 mb-8 font-sans">
            No guide can fully prepare you for India, and that's the magic of it. You'll be overwhelmed, then enchanted, then changed.
          </p>
        </div>
      </section>
    </div>
  );
}
