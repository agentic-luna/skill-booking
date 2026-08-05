"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket, Check, X, HelpCircle, ArrowRight, Sparkles,
  TrendingUp, Award, Target, Eye, Compass, Zap, ShieldCheck, HelpCircle as FaqIcon, Loader2
} from "lucide-react";

import { useHostStore } from "@/features/host/store/hostStore";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { useRazorpayCheckout } from "@/features/payment/hooks/useRazorpayCheckout";
import PlacementPreviewModal from "@/components/host/PlacementPreviewModal";

// ── Pricing Plan Configurations ─────────────────────────────────────────────
const PLANS = [
  {
    tier: "BASIC",
    name: "Basic Boost",
    description: "Perfect for small workshops and first-time organizers.",
    prices: { 3: 299, 7: 599, 15: 999, 30: 1699 },
    features: [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Basic Analytics"
    ],
    cta: "Choose Basic",
    popular: false,
    gradient: "from-emerald-950/40 to-teal-950/20 border-emerald-900/30"
  },
  {
    tier: "STANDARD",
    name: "Pro Boost",
    description: "Increase discoverability and registrations.",
    prices: { 3: 699, 7: 1299, 15: 2199, 30: 3799 },
    features: [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Search Priority",
      "Category Featured",
      "Recommendation Priority",
      "Trending Events Section",
      "Enhanced Analytics"
    ],
    cta: "Choose Pro",
    popular: true,
    gradient: "from-[#112b1d] to-[#07130e] border-[#a0f212]/30 shadow-[0_0_40px_rgba(160,242,18,0.08)]"
  },
  {
    tier: "PRO",
    name: "Ultra Pro Boost",
    description: "Maximum exposure for premium events.",
    prices: { 3: 1999, 7: 3999, 15: 6999, 30: 11999 },
    features: [
      "Featured Badge",
      "Homepage Featured Section",
      "Top Event Listings",
      "Featured Events Page",
      "Search Priority",
      "Category Featured",
      "Recommendation Priority",
      "Trending Events Section",
      "Homepage Hero Banner",
      "Homepage Featured Carousel",
      "Highest Search Ranking",
      "Priority Recommendations",
      "Featured Organizer Badge",
      "Email Campaign",
      "Push Notifications",
      "Premium Analytics",
      "Priority Support"
    ],
    cta: "Choose Ultra Pro",
    popular: false,
    gradient: "from-purple-950/40 to-emerald-950/10 border-purple-900/30"
  }
];

// ── Comparison Table Details ───────────────────────────────────────────────
const COMPARISON_FEATURES = [
  { name: "Featured Badge", basic: true, pro: true, ultra: true },
  { name: "Homepage Featured Section", basic: true, pro: true, ultra: true },
  { name: "Top of Listings", basic: true, pro: true, ultra: true },
  { name: "Featured Events Page", basic: true, pro: true, ultra: true },
  { name: "Search Priority", basic: false, pro: true, ultra: true },
  { name: "Category Featured", basic: false, pro: true, ultra: true },
  { name: "Recommendations", basic: false, pro: true, ultra: true },
  { name: "Trending Section", basic: false, pro: true, ultra: true },
  { name: "Hero Banner", basic: false, pro: false, ultra: true },
  { name: "Homepage Carousel", basic: false, pro: false, ultra: true },
  { name: "Email Campaign", basic: false, pro: false, ultra: true },
  { name: "Push Notification", basic: false, pro: false, ultra: true },
  { name: "WhatsApp Campaign", basic: false, pro: false, ultra: false },
  { name: "Featured Organizer", basic: false, pro: false, ultra: true },
  { name: "Premium Analytics", basic: false, pro: false, ultra: true },
  { name: "Priority Support", basic: false, pro: false, ultra: true }
];

