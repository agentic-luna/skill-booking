import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HeroSection from "@/components/hero-section/HeroSection";
import FeaturedProgramsSection from "@/components/featured-programs/FeaturedProgramsSection";
import CategorySection from "@/components/category-section/CategorySection";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import CtaSection from "@/components/cta-section/CtaSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedProgramsSection />
      <CategorySection />
      <TestimonialSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
