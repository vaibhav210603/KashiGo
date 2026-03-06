import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import PackagesSection from "@/components/sections/PackagesSection";
import ReviewsSection from "@/components/sections/ReviewsSection";

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      <HeroSection />
      <AboutSection />
      <PackagesSection />
      <ReviewsSection />
    </div>
  );
}
