'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Eye,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  ChevronLeft,
  CheckCircle,
  Package,
  Send,
  X,
  User,
} from 'lucide-react';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailContent({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { user, isAuthenticated, wishlistIds, toggleWishlistId } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Enquiry form state
  const [enquiryMessage, setEnquiryMessage] = useState(
    "Hi! I'm interested in buying this item. Is it still available?"
  );
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  // Report form state
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const isWishlisted = product ? (wishlistIds.includes(product.id) || product.is_wishlisted || false) : false;

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}/`);
        setProduct(res.data);

        const img =
          res.data.primary_image_url ||
          (res.data.images && res.data.images.length > 0 ? res.data.images[0].image_url : '') ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
        setSelectedImage(img);

        // Fetch related products
        const catSlug = res.data.category_slug || res.data.category;
        if (catSlug) {
          const relRes = await api.get(`/products/?category=${catSlug}`);
          const prods: Product[] = relRes.data.results || relRes.data;
          setRelatedProducts(prods.filter((p) => p.id !== res.data.id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    if (!product) return;
    toggleWishlistId(product.id);
    try {
      await api.post('/wishlist/toggle/', { product_id: product.id });
    } catch {
      toggleWishlistId(product.id);
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    if (!product) return;

    try {
      setSubmittingEnquiry(true);
      await api.post('/enquiries/', {
        product: product.id,
        message: enquiryMessage.trim(),
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquiryModalOpen(false);
        setEnquirySuccess(false);
        router.push('/dashboard?tab=enquiries');
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?next=/products/${productId}`);
      return;
    }
    if (!product) return;

    try {
      setSubmittingReport(true);
      await api.post('/reports/reports/', {
        product: product.id,
        reason: reportReason,
        description: reportDescription,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to file report. You may have already reported this item.');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 w-36 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Listing Not Found</h2>
        <p className="text-sm text-gray-500">This item might have been sold or removed by the seller.</p>
        <Link
          href="/marketplace"
          className="inline-block bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const priceNum = parseFloat(product.price);
  const origNum = product.original_price ? parseFloat(product.original_price) : null;
  const discountPercent = origNum && origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : null;

  const isOwner = user && user.id === product.seller.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Images Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-xs relative">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.is_sold && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white font-extrabold text-lg px-6 py-2 rounded-full uppercase tracking-wider shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-indigo-600 shadow-sm scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              {product.category_name}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
              Condition: {product.condition_display}
            </span>
            {product.is_available && !product.is_sold && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> Available on Campus
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-snug">
            {product.title}
          </h1>

          {/* Price Box */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/80 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-gray-950">
                  ₹{priceNum.toLocaleString('en-IN')}
                </span>
                {origNum && origNum > priceNum && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{origNum.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {discountPercent && discountPercent > 0 && (
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  You save {discountPercent}% compared to new retail price
                </p>
              )}
            </div>

            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <p className="flex items-center gap-1 justify-end">
                <Eye className="w-3.5 h-3.5" /> {product.view_count} views
              </p>
              <p className="flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" /> Listed {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOwner ? (
              <>
                <button
                  type="button"
                  disabled={product.is_sold || !product.is_available}
                  onClick={() => setEnquiryModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  {product.is_sold ? 'Product is Sold Out' : 'Send Purchase Enquiry'}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleWishlistClick}
                    className={`flex-1 py-3 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
                    {isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.title, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Listing URL copied to clipboard!');
                      }
                    }}
                    className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700"
                    title="Share listing"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-2">
                <p className="text-sm font-bold text-indigo-900">This is your listing</p>
                <Link
                  href="/dashboard?tab=listings"
                  className="inline-block bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
                >
                  Manage Your Listings & Enquiries
                </Link>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Seller Information
            </h4>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0">
                {product.seller.full_name ? product.seller.full_name[0] : 'S'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                  {product.seller.full_name}
                  <span title="Verified Campus Student">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{product.college_name || product.seller.college_name || 'Partner Campus'}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">
              Protected by CampusLoop offline transaction guarantee: Inspect item in person before completing the exchange.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Product Description
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-gray-100">
              {product.description}
            </p>
          </div>

          {/* Report Button */}
          {!isOwner && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Report this listing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-10 space-y-6">
          <h2 className="text-xl font-bold text-gray-950">Related Items in {product.category_name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-950">Send Purchase Enquiry</h3>
              <button onClick={() => setEnquiryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {enquirySuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-gray-900">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-gray-500">
                  The seller has been notified. Redirecting to your enquiries dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                  <img src={selectedImage} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{product.title}</p>
                    <p className="text-xs text-indigo-600 font-semibold">₹{priceNum.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Message to Seller
                  </label>
                  <textarea
                    rows={4}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    required
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Propose a convenient campus meeting spot (e.g. library, hostel canteen) and preferred timing.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Report Inappropriate Listing
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900">Report Submitted</h4>
                <p className="text-xs text-gray-500">
                  Campus moderators will investigate this listing shortly. Thank you!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                  >
                    <option value="inappropriate">Inappropriate or Prohibited Item</option>
                    <option value="scam">Potential Scam / Fraudulent Price</option>
                    <option value="spam">Spam / Duplicate Listing</option>
                    <option value="other">Other Campus Code Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the issue..."
                    required
                    className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl p-2.5"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">Loading Product...</div>}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
