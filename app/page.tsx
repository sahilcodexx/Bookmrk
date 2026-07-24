import { TestimonialsSection } from "@/components/testimonials-section";
import BannerSection from "@/layout/banner-section";
import FeatureSection from "@/layout/feature-section";
import Hero from "@/layout/hero-section";
import LogoSection from "@/layout/logos-section";

export default function Home() {
  return (
    <>
      <Hero />
      <BannerSection />
      <LogoSection />
      <FeatureSection />
      <TestimonialsSection />
    </>
  );
}
