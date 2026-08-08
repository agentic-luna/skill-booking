export interface Program {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  instructorAvatar: string;
  category: "life-coaching" | "relationship" | "business" | "trauma-healing";
  keywords?: string[];
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
  isBoosted?: boolean;
  boostTier?: string;
  hasSearchPriority?: boolean;
  hasHeroBanner?: boolean;
  hasTrendingSection?: boolean;
  hasFeaturedOrganizerBadge?: boolean;
  videoUrls?: string[];
  images?: string[];
  ticketTypes?: { name: string; price: number; totalSeats: number }[];
  mode?: "ONLINE" | "OFFLINE";
  hostId?: string;
  companyName?: string;
  instructorBio?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  commission?: {
    commissionType: "FIXED" | "PERCENTAGE";
    platformValue: number;
  } | null;
  startTime?: string;
  whatIsThisProgram?: string;
  whoIsThisFor?: string;
  whatWillYouLearn?: string;
  topicsCovered?: string;
  mediumOfLanguage?: string;
  prerequisites?: string;
  takeaways?: string;
  toolsGiven?: string;
}

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog_1",
    title: "NLP & Mind Power Transformation Bootcamp",
    description: "Deep dive into Neuro-Linguistic Programming, subconscious re-wiring, Law of Attraction, and manifestation protocols with certified life coaches.",
    instructorName: "Dr. Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "life-coaching",
    keywords: ["Mind Power", "NLP", "Law of Attraction", "Manifestation"],
    rating: 4.9,
    reviewsCount: 142,
    price: 99,
    duration: "6 hours (2 days)",
    date: typeof window !== "undefined" ? new Date().toISOString().split("T")[0] : "2026-07-12",
    time: "10:00 AM - 1:00 PM IST",
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
    title: "Trauma Release & Somatic EFT Healing Workshop",
    description: "Master Emotional Freedom Techniques (EFT), somatic breathwork, Reiki energy alignment, and deep meditation for emotional liberation.",
    instructorName: "Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
    category: "trauma-healing",
    keywords: ["EFT", "Mindfulness", "Meditation", "Healing"],
    rating: 4.8,
    reviewsCount: 98,
    price: 75,
    duration: "4 hours (Single Day)",
    date: "2026-07-20",
    time: "02:00 PM - 6:00 PM IST",
    spotsLeft: 8,
    maxSpots: 12,
    location: "Healing Sanctuary, Ernakulam",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_3",
    title: "Conscious Relationship & Intimacy Masterclass",
    description: "Learn relationship dynamics, conflict resolution, active empathetic communication, and deep emotional bond building for couples and individuals.",
    instructorName: "Coach David Miller",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    category: "relationship",
    keywords: ["Relationship", "Marriage", "Communication", "Intimacy"],
    rating: 4.7,
    reviewsCount: 65,
    price: 120,
    duration: "10 hours (3 days)",
    date: "2026-07-18",
    time: "09:00 AM - 12:30 PM IST",
    spotsLeft: 15,
    maxSpots: 30,
    location: "Kochi Cultural Center, Ernakulam",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_4",
    title: "Business System Building & Scaling Masterclass",
    description: "Develop high-performing business operations, sales pipelines, marketing automation, HR leadership strategies, and system scaling blueprints.",
    instructorName: "Alexander Wright",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    category: "business",
    keywords: ["Leadership", "Sales", "Marketing", "Scale up", "System Building"],
    rating: 4.9,
    reviewsCount: 110,
    price: 150,
    duration: "3.5 hours",
    date: "2026-07-22",
    time: "04:30 PM - 8:00 PM IST",
    spotsLeft: 3,
    maxSpots: 10,
    location: "Grand Hyatt Business Hub, Kochi",
    imageUrl: "https://images.unsplash.com/photo-1500051644681-159e1022982c?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: true,
    mode: "OFFLINE",
  },
  {
    id: "prog_5",
    title: "Manifestation & Subconscious Mind Power Secrets",
    description: "Learn how to access theta state, clear limiting subconscious beliefs, and implement daily Law of Attraction practices for financial and personal abundance.",
    instructorName: "Dr. Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "life-coaching",
    keywords: ["Mind Power", "Manifestation", "Law of Attraction"],
    rating: 4.9,
    reviewsCount: 87,
    price: 110,
    duration: "5 hours",
    date: "2026-07-29",
    time: "11:00 AM - 4:00 PM IST",
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
    title: "Holistic Yoga, Access Bars & Reiki Energy Healing",
    description: "An intensive experiential retreat focusing on chakra balancing, access bars points activation, pranayama, and ancient Reiki energy healing practices.",
    instructorName: "Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    category: "trauma-healing",
    keywords: ["Yoga", "Healing", "Reiki", "Access bars", "Spiritual healing"],
    rating: 4.8,
    reviewsCount: 45,
    price: 130,
    duration: "3 hours",
    date: "2026-08-02",
    time: "01:00 PM - 4:00 PM IST",
    spotsLeft: 4,
    maxSpots: 15,
    location: "Varkala Cliff Retreat, Thiruvananthapuram",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    status: "approved",
    featured: false,
    mode: "OFFLINE",
  },
  {
    id: "prog_7",
    title: "Reiki Energy & Chakra Balancing",
    description: "Learn dynamic energy healing models, rim filters, and high-vibration retouching protocols.",
    instructorName: "Elena Rostova",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    category: "trauma-healing",
    rating: 4.8,
    reviewsCount: 32,
    price: 135,
    duration: "4 hours",
    date: "2026-08-05",
    time: "09:00 AM - 1:00 PM IST",
    spotsLeft: 6,
    maxSpots: 8,
    location: "Studio 404, Ernakulam",
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600",
    status: "pending",
    featured: false,
    mode: "OFFLINE",
  },
  {
    id: "prog_8",
    title: "HR & Operations Scale Up Masterclass",
    description: "Deep dive into business leadership, team structure, hiring frameworks, and scaling operations.",
    instructorName: "Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    category: "business",
    rating: 5.0,
    reviewsCount: 19,
    price: 145,
    duration: "4 hours",
    date: "2026-08-10",
    time: "10:00 AM - 2:00 PM IST",
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
    time: "10:00 AM - 1:00 PM IST",
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
    time: "09:00 AM - 12:30 PM IST",
    location: "Iron Gym, Chicago IL",
    hostName: "Coach David Miller",
  }
];
