"use client";

import Link from "next/link";
import { Sparkles, Mail, Github, Twitter, Linkedin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAlertStore } from "@/features/alerts/store/alertStore";

export default function Footer() {
  const showAlert = useAlertStore((s) => s.showAlert);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    showAlert("Subscription Confirmed", "Mock newsletter subscription successful! You'll now receive our monthly skill updates.", "success");
  };

  return (
    <footer className="bg-bone-white py-16 text-sm relative z-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold tracking-tight text-graphite-ink">
                BookMy<span className="text-nightshade-black/70">Skill</span>
              </span>
            </Link>
            <p className="text-stone-grey text-xs leading-relaxed">
              Empowering individuals by connecting eager learners with verified field experts for live, interactive events and skill workshops.
            </p>
            <div className="flex space-x-3 text-stone-grey pt-2">
              <a href="#" className="hover:text-graphite-ink transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-graphite-ink transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="hover:text-graphite-ink transition-colors"><Github className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Column 2: Browse */}
          <div className="space-y-3">
            <h4 className="font-semibold text-graphite-ink">Explore</h4>
            <ul className="space-y-2 text-xs text-stone-grey">
              <li><Link href="/programs?category=tech" className="hover:text-graphite-ink">Technology & Coding</Link></li>
              <li><Link href="/programs?category=design" className="hover:text-graphite-ink">UI/UX & Graphic Design</Link></li>
              <li><Link href="/programs?category=fitness" className="hover:text-graphite-ink">Health & Fitness</Link></li>
              <li><Link href="/programs?category=culinary" className="hover:text-graphite-ink">Culinary Arts</Link></li>
            </ul>
          </div>

          {/* Column 3: For Hosts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-graphite-ink">For Instructors</h4>
            <ul className="space-y-2 text-xs text-stone-grey">
              <li><Link href="/register?role=host" className="hover:text-graphite-ink">Become a Host</Link></li>
              <li><a href="#" className="hover:text-graphite-ink">Host Guidelines</a></li>
              <li><a href="#" className="hover:text-graphite-ink">Earnings & Fees</a></li>
              <li><a href="#" className="hover:text-graphite-ink">Promotion Tips</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4 col-span-1">
            <h4 className="font-semibold text-graphite-ink">Stay Updated</h4>
            <p className="text-stone-grey text-xs leading-relaxed">
              Subscribe to get notified about upcoming trending skills and workshops.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-stone-grey/60" />
                <Input
                  type="email"
                  placeholder="Your email"
                  required
                  className="pl-9 h-9 text-xs bg-haze/40 border-clay-shadow/60 text-graphite-ink placeholder:text-stone-grey/60 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" size="sm" className="h-9 text-xs rounded-xl">
                Join
              </Button>
            </form>
          </div>

        </div>

        {/* Divider & Credits */}
        {/* <div className="border-t border-clay-shadow/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-stone-grey/80 gap-4">
          <span>&copy; {new Date().getFullYear()} BookMySkill. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-stone-grey/80" /> by Antigravity IDE team.
          </span>
        </div> */}
      </div>
    </footer>
  );
}
