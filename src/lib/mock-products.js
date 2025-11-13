// Mock product data for premium electronic gadgets
export const categories = ['Speakers', 'Watches', 'Headphones']

export const products = [
  // Speakers
  {
    id: 1,
    name: 'Bose SoundLink Revolve+ Bluetooth Speaker',
    category: 'Speakers',
    brand: 'Bose',
    price: 32999,
    originalPrice: 39999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    description: 'Premium 360-degree Bluetooth speaker with deep, clear sound. Waterproof design perfect for outdoor use. Up to 16 hours of battery life.',
    features: ['360° Sound', 'Waterproof', '16hr Battery', 'Voice Assistant'],
    inStock: true,
    rating: 4.8,
    reviews: 1247
  },
  {
    id: 2,
    name: 'Sonos Move Smart Speaker',
    category: 'Speakers',
    brand: 'Sonos',
    price: 44999,
    originalPrice: 52999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    description: 'Smart Wi-Fi and Bluetooth speaker with Alexa and Google Assistant built-in. Weather-resistant design with 10-hour battery.',
    features: ['Smart Assistant', 'Wi-Fi & Bluetooth', 'Weather Resistant', '10hr Battery'],
    inStock: true,
    rating: 4.9,
    reviews: 892
  },
  {
    id: 3,
    name: 'JBL PartyBox 310 Portable Speaker',
    category: 'Speakers',
    brand: 'JBL',
    price: 54999,
    originalPrice: 64999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    description: 'Powerful portable party speaker with dynamic light show. 240W of pure power with deep bass. Up to 18 hours of playtime.',
    features: ['240W Power', 'Light Show', '18hr Battery', 'Karaoke Ready'],
    inStock: true,
    rating: 4.7,
    reviews: 634
  },
  {
    id: 4,
    name: 'Bang & Olufsen Beosound A1 2nd Gen',
    category: 'Speakers',
    brand: 'Bang & Olufsen',
    price: 24999,
    originalPrice: 29999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    description: 'Compact premium speaker with exceptional sound quality. Waterproof and dustproof. 18-hour battery life with wireless charging.',
    features: ['Premium Sound', 'Waterproof', '18hr Battery', 'Wireless Charging'],
    inStock: true,
    rating: 4.8,
    reviews: 445
  },
  {
    id: 5,
    name: 'Marshall Acton III Bluetooth Speaker',
    category: 'Speakers',
    brand: 'Marshall',
    price: 27999,
    originalPrice: 32999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    description: 'Classic Marshall design with modern sound. Vintage aesthetics meets contemporary technology. 30+ hour battery life.',
    features: ['Vintage Design', '30hr Battery', 'Customizable EQ', 'Multi-host'],
    inStock: true,
    rating: 4.6,
    reviews: 1123
  },
  
  // Watches
  {
    id: 6,
    name: 'Apple Watch Ultra 2',
    category: 'Watches',
    brand: 'Apple',
    price: 89900,
    originalPrice: 99900,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    description: 'The most rugged and capable Apple Watch. Titanium case, dual-frequency GPS, and 36-hour battery life. Perfect for extreme adventures.',
    features: ['Titanium Case', '36hr Battery', 'Dual GPS', 'Action Button'],
    inStock: true,
    rating: 4.9,
    reviews: 2847
  },
  {
    id: 7,
    name: 'Samsung Galaxy Watch 6 Classic',
    category: 'Watches',
    brand: 'Samsung',
    price: 44999,
    originalPrice: 49999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    description: 'Premium smartwatch with rotating bezel. Advanced health monitoring, sleep tracking, and 40-hour battery life.',
    features: ['Rotating Bezel', 'Health Monitor', '40hr Battery', 'ECG & BP'],
    inStock: true,
    rating: 4.7,
    reviews: 1567
  },
  {
    id: 8,
    name: 'Garmin Fenix 7 Pro',
    category: 'Watches',
    brand: 'Garmin',
    price: 89999,
    originalPrice: 99999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    description: 'Premium multisport GPS watch. Advanced training metrics, maps, and up to 37 days of battery life in smartwatch mode.',
    features: ['37 Days Battery', 'Multi-GNSS', 'Training Metrics', 'Maps & Navigation'],
    inStock: true,
    rating: 4.8,
    reviews: 923
  },
  {
    id: 9,
    name: 'Tag Heuer Connected Calibre E4',
    category: 'Watches',
    brand: 'Tag Heuer',
    price: 249999,
    originalPrice: 279999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    description: 'Luxury smartwatch combining Swiss craftsmanship with modern technology. Premium materials and Wear OS integration.',
    features: ['Swiss Made', 'Premium Materials', 'Wear OS', 'Fitness Tracking'],
    inStock: true,
    rating: 4.6,
    reviews: 234
  },
  {
    id: 10,
    name: 'Fossil Gen 6 Wellness Edition',
    category: 'Watches',
    brand: 'Fossil',
    price: 24999,
    originalPrice: 29999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    description: 'Stylish smartwatch focused on wellness. Advanced health tracking, fast charging, and 24+ hour battery life.',
    features: ['Wellness Focus', 'Fast Charging', '24hr Battery', 'Health Metrics'],
    inStock: true,
    rating: 4.5,
    reviews: 678
  },
  
  // Headphones
  {
    id: 11,
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Headphones',
    brand: 'Sony',
    price: 34999,
    originalPrice: 39999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    description: 'Industry-leading noise cancellation with premium sound quality. 30-hour battery life with quick charge. Comfortable over-ear design.',
    features: ['Noise Cancelling', '30hr Battery', 'Hi-Res Audio', 'Quick Charge'],
    inStock: true,
    rating: 4.9,
    reviews: 3456
  },
  {
    id: 12,
    name: 'Bose QuietComfort Ultra Headphones',
    category: 'Headphones',
    brand: 'Bose',
    price: 42999,
    originalPrice: 47999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    description: 'Premium noise-cancelling headphones with spatial audio. Immersive sound experience with 24-hour battery life.',
    features: ['Spatial Audio', 'Noise Cancelling', '24hr Battery', 'Premium Comfort'],
    inStock: true,
    rating: 4.8,
    reviews: 1234
  },
  {
    id: 13,
    name: 'Apple AirPods Max',
    category: 'Headphones',
    brand: 'Apple',
    price: 59900,
    originalPrice: 64900,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    description: 'Premium over-ear headphones with Active Noise Cancellation. Spatial audio and adaptive EQ for personalized sound.',
    features: ['Active Noise Cancellation', 'Spatial Audio', 'Adaptive EQ', '20hr Battery'],
    inStock: true,
    rating: 4.7,
    reviews: 2876
  },
  {
    id: 14,
    name: 'Sennheiser Momentum 4 Wireless',
    category: 'Headphones',
    brand: 'Sennheiser',
    price: 37999,
    originalPrice: 42999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    description: 'Premium wireless headphones with exceptional sound quality. 60-hour battery life and adaptive noise cancellation.',
    features: ['60hr Battery', 'Adaptive NC', 'Premium Sound', 'Smart Pause'],
    inStock: true,
    rating: 4.8,
    reviews: 892
  },
  {
    id: 15,
    name: 'Beats Studio Pro Wireless',
    category: 'Headphones',
    brand: 'Beats',
    price: 34999,
    originalPrice: 39999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    description: 'Premium wireless headphones with active noise cancellation. Spatial audio and personalized sound profile. 40-hour battery.',
    features: ['Active NC', 'Spatial Audio', '40hr Battery', 'Customizable Sound'],
    inStock: true,
    rating: 4.6,
    reviews: 1567
  }
]

// Helper function to get product by ID
export function getProductById(id) {
  return products.find(product => product.id === parseInt(id))
}

// Helper function to get products by category
export function getProductsByCategory(category) {
  return products.filter(product => product.category === category)
}

// Helper function to format price
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price)
}
