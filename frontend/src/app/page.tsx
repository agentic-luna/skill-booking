"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Code, Dumbbell, Camera, UtensilsCrossed, Briefcase, Palette, 
  Search, Star, BookOpen, Users, CheckCircle, Calendar, ArrowRight, Clock, MapPin, ChevronDown 
} from "lucide-react";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ProgramCard from "@/components/common/ProgramCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PROGRAMS } from "@/constants/mockData";
import { HeroGeometric } from "@/components/ui/hero-geometric";

interface StepItem {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const StepCard = ({ step }: { step: StepItem }) => {
  const Icon = step.icon;
  return (
    <div className="flex flex-col items-center text-center p-6 space-y-4">
      <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-lg text-foreground">{step.number}. {step.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {step.description}
      </p>
    </div>
  );
};

const learnerSteps: StepItem[] = [
  {
    number: 1,
    title: "Find Your Skill",
    icon: Search,
    description: "Filter by date, pricing, level, and location. Read real feedback and verify host certifications.",
  },
  {
    number: 2,
    title: "Instantly Register",
    icon: Calendar,
    description: "Reserve your spots using our secure multi-channel booking portal. Get calendars integration immediately.",
  },
  {
    number: 3,
    title: "Level Up Live",
    icon: CheckCircle,
    description: "Attend interactive live streams or offline classes. Ask questions, receive work reviews, and get certified.",
  },
];

const hostSteps: StepItem[] = [
  {
    number: 1,
    title: "Create Program",
    icon: BookOpen,
    description: "Publish your event syllabus, configure session times, pricing plans, and attendance limits in our host center.",
  },
  {
    number: 2,
    title: "Manage Registrations",
    icon: Users,
    description: "Track rosters, monitor participant check-ins, send email alerts, and communicate questions on the board.",
  },
  {
    number: 3,
    title: "Get Paid Automatically",
    icon: Star,
    description: "Collect payments and withdraw earnings directly to your bank account. Build reviews to boost class sizes.",
  },
];

interface CategoryItem {
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  color: string;
}

const CategoryCard = ({ cat }: { cat: CategoryItem }) => {
  const Icon = cat.icon;
  return (
    <Link
      href={`/programs?category=${cat.slug}`}
      className="group flex flex-col items-center justify-center p-6 rounded-[25px] border border-clay-shadow bg-bone-white hover:border-nightshade-black animate-hover text-center"
    >
      <div className={`p-4 rounded-[16px] mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-sm text-graphite-ink mb-1 group-hover:text-nightshade-black transition-colors">
        {cat.name}
      </h3>
      <span className="text-xs text-stone-grey">{cat.count} Workshops</span>
    </Link>
  );
};

interface TestimonialItem {
  text: string;
  name: string;
  role: string;
  rating: number;
  avatar: string;
}

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialItem }) => {
  return (
    <div className="bg-bone-white p-6 rounded-[25px] border border-clay-shadow flex flex-col justify-between shadow-sm">
      <p className="text-stone-grey text-xs leading-relaxed italic mb-6">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center space-x-3">
        <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
        <div>
          <h4 className="font-bold text-sm text-foreground">{testimonial.name}</h4>
          <span className="text-[10px] text-muted-foreground">{testimonial.role}</span>
        </div>
        <div className="flex items-center ml-auto">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-iron-grey text-iron-grey" />
          ))}
        </div>
      </div>
    </div>
  );
};

const testimonialsList: TestimonialItem[] = [
  {
    text: "The Next.js workshop by Sarah was game-changing. Having a live expert answer layout routing questions was 10x better than pre-recorded guides.",
    name: "Liam O'Connor",
    role: "Frontend Developer",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100",
  },
  {
    text: "Chef Marc's sourdough class got me baking fresh loaves immediately. The hydration formula breakdown solved my dense-bread issues.",
    name: "Sophia Martinez",
    role: "Hobbyist Baker",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
  },
  {
    text: "Being able to verify student tickets and manage my photography class slots through the host tools is extremely seamless. Payment is lightning fast.",
    name: "Elena Rostova",
    role: "Photographer / Host",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"learner" | "host">("learner");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/programs?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleScrollToFeatures = () => {
    document.getElementById('featured-programs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = [
    { name: "Technology", slug: "technology", icon: Code, count: 18, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Culinary Arts", slug: "culinary", icon: UtensilsCrossed, count: 12, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Photography", slug: "photography", icon: Camera, count: 8, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Fitness & Wellness", slug: "fitness", icon: Dumbbell, count: 14, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Business", slug: "business", icon: Briefcase, count: 9, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Design & Arts", slug: "design", icon: Palette, count: 15, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  ];

  const featuredPrograms = MOCK_PROGRAMS.filter(p => p.status === "approved").slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <HeroGeometric
        title1="Master New Skills."
        description="Upskill with confidence. Book live, interactive training sessions and get hands-on guidance from proven industry experts."
      >
        <div className="w-full flex flex-col items-center space-y-6">
          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto bg-bone-white p-2 rounded-md shadow-lg border border-clay-shadow/50 relative z-20 group transition-all duration-300 ease-out hover:shadow-xl focus-within:shadow-xl focus-within:-translate-y-1 hover:-translate-y-1">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="text"
                placeholder="What skill do you want to learn today?"
                className="pl-12 h-14 w-full text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-base rounded-md shadow-sm transition-transform active:scale-95">
              Search
            </Button>
          </form>

          <div className="text-xs text-graphite-ink/80 pt-1 flex items-center justify-center gap-2 flex-wrap relative z-20">
            <span className="font-medium">Popular Categories:</span>
            {["React 19", "Sourdough", "HIIT Fit", "Street Photography"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSearchQuery(item);
                  router.push(`/programs?search=${encodeURIComponent(item)}`);
                }}
                className="bg-bone-white/90 backdrop-blur hover:bg-white text-graphite-ink border border-clay-shadow/20 px-3 py-1.5 rounded-sm transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
            
            {/* Scroll Indicator */}
            <div className="pt-12 md:pt-20 flex justify-center w-full relative z-20">
              <button 
                onClick={handleScrollToFeatures}
                className="flex flex-col items-center justify-center text-graphite-ink/60 hover:text-nightshade-black transition-colors cursor-pointer"
                aria-label="Scroll to featured classes"
              >
                <div className="p-2.5 rounded-full bg-bone-white/50 backdrop-blur-md border border-clay-shadow/30 animate-bounce shadow-sm">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
      </HeroGeometric>

      {/* Featured Programs Section */}
      <section id="featured-programs" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-graphite-ink">
                Featured Skill Masterclasses
              </h2>
              <p className="text-stone-grey text-sm">
                Reserve your spot in high-demand workshops starting this week.
              </p>
            </div>

          </div>

          {/* Program Cards Grid */}
          <div className="relative w-full">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-h-[580px] overflow-hidden">
              {featuredPrograms.map((prog) => (
                <ProgramCard key={prog.id} program={prog} />
              ))}
            </div>
            
            {/* Gradient Overlay & Explore Button */}
            <div className="absolute bottom-0 left-0 w-full h-[250px] bg-gradient-to-t from-linen-canvas via-linen-canvas/80 to-transparent flex flex-col items-center justify-end pb-4">
              <Link href="/programs">
                <Button size="lg" className="rounded-md shadow-lg h-14 px-8 text-base">
                  Explore All Classes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-20 border-t border-clay-shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-graphite-ink">
              Browse by Skill Category
            </h2>
            <p className="text-stone-grey text-sm">
              Discover verified instructors teaching highly demanded technical and life skills.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-transparent border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How the Marketplace Works
            </h2>
            <p className="text-muted-foreground text-sm">
              Connecting professional educators with continuous learners globally.
            </p>

            {/* Switch Tabs Toggle */}
            <div className="flex justify-center pt-4">
              <div className="bg-muted p-1 rounded-xl flex">
                <button
                  onClick={() => setActiveTab("learner")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "learner"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  For Learners
                </button>
                <button
                  onClick={() => setActiveTab("host")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "host"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  For Instructors
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {(activeTab === "learner" ? learnerSteps : hostSteps).map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-transparent border-t border-clay-shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Loved by Thousands of Learners
            </h2>
            <p className="text-muted-foreground text-sm">
              See how BookMySkill is helping individuals master practical skills under live guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsList.map((t, idx) => (
              <TestimonialCard key={idx} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-transparent border-t border-clay-shadow/40 overflow-hidden">
        {/* Abstract light glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,_rgba(168,156,138,0.15),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center text-foreground relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-graphite-ink">
            Ready to Accelerate Your Learning Curve?
          </h2>
          <p className="text-stone-grey text-base max-w-xl mx-auto leading-relaxed">
            Create an account to explore thousands of live workshops, book secure spots, and start certified learning programs today.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-xl">
                Get Started Now
              </Button>
            </Link>
            <Link href="/register?role=host">
              <Button variant="outline" size="lg" className="border-clay-shadow text-graphite-ink bg-bone-white hover:bg-haze rounded-xl">
                Teach on BookMySkill
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
