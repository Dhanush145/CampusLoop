import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusLoop – Buy. Sell. Exchange. Within Your Campus.",
  description:
    "Student-exclusive campus marketplace for buying, selling, and exchanging course textbooks, scientific calculators, laptops, cycles, and hostel essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white relative">
        {/* Subtle Ambient Background Gradients & Grid Pattern */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Top Center Indigo Glow */}
          <div className="radial-glow-top" />
          {/* Accent Right Blue Glow */}
          <div className="radial-glow-accent" />
          {/* Bottom Left Subtle Emerald/Indigo Glow */}
          <div className="radial-glow-bottom-left" />
          {/* Subtle Grid Dot Matrix */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        </div>

        {/* Header Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
