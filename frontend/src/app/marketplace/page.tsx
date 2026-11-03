'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
  RotateCcw,
} from 'lucide-react';
import api from '@/lib/api';
import { Product, Category, College } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  const initialCollege = searchParams.get('college') || '';
  const initialCondition = searchParams.get('condition') || '';
  const initialOrdering = searchParams.get('ordering') || '-created_at';
  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // Component state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollege, setSelectedCollege] = useState(initialCollege);
  const [selectedCondition, setSelectedCondition] = useState(initialCondition);
  const [selectedOrdering, setSelectedOrdering] = useState(initialOrdering);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Fetch filter options on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [catRes, colRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/colleges/'),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setColleges(colRes.data.results || colRes.data);
      } catch (e) {
        console.error('Error fetching filter options:', e);
      }
    }
    loadFilterOptions();
  }, []);

  // Sync state when URL search params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedCollege(searchParams.get('college') || '');
    setSelectedCondition(searchParams.get('condition') || '');
    setSelectedOrdering(searchParams.get('ordering') || '-created_at');
    setMinPrice(searchParams.get('min_price') || '');
    setMaxPrice(searchParams.get('max_price') || '');
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch products from backend whenever filters or page change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          ordering: selectedOrdering,
        };
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedCategory) params.category = selectedCategory;
        if (selectedCollege) params.college = selectedCollege;
        if (selectedCondition) params.condition = selectedCondition;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;

        const res = await api.get('/products/', { params });
        if (res.data.results) {
          setProducts(res.data.results);
          setTotalCount(res.data.count);
        } else {
          setProducts(res.data);
          setTotalCount(res.data.length);
        }
      } catch (e) {
        console.error('Error fetching products:', e);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory, selectedCollege, selectedCondition, selectedOrdering, minPrice, maxPrice, currentPage, searchParams]);

  // Apply filters and update URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCollege) params.set('college', selectedCollege);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (selectedOrdering) params.set('ordering', selectedOrdering);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    params.set('page', '1');

    router.push(`/marketplace?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCollege('');
    setSelectedCondition('');
    setSelectedOrdering('-created_at');
    setMinPrice('');
    setMaxPrice('');
    router.push('/marketplace');
  };

  const conditions = [
    { value: '', label: 'All Conditions' },
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Usable' },
  ];

  const sortOptions = [
    { value: '-created_at', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-view_count', label: 'Most Viewed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover verified second-hand items from students across colleges.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
            </h2>
            <button
              onClick={clearAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setTimeout(applyFilters, 50);
                }}
                className={`w-full text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors ${
                  selectedCategory === ''
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setTimeout(applyFilters, 50);
                  }}
                  className={`w-full text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.product_count !== undefined && (
                    <span className="text-xs text-gray-400">({c.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* College Filter */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              College Campus
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setTimeout(applyFilters, 50);
              }}
              className="w-full text-sm bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Campuses</option>
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.short_name} ({col.city})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Condition
            </label>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  type="button"
                  onClick={() => {
                    setSelectedCondition(cond.value);
                    setTimeout(applyFilters, 50);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                    selectedCondition === cond.value
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-sm bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
              />
            </div>
            <button
              type="button"
              onClick={applyFilters}
              className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-1.5 rounded-lg transition-colors"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top bar: results count & sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50/60 p-3 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{products.length}</span> of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> items
            </p>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 px-3 py-2 rounded-lg"
              >
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline text-xs font-medium text-gray-500">Sort by:</span>
                <select
                  value={selectedOrdering}
                  onChange={(e) => {
                    setSelectedOrdering(e.target.value);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('ordering', e.target.value);
                    router.push(`/marketplace?${params.toString()}`);
                  }}
                  className="bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Pills */}
          {(selectedCategory || selectedCollege || selectedCondition || minPrice || maxPrice || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Active:</span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Category: {selectedCategory}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => {
                      setSelectedCategory('');
                      setTimeout(applyFilters, 50);
                    }}
                  />
                </span>
              )}
              {selectedCondition && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Condition: {selectedCondition}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => {
                      setSelectedCondition('');
                      setTimeout(applyFilters, 50);
                    }}
                  />
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Search: {searchTerm}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => {
                      setSearchTerm('');
                      setTimeout(applyFilters, 50);
                    }}
                  />
                </span>
              )}
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-80 rounded-2xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No products found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                Try adjusting your search keywords, price range, or category filter to discover more campus items.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalCount > 20 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => {
                  const p = currentPage - 1;
                  setCurrentPage(p);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p.toString());
                  router.push(`/marketplace?${params.toString()}`);
                }}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-3">
                Page {currentPage} of {Math.ceil(totalCount / 20)}
              </span>
              <button
                type="button"
                disabled={currentPage >= Math.ceil(totalCount / 20)}
                onClick={() => {
                  const p = currentPage + 1;
                  setCurrentPage(p);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('page', p.toString());
                  router.push(`/marketplace?${params.toString()}`);
                }}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">Loading Campus Marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
