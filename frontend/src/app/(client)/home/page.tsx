"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Calendar, BookOpen, Clock, MapPin, ArrowRight, PlayCircle, Star, Award 
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import Footer from "@/components/common/Footer";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_PROGRAMS, MOCK_BOOKINGS } from "@/constants/mockData";

export default function ClientHomePage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is not authenticated, direct to login page
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  // Get current bookings
  const upcomingBookings = MOCK_BOOKINGS.filter(b => b.status === "confirmed");
  
  // Recommended programs (first 3 approved programs not currently booked)
  const bookedIds = MOCK_BOOKINGS.map(b => b.programId);
  const recommendations = MOCK_PROGRAMS
    .filter(p => p.status === "approved" && !bookedIds.includes(p.id))
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Greeting Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-8 sm:p-10 shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,_rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="relative z-10 max-w-xl space-y-3">
              <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
                Client Feed
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Hello, {user.name}!
              </h1>
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                Ready to develop your skill set? You have {upcomingBookings.length} upcoming workshop{upcomingBookings.length === 1 ? "" : "s"} scheduled. Check your tickets below.
              </p>
              <div className="pt-2">
                <Link href="/programs">
                  <Button variant="glass" className="bg-white text-primary hover:bg-white/95 rounded-xl text-xs h-9">
                    Browse New Skills
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="rounded-2xl border-border/40">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Total Hours Trained
                  </span>
                  <div className="text-2xl font-extrabold text-foreground">16 hrs</div>
                </div>
                <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/40">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Completed Workshops
                  </span>
                  <div className="text-2xl font-extrabold text-foreground">4 Courses</div>
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
                  <BookOpen className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/40">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Certifications Earned
                  </span>
                  <div className="text-2xl font-extrabold text-foreground">1 Certificate</div>
                </div>
                <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Upcoming Classes & Tickets */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Upcoming Bookings
                </h2>
                <Link href="/bookings" className="text-xs font-semibold text-primary hover:underline">
                  View Booking History
                </Link>
              </div>

              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden border-border/40 rounded-2xl">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 aspect-video sm:aspect-auto bg-muted relative">
                          <img
                            src={booking.programImage}
                            alt={booking.programTitle}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              Booking Confirmed
                            </span>
                            <span className="text-xs text-muted-foreground">ID: {booking.id}</span>
                          </div>
                          
                          <h3 className="font-bold text-base text-foreground leading-tight">
                            {booking.programTitle}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5" /> {booking.date}</span>
                            <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> {booking.time}</span>
                            <span className="flex items-center sm:col-span-2"><MapPin className="h-3.5 w-3.5 mr-1.5" /> {booking.location}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                            <span className="text-xs text-muted-foreground">Hosted by <span className="font-medium text-foreground">{booking.hostName}</span></span>
                            <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={() => showAlert("Room Launching", "Launching your live workshop room. Please allow your browser popup windows access.", "info")}>
                              <PlayCircle className="mr-1.5 h-4 w-4" /> Start Class
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-2xl bg-card border-dashed border-border/60 space-y-3">
                  <p className="text-muted-foreground text-sm">No upcoming classes scheduled.</p>
                  <Link href="/programs">
                    <Button size="sm" className="rounded-lg">Browse Workshops</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Recommended & Helpful tips */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Suggested for You
              </h2>

              <div className="space-y-4">
                {recommendations.map((prog) => (
                  <Card key={prog.id} className="overflow-hidden border-border/40 rounded-2xl">
                    <div className="aspect-video w-full relative bg-muted">
                      <img
                        src={prog.imageUrl}
                        alt={prog.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                        {prog.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-foreground">{prog.rating}</span>
                        </div>
                        <div className="text-sm font-extrabold text-foreground">${prog.price}</div>
                      </div>

                      <Link href={`/programs/${prog.id}`}>
                        <Button className="w-full h-9 text-xs rounded-xl mt-2" variant="secondary">
                          View Details <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
