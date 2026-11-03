'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Repeat, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.post('/auth/login/', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPass,
      });

      const { user, access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user, access);

      router.push(nextUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Repeat className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Campus<span className="text-indigo-600">Loop</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-gray-950 tracking-tight">
          Welcome back to campus
        </h2>
        <p className="text-sm text-gray-500">
          Sign in using your institutional college credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 space-y-6">
        {/* Quick Demo Login Bar for Evaluators */}
        <div className="bg-indigo-50/90 backdrop-blur-md border border-indigo-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            1-Click Demonstration Accounts
          </div>
          <p className="text-xs text-indigo-700">
            Click below to instantly log in for project evaluation & live testing:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleLogin(undefined, 'student_a@iitb.ac.in', 'student123')}
              className="bg-white/90 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 font-bold text-xs py-2 px-2.5 rounded-xl transition-all text-left truncate flex items-center gap-1.5 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Aarav (IITB)</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin(undefined, 'student_b@bits.ac.in', 'student123')}
              className="bg-white/90 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 font-bold text-xs py-2 px-2.5 rounded-xl transition-all text-left truncate flex items-center gap-1.5 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Bhavya (BITS)</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin(undefined, 'kiran@iiitdwd.ac.in', 'student123')}
              className="bg-white/90 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 font-bold text-xs py-2 px-2.5 rounded-xl transition-all text-left truncate flex items-center gap-1.5 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Kiran (IIIT Dharwad)</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleLogin(undefined, 'admin@campusloop.in', 'admin123')}
            className="w-full bg-white/90 hover:bg-indigo-100/80 border border-indigo-200 text-amber-900 font-bold text-xs py-2 px-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Admin Console (admin@campusloop.in)</span>
          </button>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white/85 backdrop-blur-md p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-indigo-50/50 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rollnumber@college.ac.in"
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-5">
            New to CampusLoop?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-12 text-center text-sm text-gray-500">Loading Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
