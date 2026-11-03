'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PackagePlus,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';
import { Category, College } from '@/lib/types';
import { useStore } from '@/lib/store';

export default function SellPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('');
  const [condition, setCondition] = useState('good');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [collegeId, setCollegeId] = useState<string>('');

  const [previewTab, setPreviewTab] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sample quick images for easy demo
  const sampleImages = [
    { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Calculator', url: 'https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Electronics', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, colRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/colleges/'),
        ]);
        const cats = catRes.data.results || catRes.data;
        const cols = colRes.data.results || colRes.data;
        setCategories(cats);
        setColleges(cols);
        if (cats.length > 0) setCategory(cats[0].id.toString());
        if (cols.length > 0) setCollegeId(cols[0].id.toString());
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login?next=/sell');
      return;
    }

    if (!title.trim() || !price || !category) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (parseFloat(price) <= 0) {
      setErrorMsg('Price must be greater than ₹0.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const finalImg =
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

      const payload = {
        title: title.trim(),
        description: description.trim() || 'Genuine second-hand item available for direct campus handover.',
        price: parseFloat(price).toFixed(2),
        original_price: originalPrice ? parseFloat(originalPrice).toFixed(2) : null,
        category: parseInt(category, 10),
        condition,
        college: collegeId ? parseInt(collegeId, 10) : undefined,
        images: [
          {
            image_url: finalImg,
            is_primary: true,
          },
        ],
      };

      const res = await api.post('/products/', payload);
      router.push(`/products/${res.data.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.title?.[0] ||
        err.response?.data?.price?.[0] ||
        'Failed to publish listing. Check your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id.toString() === category);
  const selectedColObj = colleges.find((c) => c.id.toString() === collegeId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Instant Campus Publishing
        </div>
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
          Create a Product Listing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Post your used items for students on campus. Fast, direct, zero commission.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              You must be logged in as a verified student to publish listings.
            </p>
          </div>
          <Link
            href="/login?next=/sell"
            className="text-xs font-bold text-amber-900 bg-amber-200/80 px-3.5 py-2 rounded-xl hover:bg-amber-300"
          >
            Log In Now
          </Link>
        </div>
      )}

      {/* Tabs: Edit / Preview */}
      <div className="flex gap-2 border-b border-gray-200 mb-8">
        <button
          type="button"
          onClick={() => setPreviewTab(false)}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            !previewTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Listing Details
        </button>
        <button
          type="button"
          onClick={() => setPreviewTab(true)}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            previewTab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4" /> Live Card Preview
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {!previewTab ? (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Algorithms (CLRS 4th Ed) or Casio FX-991EX"
              className="w-full text-base bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Product Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
              >
                <option value="new">Brand New (Unused, sealed)</option>
                <option value="like_new">Like New (Used few times, pristine)</option>
                <option value="good">Good (Clean, normal student use)</option>
                <option value="fair">Fair (Has cosmetic signs of wear)</option>
                <option value="poor">Usable (Fully functional with wear)</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-3 py-3 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Original Retail Price (₹) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="1200"
                  className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl pl-8 pr-3 py-3"
                />
              </div>
            </div>
          </div>

          {/* College Campus */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Exchange Location / Campus *
            </label>
            <select
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
            >
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.short_name})
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Product Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 mb-2"
            />
            {/* Quick Demo Image Selection */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-400">Quick sample photo:</span>
              {sampleImages.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setImageUrl(s.url)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-md transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State edition, course code, notes, scratches, accessories included..."
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => setPreviewTab(true)}
              className="text-sm font-semibold text-gray-600 hover:text-indigo-600 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Preview First
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish to Marketplace'}
            </button>
          </div>
        </form>
      ) : (
        /* Live Preview Mode */
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Live Listing Preview
            </h3>
            <button
              onClick={() => setPreviewTab(false)}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Back to Edit
            </button>
          </div>

          <div className="max-w-xs mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <img
                  src={
                    imageUrl.trim() ||
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
                  }
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[10px] uppercase font-bold bg-white/90 text-indigo-700 px-2 py-0.5 rounded-full shadow-xs">
                  {condition}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] text-gray-400 font-semibold uppercase">
                  {selectedCatObj?.name || 'Category'} • {selectedColObj?.short_name || 'Campus'}
                </p>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                  {title || 'Listing Title'}
                </h4>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-950">
                    ₹{price ? parseFloat(price).toLocaleString('en-IN') : '0'}
                  </span>
                  {originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{parseFloat(originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
            >
              Confirm & Publish Listing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

