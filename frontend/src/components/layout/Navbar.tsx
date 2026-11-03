'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  PlusCircle,
  Search,
  Bell,
  LogOut,
  LayoutDashboard,
  Package,
  ShieldCheck,
  Menu,
  X,
  Repeat,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, unreadCount, fetchProfile, fetchUnreadCount } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Rehydrate user from localStorage on mount
    const savedUser = localStorage.getItem('user_data');
    const token = localStorage.getItem('access_token');
    if (savedUser && token) {
      try {
        useStore.getState().setUser(JSON.parse(savedUser), token);
        fetchProfile();
        fetchUnreadCount();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/marketplace');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          Student Verified
        </span>
        <span>CampusLoop: Buy, Sell, and Exchange second-hand items securely within your university campus!</span>
        <Link href="/marketplace" className="underline underline-offset-2 hover:text-indigo-200 ml-1">
          Explore listings &rarr;
        </Link>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Repeat className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-1">
                Campus<span className="text-indigo-600">Loop</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-500 tracking-wider -mt-1 uppercase">
                Campus Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search textbooks, calculators, cycles, hostel items..."
              className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-sm text-gray-800 rounded-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          {/* Nav Links & Actions */}
          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Marketplace
            </Link>

            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Start Selling
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <Link
                  href="/wishlist"
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors relative"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <Link
                  href="/dashboard?tab=notifications"
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {user?.full_name ? user.full_name[0] : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-sm animate-in fade-in-50 zoom-in-95"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.student_profile?.college_name && (
                          <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                            {user.student_profile.college_name}
                          </span>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Student Dashboard
                      </Link>

                      <Link
                        href="/dashboard?tab=listings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <Package className="w-4 h-4" />
                        My Listings
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                      >
                        <Heart className="w-4 h-4" />
                        Saved Items
                      </Link>

                      {user?.is_staff && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-amber-600 hover:bg-amber-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 pl-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
                >
                  Join Campus
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus marketplace..."
                className="w-full bg-gray-50 text-sm rounded-lg pl-9 pr-3 py-2 border border-gray-200"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex flex-col space-y-2 pt-2">
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/sell"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50"
              >
                Sell an Item
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Dashboard & Enquiries
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="text-left px-3 py-2 text-rose-600 font-medium rounded-lg hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg font-medium text-sm text-gray-700"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

