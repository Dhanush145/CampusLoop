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
  MapPin,
  Check,
} from 'lucide-react';
import api from '@/lib/api';
import { Product, Category, College } from '@/lib/types';
import ProductCard from '@/components/products/ProductCard';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL params
  const paramCategory = searchParams.get('category') || '';
  const paramSearch = searchParams.get('search') || '';
  const paramCollege = searchParams.get('college') || '';
  const paramCondition = searchParams.get('condition') || '';
  const paramLocation = searchParams.get('exchange_location') || '';
  const paramOrdering = searchParams.get('ordering') || '-created_at';
  const paramMinPrice = searchParams.get('min_price') || '';
  const paramMaxPrice = searchParams.get('max_price') || '';
  const paramPage = parseInt(searchParams.get('page') || '1', 10);

  // Component state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Form input states
  const [searchInput, setSearchInput] = useState(paramSearch);
  const [locationInput, setLocationInput] = useState(paramLocation);
  const [minPriceInput, setMinPriceInput] = useState(paramMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(paramMaxPrice);

  // Sync inputs with URL changes
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setLocationInput(searchParams.get('exchange_location') || '');
    setMinPriceInput(searchParams.get('min_price') || '');
    setMaxPriceInput(searchParams.get('max_price') || '');
  }, [searchParams]);

  // Fetch categories and colleges on mount
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

  // Fetch products from backend whenever URL search params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: paramPage,
          ordering: paramOrdering,
        };
        if (paramSearch.trim()) params.search = paramSearch.trim();
        if (paramCategory) params.category = paramCategory;
        if (paramCollege) params.college = paramCollege;
        if (paramCondition) params.condition = paramCondition;
        if (paramLocation.trim()) params.exchange_location = paramLocation.trim();
        if (paramMinPrice) params.min_price = paramMinPrice;
        if (paramMaxPrice) params.max_price = paramMaxPrice;

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
  }, [
    paramCategory,
    paramSearch,
    paramCollege,
    paramCondition,
    paramLocation,
    paramOrdering,
    paramMinPrice,
    paramMaxPrice,
    paramPage,
  ]);

  // Direct, reliable filter updater (no stale closures)
  const updateFilters = (newValues: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();

    const state = {
      search: paramSearch,
      category: paramCategory,
      college: paramCollege,
      condition: paramCondition,
      exchange_location: paramLocation,
      ordering: paramOrdering,
      min_price: paramMinPrice,
      max_price: paramMaxPrice,
      page: '1',
      ...newValues,
    };

    Object.entries(state).forEach(([k, v]) => {
      if (
        v !== undefined &&
        v !== null &&
        String(v).trim() !== '' &&
        !(k === 'ordering' && v === '-created_at') &&
        !(k === 'page' && v === '1')
      ) {
        params.set(k, String(v).trim());
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/marketplace?${queryString}` : '/marketplace');
    if (mobileFilterOpen) setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ exchange_location: locationInput });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      min_price: minPriceInput,
      max_price: maxPriceInput,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setLocationInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/marketplace');
    if (mobileFilterOpen) setMobileFilterOpen(false);
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

  const commonSpots = [
    'Central Library',
    'Main Canteen',
    'Hostel',
    'Student Activity Center',
  ];

  // Friendly category display name
  const activeCategoryObj = categories.find(
    (c) => c.slug === paramCategory || c.id.toString() === paramCategory
  );
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : paramCategory;

  const hasActiveFilters = Boolean(
    paramCategory ||
      paramCollege ||
      paramCondition ||
      paramLocation ||
      paramMinPrice ||
      paramMaxPrice ||
      paramSearch
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover verified second-hand items and campus handover spots.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products by title, notes, subject..."
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
        <aside className="hidden lg:block lg:col-span-1 space-y-6 bg-white/75 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateFilters({ category: '' })}
                className={`w-full text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  !paramCategory
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
                {!paramCategory && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
              {categories.map((c) => {
                const isSelected = paramCategory === c.slug || paramCategory === c.id.toString();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateFilters({ category: c.slug })}
                    className={`w-full text-left text-sm py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.product_count !== undefined && (
                        <span className="text-xs text-gray-400">({c.product_count})</span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campus Exchange Location Filter */}
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Exchange Location
            </label>
            <form onSubmit={handleLocationSubmit} className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. Library, Canteen..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                Go
              </button>
            </form>
            {/* Quick spot buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              {commonSpots.map((spot) => (
                <button
                  key={spot}
                  type="button"
                  onClick={() => {
                    setLocationInput(spot);
                    updateFilters({ exchange_location: spot });
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    paramLocation === spot
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {spot}
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
              value={paramCollege}
              onChange={(e) => updateFilters({ college: e.target.value })}
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
                  onClick={() => updateFilters({ condition: cond.value })}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    paramCondition === cond.value
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
            <form onSubmit={handlePriceSubmit} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-800"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top bar: results count & sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/75 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-900">{products.length}</span> of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> campus items
            </p>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 px-3 py-2 rounded-lg cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" /> Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="hidden sm:inline text-xs font-medium text-gray-500">Sort by:</span>
                <select
                  value={paramOrdering}
                  onChange={(e) => updateFilters({ ordering: e.target.value })}
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
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">Active:</span>

              {paramCategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Category: {activeCategoryName}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => updateFilters({ category: '' })}
                  />
                </span>
              )}

              {paramLocation && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-100">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  Location: {paramLocation}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                    onClick={() => {
                      setLocationInput('');
                      updateFilters({ exchange_location: '' });
                    }}
                  />
                </span>
              )}

              {paramCondition && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Condition: {paramCondition}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => updateFilters({ condition: '' })}
                  />
                </span>
              )}

              {paramCollege && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  College:{' '}
                  {colleges.find((c) => c.id.toString() === paramCollege)?.short_name || paramCollege}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => updateFilters({ college: '' })}
                  />
                </span>
              )}

              {paramSearch && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Search: {paramSearch}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => {
                      setSearchInput('');
                      updateFilters({ search: '' });
                    }}
                  />
                </span>
              )}

              {(paramMinPrice || paramMaxPrice) && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                  Price: ₹{paramMinPrice || '0'} - ₹{paramMaxPrice || '∞'}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => {
                      setMinPriceInput('');
                      setMaxPriceInput('');
                      updateFilters({ min_price: '', max_price: '' });
                    }}
                  />
                </span>
              )}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-1 cursor-pointer"
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
                Try adjusting your search keywords, exchange location, or category filter to discover more campus items.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
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
                disabled={paramPage <= 1}
                onClick={() => updateFilters({ page: paramPage - 1 })}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-3">
                Page {paramPage} of {Math.ceil(totalCount / 20)}
              </span>
              <button
                type="button"
                disabled={paramPage >= Math.ceil(totalCount / 20)}
                onClick={() => updateFilters({ page: paramPage + 1 })}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sheet Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" /> Filter Listings
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Category
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => updateFilters({ category: '' })}
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg flex items-center justify-between ${
                      !paramCategory
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-gray-600'
                    }`}
                  >
                    <span>All Categories</span>
                    {!paramCategory && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                  {categories.map((c) => {
                    const isSelected = paramCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => updateFilters({ category: c.slug })}
                        className={`w-full text-left text-xs py-2 px-3 rounded-lg flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-gray-600'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Exchange Location */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Exchange Location
                </label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Library, Canteen"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={() => updateFilters({ exchange_location: locationInput })}
                    className="bg-indigo-600 text-white text-xs px-3 rounded-lg font-medium"
                  >
                    Set
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {commonSpots.map((spot) => (
                    <button
                      key={spot}
                      type="button"
                      onClick={() => {
                        setLocationInput(spot);
                        updateFilters({ exchange_location: spot });
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md border ${
                        paramLocation === spot
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile College */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Campus
                </label>
                <select
                  value={paramCollege}
                  onChange={(e) => updateFilters({ college: e.target.value })}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2"
                >
                  <option value="">All Campuses</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.short_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Condition */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Condition
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {conditions.map((cond) => (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => updateFilters({ condition: cond.value })}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                        paramCondition === cond.value
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-sm text-gray-500">
          Loading Campus Marketplace...
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
