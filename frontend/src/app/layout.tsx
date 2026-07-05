import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BookMySkill | Skill Training & Event Booking Marketplace",
  description: "High-fidelity platform to discover, book, and host skill-building events and professional training courses.",
  keywords: ["skills", "events", "courses", "booking", "training", "marketplace"],
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
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground antialiased`}>
        <QueryProvider>
          <ThemeProvider defaultTheme="system" storageKey="bookmyskill-theme">
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
