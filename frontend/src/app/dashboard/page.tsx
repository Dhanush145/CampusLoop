'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Trash2,
  Check,
  RotateCcw,
  PlusCircle,
  ExternalLink,
  MapPin,
  Tag,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import api from '@/lib/api';
import { Product, Enquiry, Transaction, Notification } from '@/lib/types';
import { useStore } from '@/lib/store';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'listings';

  const { user, isAuthenticated, logout, fetchProfile } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [myListings, setMyListings] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Profile Edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?next=/dashboard');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setDepartment(user.student_profile?.department || '');
      setRollNumber(user.student_profile?.roll_number || '');
      setBio(user.student_profile?.bio || '');
    }
  }, [user]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const res = await api.get('/products/my_listings/');
        setMyListings(res.data.results || res.data);
      } else if (activeTab === 'enquiries') {
        const res = await api.get('/enquiries/');
        setEnquiries(res.data.results || res.data);
      } else if (activeTab === 'transactions') {
        const res = await api.get('/transactions/');
        setTransactions(res.data.results || res.data);
      } else if (activeTab === 'notifications') {
        const res = await api.get('/notifications/');
        setNotifications(res.data.results || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Listing actions
  const handleMarkSold = async (id: number) => {
    try {
      await api.post(`/products/${id}/mark_sold/`);
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      await api.post(`/products/${id}/toggle_availability/`);
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.delete(`/products/${id}/`);
      setMyListings((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Enquiry actions
  const handleAcceptEnquiry = async (enquiryId: number) => {
    try {
      await api.post(`/enquiries/${enquiryId}/accept/`);
      await loadDashboardData();
      setActiveTab('transactions');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectEnquiry = async (enquiryId: number) => {
    try {
      await api.post(`/enquiries/${enquiryId}/reject/`);
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // Transaction actions
  const handleUpdateTransactionStatus = async (txId: number, newStatus: string) => {
    try {
      await api.post(`/transactions/${txId}/update_status/`, { status: newStatus });
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // OTP Verification
  const handleSendOTP = async () => {
    try {
      const res = await api.post('/auth/send-otp/');
      setOtpSentMsg(`OTP generated: ${res.data.otp || 'Sent to registered email'}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setVerifyingOtp(true);
      await api.post('/auth/verify-email/', { otp: otpCode.trim() });
      setVerificationSuccess(true);
      await fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Verification failed. Check the OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.patch('/auth/profile/', {
        full_name: fullName,
        phone,
        department,
        roll_number: rollNumber,
        bio,
      });
      await fetchProfile();
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Student Identity */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shrink-0">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {user?.full_name}
              </h1>
              {user?.is_verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5" /> Pending OTP Verification
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1">{user?.email}</p>
            {user?.student_profile && (
              <p className="text-xs text-indigo-300 mt-0.5 flex flex-wrap gap-2">
                <span>{user.student_profile.college_name || 'Campus Member'}</span>
                <span>•</span>
                <span>{user.student_profile.department || 'Department N/A'}</span>
                <span>•</span>
                <span>Roll: {user.student_profile.roll_number || 'N/A'}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 bg-white text-indigo-950 hover:bg-gray-100 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" /> Post New Item
          </Link>
        </div>
      </div>

      {/* Email Verification Box if unverified */}
      {user && !user.is_verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                Institutional Email Verification Required
              </h3>
              <p className="text-xs text-amber-700">
                To maintain campus trust and unlock the full peer-to-peer marketplace, verify your institutional email address with a 6-digit OTP.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendOTP}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" /> Generate 6-Digit OTP
            </button>

            {otpSentMsg && (
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300">
                {otpSentMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleVerifyEmail} className="flex gap-2 max-w-sm pt-2">
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full text-sm bg-white border border-amber-300 rounded-xl px-3 py-2 font-mono tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-xl shrink-0"
            >
              {verifyingOtp ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 flex flex-wrap gap-4 sm:gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          My Listings ({myListings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'enquiries'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Enquiries ({enquiries.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Transactions ({transactions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4" />
          Account Profile
        </button>
      </div>

      {/* Tab 1: My Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : myListings.length > 0 ? (
            <div className="space-y-4">
              {myListings.map((item) => {
                const img =
                  item.primary_image_url ||
                  (item.images && item.images.length > 0 ? item.images[0].image_url : null) ||
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={img} alt="" className="w-20 h-20 object-cover rounded-xl shrink-0" />
                      <div className="min-w-0 space-y-1">
                        <Link
                          href={`/products/${item.id}`}
                          className="font-bold text-gray-900 hover:text-indigo-600 truncate block text-base"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="font-bold text-gray-900 text-sm">
                            ₹{parseFloat(item.price).toLocaleString('en-IN')}
                          </span>
                          <span>•</span>
                          <span className="uppercase text-[11px] font-semibold">{item.condition}</span>
                          <span>•</span>
                          <span>{item.view_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {item.is_sold ? (
                            <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                              Sold Out
                            </span>
                          ) : item.is_available ? (
                            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Live / Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              Reserved / Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
                      >
                        {item.is_available ? 'Hide' : 'Make Available'}
                      </button>

                      {!item.is_sold && (
                        <button
                          type="button"
                          onClick={() => handleMarkSold(item.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Mark Sold
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/products/${item.id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600"
                        title="View product"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
              <Package className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No active listings</h3>
              <p className="text-xs text-gray-500">Sell textbooks, calculators or cycles you no longer need.</p>
              <Link
                href="/sell"
                className="inline-block bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Create First Listing
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Enquiries (Incoming & Outgoing) */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : enquiries.length > 0 ? (
            enquiries.map((enq) => {
              const isSeller = user?.id === enq.seller.id;
              return (
                <div
                  key={enq.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          enq.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {enq.status_display}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {isSeller ? 'Incoming Request from Buyer' : 'Your Outgoing Enquiry'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(enq.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-900">
                      {isSeller ? `From: ${enq.buyer.full_name}` : `To Seller: ${enq.seller.full_name}`}
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 italic">
                      &quot;{enq.message}&quot;
                    </p>
                  </div>

                  {/* Actions for Seller */}
                  {isSeller && enq.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptEnquiry(enq.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Enquiry
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectEnquiry(enq.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-2">
              <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No enquiries yet</h3>
              <p className="text-xs text-gray-500">
                Purchase requests from fellow campus students will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Transactions Workflow (Demonstration Requirement) */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Campus Coordination Workflow:</strong> Reserve items before meeting on campus, and confirm completion after offline handoff.
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((tx) => {
              const isSeller = user?.id === tx.seller.id;
              return (
                <div
                  key={tx.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'reserved'
                            ? 'bg-amber-100 text-amber-800'
                            : tx.status === 'accepted'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Status: {tx.status_display}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-bold text-gray-900">
                        {tx.product_detail?.title || `Item #${tx.product}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isSeller
                          ? `Buyer: ${tx.buyer.full_name} (${tx.buyer.college_name || 'Campus'})`
                          : `Seller: ${tx.seller.full_name} (${tx.seller.college_name || 'Campus'})`}
                      </p>
                      <p className="text-xs font-mono font-bold text-emerald-600 mt-1">
                        Amount: ₹{parseFloat(tx.price).toLocaleString('en-IN')} (Offline Handover)
                      </p>
                    </div>

                    {/* Step buttons for Seller coordination */}
                    {isSeller && tx.status !== 'completed' && tx.status !== 'cancelled' && (
                      <div className="flex flex-wrap items-center gap-2">
                        {tx.status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTransactionStatus(tx.id, 'reserved')}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                          >
                            Mark as Reserved
                          </button>
                        )}

                        {tx.status === 'reserved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTransactionStatus(tx.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Handoff Completed
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleUpdateTransactionStatus(tx.id, 'cancelled')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {tx.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Exchange Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-2">
              <Clock className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No transactions recorded</h3>
              <p className="text-xs text-gray-500">
                Accepted enquiries create coordination transactions to track reservations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  !n.is_read
                    ? 'bg-indigo-50/50 border-indigo-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    type="button"
                    onClick={async () => {
                      await api.post(`/notifications/${n.id}/mark_read/`);
                      loadDashboardData();
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Bell className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">No new notifications</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Account Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-gray-950">Update Student Information</h2>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
              {profileSuccessMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Student Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Department / Major
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Bio / Hostel Info
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. 3rd year CS student living in Hostel 12. Usually available near library."
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">Loading Student Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
