/**
 * Mock Supabase client for React-only version
 * Replace with actual Supabase client when backend is ready
 */

import { mockAuth, mockDatabase } from './mockData'

export const supabase = {
  auth: mockAuth,
  from: mockDatabase.from
}

