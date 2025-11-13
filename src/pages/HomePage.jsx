import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, getProductsByCategory, categories } from '../lib/mock-products'

export default function HomePage() {
  const speakersRef = useRef(null)
  const watchesRef = useRef(null)
  const headphonesRef = useRef(null)

  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [])

  const speakers = getProductsByCategory('Speakers')
  const watches = getProductsByCategory('Watches')
  const headphones = getProductsByCategory('Headphones')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Premium Electronic Gadgets
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Discover the latest in speakers, watches, and headphones
          </p>
          <Link
            to="#speakers"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Speakers Section */}
      <section id="speakers" ref={speakersRef} className="mb-16 scroll-mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Speakers</h2>
            <p className="text-gray-600">Premium sound systems for every occasion</p>
          </div>
          <Link
            to="/category/speakers"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {speakers.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Watches Section */}
      <section id="watches" ref={watchesRef} className="mb-16 scroll-mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Smart Watches</h2>
            <p className="text-gray-600">Advanced timepieces for the modern lifestyle</p>
          </div>
          <Link
            to="/category/watches"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {watches.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Headphones Section */}
      <section id="headphones" ref={headphonesRef} className="mb-16 scroll-mt-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Headphones</h2>
            <p className="text-gray-600">Immersive audio experiences for music lovers</p>
          </div>
          <Link
            to="/category/headphones"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {headphones.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Only the finest electronic gadgets from top brands
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick and secure shipping to your doorstep
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">
                Our team will contact you after your order
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
