'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Repeat, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { College } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();

  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadColleges() {
      try {
        const res = await api.get('/colleges/');
        const data = res.data.results || res.data;
        setColleges(data);
        if (data.length > 0) setCollegeId(data[0].id.toString());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingColleges(false);
      }
    }
    loadColleges();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== passwordConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const generatedUsername = username.trim() || email.split('@')[0] + Math.floor(Math.random() * 100);

      const payload = {
        email: email.trim().toLowerCase(),
        username: generatedUsername,
        full_name: fullName.trim(),
        password,
        password_confirm: passwordConfirm,
        college_id: collegeId ? parseInt(collegeId, 10) : undefined,
        department: department.trim(),
        year_of_study: yearOfStudy,
        roll_number: rollNumber.trim(),
        phone: phone.trim(),
      };

      const res = await api.post('/auth/register/', payload);
      const { user, access, refresh } = res.data;
      if (access) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        setUser(user, access);
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        const msg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
        setErrorMsg(`${firstKey.replace('_', ' ')}: ${msg}`);
      } else {
        setErrorMsg('Registration failed. Please check your data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Campus<span className="text-indigo-600">Loop</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-950 tracking-tight">
            Create Your Student Account
          </h1>
          <p className="text-sm text-gray-500">
            Join thousands of students trading textbooks, gadgets, and hostel gear.
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-md p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-indigo-50/50 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Mehta"
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                College Institutional Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rollnumber@iitb.ac.in"
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Must match an approved campus domain (.ac.in, .edu).
              </p>
            </div>

            {/* College Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                College / University *
              </label>
              <select
                required
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Year of Study
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(parseInt(e.target.value, 10))}
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                >
                  <option value={1}>1st Year (Freshman)</option>
                  <option value={2}>2nd Year (Sophomore)</option>
                  <option value={3}>3rd Year (Junior)</option>
                  <option value={4}>4th Year (Senior)</option>
                  <option value={5}>5th Year (Dual Degree)</option>
                </select>
              </div>
            </div>

            {/* Roll number & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Roll / ID Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="22B0901"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone (for Buyer SMS/WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Creating Account...' : 'Create Student Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-5">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

