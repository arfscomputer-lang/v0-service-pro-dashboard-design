// Configuration flags for the application

// Set to true to use database APIs, false to use in-memory seed data
export const USE_DATABASE = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'

// Database connection string
export const DATABASE_URL = process.env.DATABASE_URL

// Feature flags
export const FEATURES = {
  // Enable real-time notifications
  NOTIFICATIONS: false,
  // Enable barcode scanning
  BARCODE_SCANNER: true,
  // Enable GPS tracking for technicians
  GPS_TRACKING: false,
}
