"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Code, Dumbbell, Camera, UtensilsCrossed, Briefcase, Palette, 
  Search, Star, BookOpen, Users, CheckCircle, Calendar, ArrowRight, Clock, MapPin 
} from "lucide-react";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_PROGRAMS } from "@/constants/mockData";

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"learner" | "host">("learner");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/programs?search=${encodeURIComponent(searchQuery)}`);
  };

  const categories = [
    { name: "Technology", slug: "technology", icon: Code, count: 18, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Culinary Arts", slug: "culinary", icon: UtensilsCrossed, count: 12, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Photography", slug: "photography", icon: Camera, count: 8, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Fitness & Wellness", slug: "fitness", icon: Dumbbell, count: 14, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Business", slug: "business", icon: Briefcase, count: 9, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
    { name: "Design & Arts", slug: "design", icon: Palette, count: 15, color: "text-graphite-ink bg-linen-canvas border border-clay-shadow" },
  ];

  const featuredPrograms = MOCK_PROGRAMS.filter(p => p.featured && p.status === "approved");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-bone-white text-iron-grey px-4 py-2 rounded-[100px] text-[12px] font-medium border border-clay-shadow shadow-sm tracking-[0.444em] uppercase">
              <span>Introducing BookMySkill</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[52px] font-semibold tracking-tight text-graphite-ink leading-[1.1]">
              Master New Skills in Live Interactive Sessions.
            </h1>
            <p className="text-charcoal-slate text-base sm:text-[18px] leading-relaxed max-w-2xl mx-auto">
              Skip static videos. Book live masterclasses, interactive bootcamps, and certification training led by top-rated industry instructors.
            </p>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto bg-bone-white p-2 rounded-[25px] shadow-sm border border-clay-shadow">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What skill do you want to learn today?"
                  className="pl-11 h-11 w-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-11 rounded-xl">
                Find Classes
              </Button>
            </form>

            <div className="text-xs text-muted-foreground pt-1 flex items-center justify-center gap-2 flex-wrap">
              <span>Popular Categories:</span>
              {["React 19", "Sourdough", "HIIT Fit", "Street Photography"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item);
                    router.push(`/programs?search=${encodeURIComponent(item)}`);
                  }}
                  className="bg-haze hover:bg-clay-shadow text-graphite-ink px-3 py-1.5 rounded-[12px] transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="py-20 border-t border-clay-shadow">
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
            <Link href="/programs">
              <Button variant="outline" className="group rounded-[12px] border-clay-shadow text-graphite-ink">
                Explore All Classes <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="group flex flex-col border border-clay-shadow rounded-[25px] overflow-hidden bg-bone-white hover:border-nightshade-black animate-hover"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-haze">
                  <img
                    src={prog.imageUrl}
                    alt={prog.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-nightshade-black/60 backdrop-blur-md text-bone-white text-xs px-2.5 py-1 rounded-[8px] font-semibold capitalize">
                    {prog.category}
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={prog.instructorAvatar}
                      alt={prog.instructorName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-stone-grey">{prog.instructorName}</span>
                  </div>

                  <h3 className="font-bold text-base text-graphite-ink line-clamp-2 leading-tight group-hover:text-nightshade-black transition-colors">
                    {prog.title}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs text-stone-grey">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {prog.duration}</span>
                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {prog.location.split(",")[0]}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 pt-1">
                    <Star className="h-4 w-4 fill-iron-grey text-iron-grey" />
                    <span className="text-xs font-bold text-graphite-ink">{prog.rating}</span>
                    <span className="text-xs text-stone-grey">({prog.reviewsCount} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-clay-shadow mt-auto">
                    <div>
                      <span className="text-xs text-stone-grey">Registration Fee</span>
                      <div className="text-lg font-extrabold text-graphite-ink">${prog.price}</div>
                    </div>
                    <Link href={`/programs/${prog.id}`}>
                      <Button size="sm" className="rounded-[12px]">Book Spot</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/programs?category=${cat.slug}`}
                  className="group flex flex-col items-center justify-center p-6 rounded-[25px] border border-clay-shadow bg-bone-white hover:border-nightshade-black animate-hover text-center"
                >
                  <div className={`p-4 rounded-[16px] mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm text-graphite-ink mb-1 group-hover:text-nightshade-black transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-stone-grey">{cat.count} Workshops</span>
                </Link>
              );
            })}
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
            {activeTab === "learner" ? (
              <>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">1. Find Your Skill</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Filter by date, pricing, level, and location. Read real feedback and verify host certifications.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">2. Instantly Register</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Reserve your spots using our secure multi-channel booking portal. Get calendars integration immediately.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">3. Level Up Live</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Attend interactive live streams or offline classes. Ask questions, receive work reviews, and get certified.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">1. Create Program</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Publish your event syllabus, configure session times, pricing plans, and attendance limits in our host center.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">2. Manage Registrations</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Track rosters, monitor participant check-ins, send email alerts, and communicate questions on the board.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 space-y-4">
                  <div className="bg-bone-white border border-clay-shadow text-iron-grey p-4 rounded-[25px]">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">3. Get Paid Automatically</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Collect payments and withdraw earnings directly to your bank account. Build reviews to boost class sizes.
                  </p>
                </div>
              </>
            )}
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
            {[
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
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-bone-white p-6 rounded-[25px] border border-clay-shadow flex flex-col justify-between shadow-sm">
                <p className="text-stone-grey text-xs leading-relaxed italic mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center space-x-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{t.role}</span>
                  </div>
                  <div className="flex items-center ml-auto">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-iron-grey text-iron-grey" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-nightshade-black overflow-hidden">
        {/* Abstract grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,_rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center text-bone-white relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Learning Curve?
          </h2>
          <p className="text-bone-white/60 text-base max-w-xl mx-auto leading-relaxed">
            Create an account to explore thousands of live workshops, book secure spots, and start certified learning programs today.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="rounded-xl">
                Get Started Now
              </Button>
            </Link>
            <Link href="/register?role=host">
              <Button variant="outline" size="lg" className="text-bone-white border-bone-white/40 hover:bg-bone-white/10 rounded-xl">
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
