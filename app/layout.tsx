import type { Metadata, Viewport } from "next";
import React from "react";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OJSDef — OJS Integrated Security Scanner (SaaS Core)",
  description: "Enterprise-grade vulnerability detection, real-time risk scoring, and comprehensive security reports for Open Journal Systems (OJS).",
  keywords: ["OJS", "Security", "Scanner", "Vulnerability Detection", "SaaS", "Cybersecurity"],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html 
      lang="en"
      data-scroll-behavior="smooth" 
      className={`${inter.variable} ${outfit.variable} ${jetbrains.variable} h-full antialiased dark scroll-smooth`}
    >
      <body className="min-h-full font-outfit bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}