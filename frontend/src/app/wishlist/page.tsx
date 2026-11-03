'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { WishlistItem } from '@/lib/types';
import { useStore } from '@/lib/store';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, setWishlistIds } = useStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/wishlist/');
        setItems(res.data);
        const ids = res.data.map((item: WishlistItem) => item.product.id);
        setWishlistIds(ids);
      } catch (e) {
        console.error('Failed to load wishlist:', e);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, [isAuthenticated]);

  const handleRemove = async (productId: number) => {
    try {
      await api.post('/wishlist/toggle/', { product_id: productId });
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4 space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Sign In to View Wishlist</h2>
        <p className="text-sm text-gray-500">
          Save your favourite campus listings and track price changes across semesters.
        </p>
        <Link
          href="/login?next=/wishlist"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2.5">
          <Heart className="w-7 h-7 text-rose-500 fill-current" />
          My Saved Items
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {items.length} {items.length === 1 ? 'item' : 'items'} saved in your campus wishlist
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 h-80 rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <button
                type="button"
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-3 right-12 z-20 bg-white/90 hover:bg-white text-rose-600 p-2 rounded-full shadow-xs backdrop-blur-xs transition-colors"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xs border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your Wishlist is Empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Browse textbooks, calculators, and electronics in the marketplace and click the heart icon to save them.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xs"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

