import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OJSDef — OJS Integrated Security Scanner (SaaS)",
  description: "Enterprise-grade vulnerability detection, real-time risk scoring, and comprehensive security reports for Open Journal Systems (OJS).",
  keywords: ["OJS", "Security", "Scanner", "Vulnerability Detection", "SaaS", "Cybersecurity"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full font-sans bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}