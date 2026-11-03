'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Smartphone,
  Laptop,
  Calculator,
  Bike,
  Home,
  PenTool,
  Dumbbell,
  Package,
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Repeat,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { Product, Category } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchHero, setSearchHero] = useState('');

  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen className="w-5 h-5 text-indigo-600" />,
    Smartphone: <Smartphone className="w-5 h-5 text-indigo-600" />,
    Laptop: <Laptop className="w-5 h-5 text-indigo-600" />,
    Calculator: <Calculator className="w-5 h-5 text-indigo-600" />,
    Bike: <Bike className="w-5 h-5 text-indigo-600" />,
    Home: <Home className="w-5 h-5 text-indigo-600" />,
    PenTool: <PenTool className="w-5 h-5 text-indigo-600" />,
    Dumbbell: <Dumbbell className="w-5 h-5 text-indigo-600" />,
    Package: <Package className="w-5 h-5 text-indigo-600" />,
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products/?ordering=-view_count'),
          api.get('/categories/'),
        ]);

        const allProds = prodRes.data.results || prodRes.data;
        setFeaturedProducts(allProds.slice(0, 8));
        setRecentProducts(allProds.slice(8, 16));
        setCategories(catRes.data.results || catRes.data);
      } catch (e) {
        console.error('Error fetching homepage data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchHero.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchHero.trim())}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80">
        {/* Ambient Hero Glow Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-20 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-10 right-1/4 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-subtle-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Student badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-xs backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Exclusively for College & University Students</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Your Campus.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                Your Marketplace.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Ditch unorganized WhatsApp groups. Buy, sell, and exchange verified textbooks, scientific calculators, bicycles, laptops, and hostel essentials directly within your college.
            </p>

            {/* Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="max-w-xl mx-auto flex items-center bg-white/95 rounded-full p-2 border border-slate-300 shadow-xl shadow-indigo-100/60 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100/80 transition-all backdrop-blur-md"
            >
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchHero}
                onChange={(e) => setSearchHero(e.target.value)}
                placeholder="Search textbooks, Casio FX-991, cycles, kettles..."
                className="w-full px-3 py-2 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-full shrink-0 shadow-sm transition-colors flex items-center gap-1.5"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold px-6 py-3 rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
              >
                Explore Marketplace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-800 text-base font-semibold px-6 py-3 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all backdrop-blur-xs"
              >
                Start Selling Today
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-slate-200/80 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium">Verified Campus IDs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">₹0</p>
                <p className="text-xs text-slate-500 font-medium">Zero Commission</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Instant</p>
                <p className="text-xs text-slate-500 font-medium">Hand-to-Hand Exchange</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Popular Categories
            </h2>
            <p className="text-sm text-gray-500 mt-1">Browse items commonly needed each semester</p>
          </div>
          <Link
            href="/marketplace"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            All categories <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${cat.slug}`}
              className="group p-4 bg-white/80 hover:bg-white backdrop-blur-xs rounded-2xl border border-slate-200/80 hover:border-indigo-400/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50/80 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                {iconMap[cat.icon] || <Package className="w-5 h-5 text-indigo-600 group-hover:text-white" />}
              </div>
              <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-xs text-slate-400">
                {cat.product_count !== undefined ? `${cat.product_count} items` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> High Demand on Campus
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Featured Campus Listings
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all ({featuredProducts.length + recentProducts.length}) <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-80 rounded-2xl" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No products found</p>
            <p className="text-sm text-gray-500 mt-1">Be the first student to post an item for sale!</p>
            <Link
              href="/sell"
              className="inline-block mt-4 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            >
              Post a Listing
            </Link>
          </div>
        )}
      </section>

      {/* 4. How CampusLoop Works */}
      <section className="bg-slate-100/40 border-y border-slate-200/80 py-16 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
              Simple 3-Step Exchange
            </span>
            <h2 className="text-3xl font-bold text-slate-950 tracking-tight mt-1">
              How CampusLoop Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed specifically for offline campus life. No complex shipping, no credit card transaction cuts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/85 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 relative backdrop-blur-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center mb-6 shadow-xs border border-indigo-100">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">List or Discover Items</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a quick photo of your unused textbook, calculator, or cycle. Add your price and publish it to students in your campus instantly.
              </p>
            </div>

            <div className="bg-white/85 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 relative backdrop-blur-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center mb-6 shadow-xs border border-indigo-100">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Send an Enquiry & Coordinate</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interested buyers submit purchase enquiries. Sellers review student profiles, accept, and lock in the item reservation.
              </p>
            </div>

            <div className="bg-white/85 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 relative backdrop-blur-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center mb-6 shadow-xs border border-indigo-100">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Meet at Campus & Exchange</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Meet at your campus library, hostel, or canteen. Inspect the item in person and pay directly via Cash or UPI with zero fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Recently Listed Section */}
      {recentProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" /> Just Added
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
                Recently Listed Products
              </h2>
            </div>
            <Link
              href="/marketplace?ordering=-created_at"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Browse all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Student Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
            Real Student Feedback
          </span>
          <h2 className="text-3xl font-bold text-gray-950 tracking-tight mt-1">
            Loved by Students Across Campuses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              &quot;I sold my 2nd-year Engineering Mathematics and Algorithm books in less than 3 hours to a junior in Hostel 12. No spam, no random WhatsApp messages.&quot;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                AM
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Aarav Mehta</p>
                <p className="text-xs text-gray-500">CS 3rd Year, IIT Bombay</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              &quot;Saved over ₹4,000 on my Casio ClassWiz scientific calculator and mini-drafter before first semester exams. CampusLoop made the handoff so effortless.&quot;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                BN
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Bhavya Nair</p>
                <p className="text-xs text-gray-500">EEE 2nd Year, BITS Pilani</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              &quot;Got a sturdy campus cycle for just ₹2,500 from a graduating senior. Verified college profiles give 100% peace of mind against frauds.&quot;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                RV
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Rohan Verma</p>
                <p className="text-xs text-gray-500">Civil 2nd Year, NIT Trichy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Safety Tips Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Safe Campus Trading Promise
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trade Safely. Keep Campus Commerce Clean.
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              CampusLoop only admits students with verified institutional email domains. Always inspect items in daylight at high-traffic campus locations like the central library or student cafeteria.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-gray-950 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Join Your Campus Community Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
