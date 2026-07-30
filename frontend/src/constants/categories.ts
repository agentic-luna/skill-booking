import { Compass, Heart, Briefcase, Flower2, LucideIcon } from "lucide-react";

export interface CategoryInfo {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  badgeColor: string;
  keywords: string[];
}

export const CATEGORIES: readonly CategoryInfo[] = [
  {
    value: "life-coaching",
    label: "Life Coaching",
    description: "Mind Power, NLP, EFT, Law of Attraction & Manifestation workshops",
    icon: Compass,
    color: "from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-500/30",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    keywords: ["Mind Power", "NLP", "EFT", "Law of Attraction", "Manifestation"],
  },
  {
    value: "relationship",
    label: "Relationship",
    description: "Marriage counseling, relationship growth, communication & bond building",
    icon: Heart,
    color: "from-rose-500/20 to-pink-500/20 text-rose-600 border-rose-500/30",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    keywords: ["Relationship", "Marriage", "Communication", "Conflict Resolution", "Intimacy"],
  },
  {
    value: "business",
    label: "Business",
    description: "Leadership, sales, marketing, HR, operations & system scaling masterclasses",
    icon: Briefcase,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-600 border-blue-500/30",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    keywords: ["Leadership", "Sales", "Marketing", "HR", "Operation", "Scale up", "System Building"],
  },
  {
    value: "trauma-healing",
    label: "Trauma Healing",
    description: "Mindfulness, meditation, yoga, Reiki, access bars & spiritual healing",
    icon: Flower2,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-500/30",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    keywords: ["EFT", "Mindfulness", "Meditation", "Yoga", "Healing", "Reiki", "Access bars", "Spiritual healing"],
  },
] as const;

export function getCategoryMeta(val?: string): CategoryInfo {
  const found = CATEGORIES.find((c) => c.value === val?.toLowerCase());
  return found || CATEGORIES[0];
}
