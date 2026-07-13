export interface Program {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorAvatar: string;
  category: "technology" | "design" | "fitness" | "culinary" | "business" | "photography";
  rating: number;
  reviewsCount: number;
  price: number;
  duration: string;
  date: string;
  time: string;
  spotsLeft: number;
  maxSpots: number;
  location: string;
  imageUrl: string;
  status: "approved" | "pending" | "rejected";
  featured?: boolean;
  mode?: "ONLINE" | "OFFLINE";
  companyName?: string;
}

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog_1",
    title: "Next.js 15 & React 19 Mastery Workshop",
    description: "Deep dive into React Server Components, Server Actions, App Router architecture, and production-level state management with custom Zustand stores.",
    instructorName: "Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "technology",
    rating: 4.9,
    reviewsCount: 142,
    price: 99,
    duration: "6 hours (2 days)",
    date: typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "2026-07-12",
    time: "10:00 AM - 1:00 PM EST",
    spotsLeft: 5,
    maxSpots: 20,
    location: "Online (Live Zoom Link)",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "ONLINE",
  },
  {
    id: "prog_2",
    title: "Artisanal Sourdough Baking for Beginners",
    description: "Master the art of lacto-fermentation, wild yeast starters, dough hydration formulas, stretch-and-fold techniques, and professional oven-steaming setups.",
    instructorName: "Chef Marc Dupont",
    instructorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
    category: "culinary",
    rating: 4.8,
    reviewsCount: 98,
    price: 75,
    duration: "4 hours (Single Day)",
    date: "2026-07-20",
    time: "02:00 PM - 6:00 PM EST",
    spotsLeft: 8,
    maxSpots: 12,
    location: "Sourdough Studio, Brooklyn NY",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_3",
    title: "High-Intensity Interval Training (HIIT) Coach Prep",
    description: "Learn body mechanics, aerobic progression, safety protocols, rhythm setting, and workout flow design to launch your career as a professional HIIT instructor.",
    instructorName: "Coach David Miller",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    category: "fitness",
    rating: 4.7,
    reviewsCount: 65,
    price: 120,
    duration: "10 hours (3 days)",
    date: "2026-07-18",
    time: "09:00 AM - 12:30 PM EST",
    spotsLeft: 15,
    maxSpots: 30,
    location: "Iron Gym, Chicago IL",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_4",
    title: "Street Photography: Capturing Urban Light & Shadow",
    description: "Develop your eye for candid compositions, geometry, manual lens focusing, shadows adjustment, and visual storytelling in dense urban environments.",
    instructorName: "Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    category: "photography",
    rating: 4.9,
    reviewsCount: 110,
    price: 85,
    duration: "3.5 hours",
    date: "2026-07-22",
    time: "04:30 PM - 8:00 PM EST",
    spotsLeft: 3,
    maxSpots: 10,
    location: "Times Square Meeting Area, NY",
    imageUrl: "https://images.unsplash.com/photo-1500051644681-159e1022982c?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_5",
    title: "UI/UX Figma Design Systems at Scale",
    description: "Build robust, variables-driven design systems, tokens configuration, component libraries, responsive grids, and accessible interactive prototypes.",
    instructorName: "Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "design",
    rating: 4.9,
    reviewsCount: 87,
    price: 110,
    duration: "5 hours",
    date: "2026-07-29",
    time: "11:00 AM - 4:00 PM EST",
    spotsLeft: 12,
    maxSpots: 25,
    location: "Online (Live Zoom Link)",
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: false,
    mode: "ONLINE",
  },
  {
    id: "prog_6",
    title: "Startup Pitch Deck Design & Storytelling",
    description: "Craft a compelling venture capital pitch deck. Understand market sizing estimation, valuation summaries, competitive maps, and presenter stage presence.",
    instructorName: "Alexander Wright",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    category: "business",
    rating: 4.6,
    reviewsCount: 45,
    price: 150,
    duration: "3 hours",
    date: "2026-08-02",
    time: "01:00 PM - 4:00 PM EST",
    spotsLeft: 0,
    maxSpots: 15,
    location: "WeWork Financial District, Boston",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: false,
    mode: "OFFLINE",
  },
  {
    id: "prog_7",
    title: "Advanced Portrait Photography Lighting",
    description: "Learn dynamic studio lighting models using softboxes, key lights, bounce flags, rim filters, and high-key portraits retouching protocols in Adobe Lightroom.",
    instructorName: "Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    category: "photography",
    rating: 4.8,
    reviewsCount: 32,
    price: 135,
    duration: "4 hours",
    date: "2026-08-05",
    time: "09:00 AM - 1:00 PM EST",
    spotsLeft: 6,
    maxSpots: 8,
    location: "Studio 404, Brooklyn NY",
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600",
    status: "pending",
    featured: false,
    mode: "OFFLINE",
  },
  {
    id: "prog_8",
    title: "Advanced TypeScript 5.0 Design Patterns",
    description: "Deep dive into generics constraints, conditional types mapping, template literal types, decorators, and writing custom type assertions for bulletproof APIs.",
    instructorName: "Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "technology",
    rating: 5.0,
    reviewsCount: 19,
    price: 145,
    duration: "4 hours",
    date: "2026-08-10",
    time: "10:00 AM - 2:00 PM EST",
    spotsLeft: 4,
    maxSpots: 10,
    location: "Online (Live Zoom Link)",
    imageUrl: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=600",
    status: "pending",
    featured: false,
    mode: "ONLINE",
  }
];

export interface Booking {
  id: string;
  programId: string;
  programTitle: string;
  programImage: string;
  bookingDate: string;
  amountPaid: number;
  status: "confirmed" | "completed" | "cancelled" | "refunded";
  spotsBooked: number;
  date: string;
  time: string;
  location: string;
  hostName: string;
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk_1",
    programId: "prog_1",
    programTitle: "Next.js 15 & React 19 Mastery Workshop",
    programImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600",
    bookingDate: "2026-06-28",
    amountPaid: 99,
    status: "confirmed",
    spotsBooked: 1,
    date: "2026-07-15",
    time: "10:00 AM - 1:00 PM EST",
    location: "Online (Live Zoom Link)",
    hostName: "Sarah Jenkins",
  },
  {
    id: "bk_2",
    programId: "prog_3",
    programTitle: "High-Intensity Interval Training (HIIT) Coach Prep",
    programImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    bookingDate: "2026-05-12",
    amountPaid: 120,
    status: "completed",
    spotsBooked: 1,
    date: "2026-05-20",
    time: "09:00 AM - 12:30 PM EST",
    location: "Iron Gym, Chicago IL",
    hostName: "Coach David Miller",
  }
];
