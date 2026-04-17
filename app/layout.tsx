// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OJS Dashboard",
  description: "OJS Integrated Security",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Cuma body dan children doang, biar Landing Page bisa full screen */}
      <body className="min-h-screen bg-[#020b1d] text-white">
        {children}
      </body>
    </html>
  );
}