/**
 * Authentication API Client
 * All auth API calls go through backend
 */

import { AUTH_API_URL } from './config'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

/**
 * Sign up new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Signup response
 */
export async function signUp(email, password) {
  try {
    const response = await fetch(`${AUTH_API_URL}/signup.php`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        email,
        password,
        force_login: false
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Sign up failed')
    }

    return result
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with user data
 */
export async function login(email, password, forceLogin = false) {
  try {
    const response = await fetch(`${AUTH_API_URL}/login.php`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        email,
        password,
        force_login: forceLogin
      })
    })

    const result = await response.json()

    if (!response.ok) {
      const error = new Error(result.message || 'Login failed')
      if (result.code) {
        error.code = result.code
      }
      throw error
    }

    // Store user data in localStorage
    if (result.data?.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user))
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token)
      }
    }

    return result
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

/**
 * Get current user
 * @returns {Object|null} Current user data or null
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get authentication token
 * @returns {string|null} Auth token or null
 */
export function getToken() {
  return localStorage.getItem('token')
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export function isAuthenticated() {
  return getCurrentUser() !== null
}