// ── Benefits Section ────────────────────────────────────────────────────────
const BENEFITS = [
  { icon: Eye, title: "More Visibility", text: "Get positioned at the peak of search results and listing pages for maximum eyeballs." },
  { icon: TrendingUp, title: "Higher Registrations", text: "Boosted campaigns consistently see up to 3x higher click-through and signup rates." },
  { icon: Award, title: "Premium Placement", text: "Stand out in high-traffic sections like homepage banners, hero spotlights, and weekly carousels." },
  { icon: Compass, title: "Better Discovery", text: "Algorithm-backed search priority, category spotlights, and personalization triggers." },
  { icon: Target, title: "Performance Analytics", text: "Track viewer interactions, clicks, and checkout behaviors in your host panel." },
  { icon: Zap, title: "Faster Growth", text: "Unlock higher organizer rating tier and compound your reach with every campaign." }
];

// ── FAQs ────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Can I upgrade later?", a: "Yes! You can upgrade your boost level or extend the duration at any time during an active promotion." },
  { q: "Can I extend my promotion?", a: "Certaintly. You can choose to extend or renew your campaign directly from your Boost History dashboard." },
  { q: "What happens after expiry?", a: "Once your campaign expires, your event returns to its normal organic rank, but search priority or analytics historical reports remain in your console." },
  { q: "Can I cancel?", a: "Campaigns cannot be cancelled or refunded once active. If your event date changes, please reach out to admin support to coordinate details." }
];

