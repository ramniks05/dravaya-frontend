import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, removeFromCart, updateCartQuantity, getCartTotal } from '../lib/cart-utils'
import { formatPrice } from '../lib/mock-products'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    updateCart()
  }, [])

  const updateCart = () => {
    const cartData = getCart()
    setCart(cartData)
    setTotal(getCartTotal())
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemove = (productId) => {
    removeFromCart(productId)
    updateCart()
  }

  const handleQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemove(productId)
      return
    }
    updateCartQuantity(productId, quantity)
    updateCart()
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products to your cart</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.id}`}
                    className="flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(item.name)}`
                      }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-gray-900 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors self-start sm:self-center"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/"
                className="block text-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
