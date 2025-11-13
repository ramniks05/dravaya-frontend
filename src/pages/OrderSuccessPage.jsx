import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getOrderById } from '../lib/cart-utils'
import { formatPrice } from '../lib/mock-products'

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderId) {
      const orderData = getOrderById(orderId)
      setOrder(orderData)
    }
  }, [orderId])

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-10 w-10 text-green-600"
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

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your order. Our admin will contact you soon.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-semibold text-gray-900">{order.orderId}</span>
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-medium text-gray-900">{order.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{order.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{order.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-2">Shipping Address:</p>
              <p className="text-sm font-medium text-gray-900">
                {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Print Order
            </button>
          </div>

          {/* Important Note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Our admin team will contact you within 24 hours to confirm your order and provide further details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
