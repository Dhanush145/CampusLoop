'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Check,
  Search,
} from 'lucide-react';
import api from '@/lib/api';
import { AdminStats, User, Product } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'reports'>('overview');
  const [loading, setLoading] = useState(true);

  // User search
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?next=/admin');
      return;
    }
    loadAdminData();
  }, [isAuthenticated, activeTab]);

  async function loadAdminData() {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/dashboard/');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users/');
        setUsersList(res.data.results || res.data);
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products/');
        setProductsList(res.data.results || res.data);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports/');
        setReportsList(res.data.results || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleSuspend = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/toggle_suspend/`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyStudent = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/verify_student/`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleApproval = async (prodId: number) => {
    try {
      await api.post(`/admin/products/${prodId}/toggle_approval/`);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveReport = async (reportId: number, takeDown: boolean) => {
    try {
      await api.post(`/admin/reports/${reportId}/resolve/`, {
        status: 'resolved',
        take_down_product: takeDown,
        admin_notes: 'Reviewed and resolved by administrator.',
      });
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user?.is_staff) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Administrator Access Required</h2>
        <p className="text-sm text-gray-500">
          Sign in with administrator credentials (e.g. <code>admin@campusloop.in</code> / <code>admin123</code>).
        </p>
        <Link
          href="/login?next=/admin"
          className="inline-block bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> University Admin Console
          </div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            CampusLoop Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor registered students, listings, transactions, and moderation reports.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" /> Students ({usersList.length || '...'})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" /> Moderation ({productsList.length || '...'})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Flagged Reports
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Students
              </p>
              <p className="text-3xl font-extrabold text-gray-950 mt-1">
                {stats.total_students}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {stats.verified_students} email verified
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Active Listings
              </p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                {stats.active_products}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold mt-1">
                {stats.total_products} total published
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Exchanges Completed
              </p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {stats.completed_transactions}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold mt-1">
                {stats.sold_products} marked as sold
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pending Reports
              </p>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">
                {stats.pending_reports}
              </p>
              <p className="text-[11px] text-gray-500 font-semibold mt-1">
                {stats.total_enquiries} enquiries initiated
              </p>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Listings Distribution by Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.category_breakdown.map((cat) => (
                <div key={cat.name} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 truncate">{cat.name}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Student Profiles & Security</h3>
            <input
              type="text"
              placeholder="Filter by name..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">College & Department</th>
                  <th className="p-3">Roll No.</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {usersList
                  .filter((u) => !userSearch || u.full_name?.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => {
                    const isSuspended = u.student_profile?.is_suspended || false;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                          <p className="font-bold text-gray-900">{u.full_name}</p>
                          <p className="text-gray-400">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-gray-900">{u.student_profile?.college_name || 'N/A'}</p>
                          <p className="text-gray-400">{u.student_profile?.department || 'General'}</p>
                        </td>
                        <td className="p-3 font-mono">{u.student_profile?.roll_number || 'N/A'}</td>
                        <td className="p-3">
                          {u.is_verified ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                              Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleVerifyStudent(u.id)}
                              className="text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md"
                            >
                              Verify ID
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(u.id)}
                            className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                              isSuspended
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products Moderation */}
      {activeTab === 'products' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Listings Moderation Queue</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {productsList.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.primary_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c'}
                    alt=""
                    className="w-14 h-14 object-cover rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{p.title}</p>
                    <p className="text-xs text-gray-500">
                      ₹{parseFloat(p.price).toLocaleString('en-IN')} • By {p.seller_name} ({p.college_short_name})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(p.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                      p.is_approved
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {p.is_approved ? 'Take Down' : 'Approve'}
                  </button>
                  <Link
                    href={`/products/${p.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600"
                    title="View Product"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportsList.length > 0 ? (
            reportsList.map((r) => (
              <div key={r.id} className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                    Reason: {r.reason_display || r.reason}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Listing: {r.product_title}</p>
                  <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2.5 rounded-lg italic">
                    &quot;{r.description}&quot;
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleResolveReport(r.id, true)}
                    className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Remove Item & Resolve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolveReport(r.id, false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">No pending reports</p>
              <p className="text-xs text-gray-500">All campus listings comply with safety guidelines.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
