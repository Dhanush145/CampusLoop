'use client';

import React from 'react';
import Link from 'next/link';
import { Repeat, ShieldCheck, Heart, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">
                <Repeat className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Campus<span className="text-indigo-400">Loop</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              The premier student-exclusive marketplace for buying, selling, and exchanging verified textbooks, electronics, cycles, and hostel essentials within your college.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-3 py-1.5 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Domain Verified Only</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/marketplace?category=textbooks" className="hover:text-white transition-colors">
                  Engineering & Course Textbooks
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=calculators" className="hover:text-white transition-colors">
                  Scientific Calculators (Casio)
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=cycles" className="hover:text-white transition-colors">
                  Campus Cycles & Bicycles
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=laptops" className="hover:text-white transition-colors">
                  Laptops, Monitors & Keyboards
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=hostel" className="hover:text-white transition-colors">
                  Hostel Kettles, Desks & Mattresses
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=stationery" className="hover:text-white transition-colors">
                  Mini Drafters & Lab Stationery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Trust & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Safety Guidelines
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Always meet at public campus spots (Canteen, Library, Main Gate).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Verify item physical condition before making offline payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Use college email verification to verify student identity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Report fraudulent or suspicious listings immediately.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Supported Colleges */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Partner Campuses
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>IIIT Dharwad (Karnataka)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>IIT Bombay (Powai, Mumbai)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>BITS Pilani (Pilani Campus)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>NIT Trichy (Tiruchirappalli)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Delhi Technological University (DTU)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 CampusLoop Inc. All rights reserved. Designed for University Portfolios.</p>
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="hover:text-gray-400">
              Marketplace
            </Link>
            <Link href="/sell" className="hover:text-gray-400">
              Sell on Campus
            </Link>
            <Link href="/login" className="hover:text-gray-400">
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
