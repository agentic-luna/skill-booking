import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import GlobalAlert from "@/components/common/GlobalAlert";

import Navbar from "@/components/common/Navbar";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BookMyTraining | Training & Event Booking Marketplace",
  description: "Marketplace for physical and online training workshops, book, and host training events and professional training courses.",
  keywords: ["training", "events", "courses", "booking", "marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body 
        className={`${hanken.variable} font-sans min-h-screen text-foreground antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <Navbar />
                {children}
              </div>
              <GlobalAlert />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
