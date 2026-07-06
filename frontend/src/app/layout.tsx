import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import GlobalAlert from "@/components/common/GlobalAlert";

const hanken = Hanken_Grotesk({
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
      <body 
        className={`${hanken.variable} font-sans min-h-screen text-foreground antialiased`}
        style={{ background: "radial-gradient(50% 95% at 50% 108.6%, var(--color-linen-canvas) 0%, var(--color-spotlight-gradient) 100%)", backgroundAttachment: "fixed" }}
      >
        <QueryProvider>
          <ThemeProvider>
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <GlobalAlert />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
