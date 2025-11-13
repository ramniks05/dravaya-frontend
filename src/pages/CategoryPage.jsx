import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getProductsByCategory, categories, formatPrice } from '../lib/mock-products'

// Mock banner data for each category
const categoryBanners = {
  Speakers: {
    title: 'Premium Speakers',
    subtitle: 'Experience crystal-clear sound with our premium speaker collection',
    description: 'From portable Bluetooth speakers to high-end home audio systems, find the perfect speaker for every occasion.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=1200&h=600&fit=crop',
    features: ['360° Sound', 'Waterproof', 'Long Battery Life', 'Premium Brands']
  },
  Watches: {
    title: 'Smart Watches',
    subtitle: 'Stay connected with advanced timepieces for the modern lifestyle',
    description: 'Discover cutting-edge smartwatches with health tracking, fitness monitoring, and seamless connectivity.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=600&fit=crop',
    features: ['Health Tracking', 'Fitness Monitoring', 'Long Battery', 'Premium Design']
  },
  Headphones: {
    title: 'Premium Headphones',
    subtitle: 'Immerse yourself in exceptional audio experiences',
    description: 'From noise-cancelling wireless headphones to studio-quality over-ear models, find your perfect audio companion.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=600&fit=crop',
    features: ['Noise Cancelling', 'Hi-Res Audio', 'Long Battery', 'Premium Comfort']
  }
}

export default function CategoryPage() {
  const { category: categoryParam } = useParams()
  const [allProducts, setAllProducts] = useState([])
  const [categoryName, setCategoryName] = useState('')
  const [banner, setBanner] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    if (!categoryParam) {
      setCategoryName('Products')
      setAllProducts([])
      setBanner(null)
      return
    }

    // Normalize category name (handle URL format like "speakers", "watches", "headphones")
    // Convert "speakers" to "Speakers", "watches" to "Watches", "headphones" to "Headphones"
    const normalizedCategory = categoryParam
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    // Find matching category (case-insensitive match)
    // Categories are: "Speakers", "Watches", "Headphones"
    const validCategory = categories.find(cat => 
      cat.toLowerCase() === normalizedCategory.toLowerCase() || 
      cat.toLowerCase() === categoryParam.toLowerCase()
    )

    if (validCategory && categoryBanners[validCategory]) {
      setCategoryName(validCategory)
      const categoryProducts = getProductsByCategory(validCategory)
      setAllProducts(categoryProducts)
      setBanner(categoryBanners[validCategory])
      // Reset filters when category changes
      setSelectedBrands([])
      setMinPrice('')
      setMaxPrice('')
      setSortBy('default')
      setShowFilters(false)
    } else {
      // Invalid category, set default
      setCategoryName('Products')
      setAllProducts([])
      setBanner(null)
    }
  }, [categoryParam])

  // Get unique brands for the category
  const availableBrands = useMemo(() => {
    const brands = new Set(allProducts.map(product => product.brand))
    return Array.from(brands).sort()
  }, [allProducts])

  // Get price range for the category
  const priceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 0 }
    const prices = allProducts.map(product => product.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  }, [allProducts])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Filter by brand
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand))
    }

    // Filter by price range
    if (minPrice) {
      const min = parseInt(minPrice)
      if (!isNaN(min)) {
        filtered = filtered.filter(product => product.price >= min)
      }
    }
    if (maxPrice) {
      const max = parseInt(maxPrice)
      if (!isNaN(max)) {
        filtered = filtered.filter(product => product.price <= max)
      }
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Default order (as in products array)
        break
    }

    return filtered
  }, [allProducts, selectedBrands, minPrice, maxPrice, sortBy])

  // Handle brand selection
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedBrands([])
    setMinPrice('')
    setMaxPrice('')
    setSortBy('default')
  }

  // Check if any filters are active
  const hasActiveFilters = selectedBrands.length > 0 || minPrice || maxPrice || sortBy !== 'default'

  if (!banner || allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${banner.image})` }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-blue-100">
                {banner.subtitle}
              </p>
              <p className="text-lg mb-6 text-blue-50">
                {banner.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {banner.features.map((feature, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/600x600?text=${encodeURIComponent(banner.title)}`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Category</span>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{categoryName}</span>
            </li>
          </ol>
        </nav>

        {/* Category Header and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h2>
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            
            {/* Desktop Sort and Filter Controls */}
            <div className="hidden md:flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="md:hidden flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                >
                  {brand}
                  <button
                    onClick={() => handleBrandToggle(brand)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${brand} filter`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {minPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Min: {formatPrice(parseInt(minPrice) || 0)}
                  <button
                    onClick={() => setMinPrice('')}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Remove min price filter"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {maxPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Max: {formatPrice(parseInt(maxPrice) || 0)}
                  <button
                    onClick={() => setMaxPrice('')}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Remove max price filter"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  Sorted
                  <button
                    onClick={() => setSortBy('default')}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Reset sort"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white overflow-y-auto lg:static lg:w-auto lg:z-auto lg:bg-transparent' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="rating">Rating: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={formatPrice(priceRange.min)}
                      min={priceRange.min}
                      max={priceRange.max}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={formatPrice(priceRange.max)}
                      min={priceRange.min}
                      max={priceRange.max}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Brands</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose Our {categoryName}?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Quality</h4>
              <p className="text-sm text-gray-600">
                Only the finest {categoryName.toLowerCase()} from top brands
              </p>
            </div>
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Fast Delivery</h4>
              <p className="text-sm text-gray-600">
                Quick and secure shipping to your doorstep
              </p>
            </div>
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Support</h4>
              <p className="text-sm text-gray-600">
                Our team will contact you after your order
              </p>
            </div>
            <div>
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Orders</h4>
              <p className="text-sm text-gray-600">
                Your order information is safe and secure
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
