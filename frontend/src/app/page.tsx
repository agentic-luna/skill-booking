import React from "react";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/hero-section/HeroSection";
import SearchTrainingByTypeSection from "@/components/search-training-by-type/SearchTrainingByTypeSection";
import WhyBookMyTrainingSection from "@/components/why-book-my-training/WhyBookMyTrainingSection";
import FeaturedProgramsSection from "@/components/featured-programs/FeaturedProgramsSection";
import CategorySection from "@/components/category-section/CategorySection";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import CtaSection from "@/components/cta-section/CtaSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <SearchTrainingByTypeSection />
      <FeaturedProgramsSection />
      <WhyBookMyTrainingSection />
      <CategorySection />
      <TestimonialSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
