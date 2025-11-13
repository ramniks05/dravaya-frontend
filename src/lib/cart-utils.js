// Cart utility functions for localStorage management

const CART_STORAGE_KEY = 'dravyatech_cart'
const ORDERS_STORAGE_KEY = 'dravyatech_orders'

// Get cart from localStorage
export function getCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY)
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error getting cart:', error)
    return []
  }
}

// Save cart to localStorage
export function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    return true
  } catch (error) {
    console.error('Error saving cart:', error)
    return false
  }
}

// Add item to cart
export function addToCart(product, quantity = 1) {
  const cart = getCart()
  const existingItem = cart.find(item => item.id === product.id)
  
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: product.brand,
      quantity: quantity
    })
  }
  
  saveCart(cart)
  return cart
}

// Remove item from cart
export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId)
  saveCart(cart)
  return cart
}

// Update item quantity in cart
export function updateCartQuantity(productId, quantity) {
  const cart = getCart()
  const item = cart.find(item => item.id === productId)
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId)
    }
    item.quantity = quantity
    saveCart(cart)
  }
  
  return cart
}

// Clear cart
export function clearCart() {
  saveCart([])
  return []
}

// Get cart total
export function getCartTotal() {
  const cart = getCart()
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Get cart item count
export function getCartItemCount() {
  const cart = getCart()
  return cart.reduce((count, item) => count + item.quantity, 0)
}

// Save order to localStorage
export function saveOrder(order) {
  try {
    const orders = getOrders()
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
    const newOrder = {
      ...order,
      orderId: orderId,
      orderDate: new Date().toISOString()
    }
    orders.push(newOrder)
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    return newOrder
  } catch (error) {
    console.error('Error saving order:', error)
    return null
  }
}

// Get orders from localStorage
export function getOrders() {
  try {
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY)
    return orders ? JSON.parse(orders) : []
  } catch (error) {
    console.error('Error getting orders:', error)
    return []
  }
}

// Get order by ID
export function getOrderById(orderId) {
  const orders = getOrders()
  return orders.find(order => order.orderId === orderId)
}
