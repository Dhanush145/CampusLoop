'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import api from '@/lib/api';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (productId: number, isWishlisted: boolean) => void;
}

export default function ProductCard({ product, onWishlistToggle }: ProductCardProps) {
  const { isAuthenticated, wishlistIds, toggleWishlistId } = useStore();
  const isWishlisted = wishlistIds.includes(product.id) || product.is_wishlisted || false;
  const [loadingHeart, setLoadingHeart] = useState(false);

  // Condition styling map
  const conditionColors: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Brand New', label: 'Brand New' },
    like_new: { bg: 'bg-teal-50 text-teal-700 border-teal-200', text: 'Like New', label: 'Like New' },
    good: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Good', label: 'Good' },
    fair: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Fair', label: 'Fair' },
    poor: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'Usable', label: 'Usable' },
  };

  const cond = conditionColors[product.condition] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    label: product.condition_display || product.condition,
  };

  const priceNum = parseFloat(product.price);
  const origNum = product.original_price ? parseFloat(product.original_price) : null;
  const discountPercent = origNum && origNum > priceNum ? Math.round(((origNum - priceNum) / origNum) * 100) : null;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      return;
    }

    try {
      setLoadingHeart(true);
      toggleWishlistId(product.id);
      const res = await api.post('/wishlist/toggle/', { product_id: product.id });
      if (onWishlistToggle) {
        onWishlistToggle(product.id, res.data.is_wishlisted);
      }
    } catch (err) {
      // rollback
      toggleWishlistId(product.id);
    } finally {
      setLoadingHeart(false);
    }
  };

  const displayImage =
    product.primary_image_url ||
    (product.images && product.images.length > 0 ? product.images[0].image_url : null) ||
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full border shadow-xs backdrop-blur-xs ${cond.bg}`}
          >
            {cond.label}
          </span>
          {product.is_sold && (
            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleHeartClick}
          disabled={loadingHeart}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-xs z-10 ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-rose-200'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-rose-500'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Tag */}
        {discountPercent && discountPercent > 0 && !product.is_sold && (
          <div className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* College and Category */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1.5 gap-2">
            <span className="truncate text-indigo-600 font-semibold">
              {product.category_name || (typeof product.category === 'object' ? product.category.name : 'Item')}
            </span>
            <span className="flex items-center gap-1 shrink-0 text-gray-500">
              <MapPin className="w-3 h-3 text-gray-400" />
              {product.college_short_name || 'Campus'}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price & Seller Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-950">₹{priceNum.toLocaleString('en-IN')}</span>
              {origNum && origNum > priceNum && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{origNum.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
              By {product.seller_name || product.seller?.full_name || 'Verified Student'}
            </p>
          </div>

          <Link
            href={`/products/${product.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

