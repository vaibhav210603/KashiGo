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
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <ProgressBar />
      <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 md:top-24 md:bottom-auto md:right-6 z-[90]">
        <button
          onClick={() => setIsTocOpen(true)}
          className="h-12 px-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold font-heading rounded-full shadow-lg transition-colors flex items-center gap-2"
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
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 text-center py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 mb-4">One last thing</span>
          <h2 className="text-3xl sm:text-5xl font-bold font-heading text-slate-900 mb-4">Go. Seriously — go.</h2>
          <p className="text-[17px] text-slate-600 leading-relaxed mb-8">
            No guide can fully prepare you for India, and that's the magic of it. You'll be overwhelmed, then enchanted, then changed.
          </p>
        </div>
      </section>
    </div>
  );
}