export default function BoostPricingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventIdParam = searchParams.get("eventId");
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user } = useAuthStore();
  const {
    myEvents, fetchMyEvents, requestBoost, verifyBoostPayment,
    boostPricing, fetchBoostPricing
  } = useHostStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showPlacementPreview, setShowPlacementPreview] = useState(false);

  const { startCustomCheckout } = useRazorpayCheckout({
    onSuccess: () => {
      showAlert("Promotion Activated! 🚀", "Your event is now boosted and highlighted.", "success");
      router.push("/host/boost-history");
    },
    onError: (msg) => {
      showAlert("Checkout Failed", msg, "destructive");
    },
  });

  // Extract unique sorted days configuration dynamically from the database settings
  const dynamicDurations = boostPricing && Array.isArray(boostPricing) && boostPricing.length > 0
    ? Array.from(new Set(boostPricing.map((p: any) => Number(p.days)))).sort((a, b) => a - b).map(d => ({
      value: d,
      label: `${d} Days`
    }))
    : [
      { value: 3, label: "3 Days" },
      { value: 7, label: "7 Days" },
      { value: 15, label: "15 Days" },
      { value: 30, label: "30 Days" }
    ];

  // Auto-set the selectedDuration to the first option when dynamic durations are loaded
  useEffect(() => {
    if (boostPricing && Array.isArray(boostPricing) && boostPricing.length > 0) {
      const uniqueDays = Array.from(new Set(boostPricing.map((p: any) => Number(p.days)))).sort((a, b) => a - b);
      if (uniqueDays.length > 0 && !uniqueDays.includes(selectedDuration)) {
        setSelectedDuration(uniqueDays[0]);
      }
    }
  }, [boostPricing]);

  // Load events & pricing
  useEffect(() => {
    fetchMyEvents();
    fetchBoostPricing();
  }, [fetchMyEvents, fetchBoostPricing]);

  // Helper to dynamically extract plan price from DB configurations
  const getDynamicPrice = (tier: string, duration: number, fallback: number) => {
    if (boostPricing && Array.isArray(boostPricing)) {
      const plan = boostPricing.find(
        (p: any) => p.tier.toUpperCase() === tier.toUpperCase() && Number(p.days) === Number(duration)
      );
      if (plan && plan.price !== undefined) {
        return Number(plan.price);
      }
    }
    return fallback;
  };

  // Filter events to only show approved events whose start date is greater than or equal to current date
  const selectableEvents = myEvents.filter((evt) => {
    const isApproved = evt?.status?.toUpperCase() === "APPROVED";
    const dateStr = evt?.startTime || evt?.startDate;
    if (!dateStr || !isApproved) return false;
    const eventDate = new Date(dateStr);
    return !isNaN(eventDate.getTime()) && eventDate >= new Date();
  });

  // Set default selected event from query param or first selectable event
  useEffect(() => {
    if (eventIdParam && selectableEvents.some((e) => e.id === eventIdParam)) {
      setSelectedEventId(eventIdParam);
    } else if (selectableEvents.length > 0 && (!selectedEventId || !selectableEvents.some((e) => e.id === selectedEventId))) {
      setSelectedEventId(selectableEvents[0].id);
    } else if (selectableEvents.length === 0) {
      setSelectedEventId("");
    }
  }, [selectableEvents, eventIdParam]);

  const handleCheckout = async (tier: "BASIC" | "STANDARD" | "PRO") => {
    if (!selectedEventId || !selectableEvents.some((e) => e.id === selectedEventId)) {
      showAlert("Event Required", "Please select an active approved event to boost first.", "destructive");
      // Scroll to event selector
      const element = document.getElementById("event-selector-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setCheckoutLoading(tier);
    let currentBoostId: string | null = null;

    try {
      await startCustomCheckout({
        createOrder: async () => {
          const response = await requestBoost(selectedEventId, selectedDuration, tier);
          const { boostRequest, razorpayOrder } = response;

          if (!razorpayOrder) {
            throw new Error("Failed to initialize transaction order.");
          }

          currentBoostId = boostRequest.id;

          return {
            razorpayOrder,
            description: `Boost Plan: ${tier} (${selectedDuration} Days)`,
            extraData: boostRequest,
          };
        },
        userInfo: {
          name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email || "",
          phone: user?.phone || "",
        },
        modalTitle: "BookMyTraining",
        themeColor: "#a0f212",
        verifyPayment: async (res) => {
          if (!currentBoostId) {
            throw new Error("Boost request ID missing.");
          }
          return await verifyBoostPayment({
            boostId: currentBoostId,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpayOrderId: res.razorpay_order_id,
            razorpaySignature: res.razorpay_signature,
          });
        },
      });
    } catch (err: any) {
      // Errors handled via hook onError callback
    } finally {
      setCheckoutLoading(null);
    }
  };

  const selectedEvent = selectableEvents.find(e => e.id === selectedEventId);

  return (
    <div className="min-h-screen bg-[#07130e] text-[#ecfdf5] py-12 px-4 sm:px-6 lg:px-8 space-y-24 overflow-hidden rounded-[30px] border border-[#a0f212]/10 relative">

      {/* Glow Backdrops */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#a0f212]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a0f212]/10 border border-[#a0f212]/20 text-[#a0f212] text-xs font-black uppercase tracking-widest"
        >
          <Sparkles className="h-3.5 w-3.5" /> BookMyTraining Spotlight
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white"
        >
          Boost Your Event <span className="inline-block text-[#a0f212] animate-bounce">🚀</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-emerald-100/60 leading-relaxed max-w-2xl mx-auto font-medium"
        >
          Increase your event visibility and reach more learners with our premium promotion plans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2 flex justify-center"
        >
          <button
            onClick={() => setShowPlacementPreview(true)}
            className="inline-flex items-center gap-2 bg-[#a0f212]/10 hover:bg-[#a0f212]/20 border border-[#a0f212]/30 text-[#a0f212] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md"
          >
            <Eye className="h-4 w-4 text-[#a0f212]" /> See Live Placement Previews
          </button>
        </motion.div>
      </div>

      {/* ── EVENT SELECTOR SECTION ───────────────────────────────────────── */}
      <div id="event-selector-section" className="max-w-2xl mx-auto bg-[#0d2218] border border-emerald-950 rounded-3xl p-6 relative z-10 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[#a0f212]">
              Step 1: Select Event to Boost
            </label>
            {selectableEvents.length === 0 && (
              <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                No active events
              </span>
            )}
          </div>

          {selectableEvents.length > 0 ? (
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-[#07130e]/80 border border-emerald-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#a0f212]/50 transition-all cursor-pointer font-bold"
              >
                {selectableEvents.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-[#07130e] text-white">
                    {evt.title} ({evt.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4">
              <p className="text-xs text-emerald-100/40 font-semibold">
                You have no active events.
              </p>
              <Button
                onClick={() => router.push("/host/programs/create")}
                className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
              >
                Create Your First Program
              </Button>
            </div>
          )}

          {selectedEvent && (
            <div className="flex items-center gap-3 p-3 bg-[#07130e]/50 border border-emerald-950 rounded-xl">
              <img
                src={selectedEvent.posterUrl || "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=200"}
                alt=""
                className="w-12 h-12 object-cover rounded-lg shrink-0 border border-emerald-900/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{selectedEvent.title}</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5 tracking-wide">
                  Active in {selectedEvent.mode} Mode
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DURATION SELECTOR ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 relative z-10">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
          Step 2: Choose Campaign Duration
        </span>
        <div className="flex bg-[#0d2218] p-1.5 rounded-2xl border border-emerald-950 max-w-sm w-full">
          {dynamicDurations.map((dur) => {
            const isSelected = selectedDuration === dur.value;
            return (
              <button
                key={dur.value}
                onClick={() => setSelectedDuration(dur.value)}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black transition-all relative ${isSelected ? "text-[#0d1e17]" : "text-emerald-100/50 hover:text-emerald-100"
                  }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="active-dur"
                    className="absolute inset-0 bg-[#a0f212] rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{dur.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PRICING PLANS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {PLANS.map((plan) => {
          const fallbackPrice = plan.prices[selectedDuration as keyof typeof plan.prices];
          const price = getDynamicPrice(plan.tier, selectedDuration, fallbackPrice);
          const isPro = plan.tier === "STANDARD";
          const isLoading = checkoutLoading === plan.tier;

          return (
            <div
              key={plan.tier}
              className={`rounded-[36px] border p-8 flex flex-col bg-gradient-to-b relative group ${plan.gradient} transition-transform hover:-translate-y-1 duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 bg-[#a0f212] text-[#0d1e17] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-black text-white">{plan.name}</h3>
                <p className="text-xs text-emerald-100/50 leading-relaxed font-semibold min-h-[40px]">
                  {plan.description}
                </p>
                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-white tracking-tight">₹{price}</span>
                  <span className="text-xs text-emerald-100/40 font-bold uppercase tracking-wider">
                    / {selectedDuration} Days
                  </span>
                </div>
              </div>

              <div className="border-t border-emerald-950/50 pt-6 flex-1 flex flex-col justify-between">
                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-emerald-100/70 font-semibold">
                      <Check className="h-4 w-4 text-[#a0f212] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleCheckout(plan.tier as any)}
                  disabled={isLoading}
                  className={`w-full py-6 rounded-2xl text-xs font-black shadow-md transition-all ${isPro
                    ? "bg-[#a0f212] text-[#0d1e17] hover:bg-[#aee665] hover:shadow-[0_0_20px_rgba(160,242,18,0.25)]"
                    : "bg-[#0d2218] border border-emerald-900 text-white hover:bg-emerald-950/40"
                    }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Starting...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FEATURE COMPARISON TABLE ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Compare Tiers & Features</h2>
          <p className="text-xs text-emerald-100/40 font-semibold">Analyze core differences side-by-side</p>
        </div>

        <div className="overflow-x-auto bg-[#0d2218] border border-emerald-950 rounded-3xl shadow-xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-emerald-950 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                <th className="p-5">Feature</th>
                <th className="p-5 text-center">Basic</th>
                <th className="p-5 text-center">Pro</th>
                <th className="p-5 text-center">Ultra Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 text-xs text-emerald-100/70 font-semibold">
              {COMPARISON_FEATURES.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-5 text-white">{item.name}</td>
                  <td className="p-5 text-center">
                    {item.basic ? (
                      <Check className="h-4.5 w-4.5 text-[#a0f212] mx-auto" />
                    ) : (
                      <X className="h-4.5 w-4.5 text-emerald-950/60 mx-auto" />
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {item.pro ? (
                      <Check className="h-4.5 w-4.5 text-[#a0f212] mx-auto" />
                    ) : (
                      <X className="h-4.5 w-4.5 text-emerald-950/60 mx-auto" />
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {item.ultra ? (
                      <Check className="h-4.5 w-4.5 text-[#a0f212] mx-auto" />
                    ) : (
                      <X className="h-4.5 w-4.5 text-emerald-950/60 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── WHY BOOST? ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Why Boost Your Workshop?</h2>
          <p className="text-xs text-emerald-100/40 font-semibold">Scale registrations and build brand presence faster</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="bg-[#0d2218] border border-emerald-950 p-6 rounded-3xl space-y-3 shadow-md hover:border-[#a0f212]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#a0f212]/10 border border-[#a0f212]/20 flex items-center justify-center text-[#a0f212]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-extrabold text-white">{benefit.title}</h3>
                <p className="text-xs text-emerald-100/50 leading-relaxed font-semibold">
                  {benefit.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">How It Works</h2>
          <p className="text-xs text-emerald-100/40 font-semibold">Unlock priority exposure in four simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            { step: "01", title: "Choose Plan", desc: "Select the feature tier that matches your scope." },
            { step: "02", title: "Select Duration", desc: "Choose campaign runtime from 3 to 30 days." },
            { step: "03", title: "Complete Payment", desc: "Checkout securely via Razorpay gateway." },
            { step: "04", title: "Event Gets Promoted", desc: "Activates instantly and starts drawing traffic." }
          ].map((item, i) => (
            <div key={i} className="bg-[#0d2218] border border-emerald-950 p-6 rounded-3xl space-y-4 shadow-sm relative">
              <span className="text-3xl font-black text-[#a0f212]/20 block">{item.step}</span>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-white">{item.title}</h3>
                <p className="text-[10px] text-emerald-100/50 leading-relaxed font-semibold">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQS ─────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto space-y-10 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-2">
            <FaqIcon className="h-6 w-6 text-[#a0f212]" /> Frequently Asked Questions
          </h2>
          <p className="text-xs text-emerald-100/40 font-semibold">Answers to popular boost configurations</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div
                key={i}
                className="bg-[#0d2218] border border-emerald-950 rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-emerald-900"
                onClick={() => setActiveFaq(isOpen ? null : i)}
              >
                <div className="p-5 flex justify-between items-center">
                  <h3 className="text-xs font-black text-white">{faq.q}</h3>
                  <span className="text-[#a0f212] font-black text-sm">{isOpen ? "−" : "+"}</span>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-emerald-950/50"
                    >
                      <p className="p-5 text-xs text-emerald-100/50 leading-relaxed font-semibold">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0d2218] to-[#122e20] border border-[#a0f212]/25 rounded-[40px] p-8 sm:p-12 text-center space-y-6 relative z-10 shadow-2xl overflow-hidden">
        {/* Glow corner inside CTA */}
        <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-[#a0f212]/10 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl sm:text-4xl font-black text-white">Ready to reach more learners?</h2>
        <p className="text-xs sm:text-sm text-emerald-100/60 max-w-lg mx-auto leading-relaxed font-medium">
          Start boosting your workshop now and see your attendance scale up with priority listing placement.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => {
              const element = document.getElementById("event-selector-section");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="bg-[#a0f212] hover:bg-[#aee665] text-[#0d1e17] text-xs font-black px-8 py-6 rounded-2xl shadow-xl hover:shadow-[0_0_20px_rgba(160,242,18,0.3)] transition-all inline-flex items-center gap-2"
          >
            Boost My Event <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Placement Preview Modal */}
      {showPlacementPreview && (
        <PlacementPreviewModal
          isOpen={showPlacementPreview}
          onClose={() => setShowPlacementPreview(false)}
        />
      )}

    </div>
  );
}
