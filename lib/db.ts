import { sql } from "@vercel/postgres"

// ============================================
// USERS
// ============================================

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result.rows[0] || null
}

export async function getUserById(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`
  return result.rows[0] || null
}

export async function createUser(data: {
  email: string
  password_hash: string
  name: string
  role: "admin" | "supervisor" | "tecnico" | "cliente"
  customer_id?: string
}) {
  const result = await sql`
    INSERT INTO users (email, password_hash, name, role, customer_id)
    VALUES (${data.email}, ${data.password_hash}, ${data.name}, ${data.role}, ${data.customer_id || null})
    RETURNING *
  `
  return result.rows[0]
}

export async function updateUser(id: string, data: Partial<{
  name: string
  status: string
}>) {
  const result = await sql`
    UPDATE users
    SET name = COALESCE(${data.name}, name),
        status = COALESCE(${data.status}, status)
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

export async function listUsers(role?: string) {
  if (role) {
    const result = await sql`SELECT * FROM users WHERE role = ${role} ORDER BY created_at DESC`
    return result.rows
  }
  const result = await sql`SELECT * FROM users ORDER BY created_at DESC`
  return result.rows
}

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomerById(id: string) {
  const result = await sql`SELECT * FROM customers WHERE id = ${id}`
  return result.rows[0] || null
}

export async function listCustomers() {
  const result = await sql`SELECT * FROM customers ORDER BY name ASC`
  return result.rows
}

export async function createCustomer(data: {
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  lat?: number
  lng?: number
  type: string
}) {
  const result = await sql`
    INSERT INTO customers (name, email, phone, address, city, lat, lng, type)
    VALUES (${data.name}, ${data.email}, ${data.phone || null}, ${data.address || null}, 
            ${data.city || null}, ${data.lat || null}, ${data.lng || null}, ${data.type})
    RETURNING *
  `
  return result.rows[0]
}

export async function updateCustomer(id: string, data: Partial<{
  name: string
  email: string
  phone: string
  address: string
  city: string
  lat: number
  lng: number
  nps_score: number
  rating: number
}>) {
  const result = await sql`
    UPDATE customers
    SET name = COALESCE(${data.name}, name),
        email = COALESCE(${data.email}, email),
        phone = COALESCE(${data.phone}, phone),
        address = COALESCE(${data.address}, address),
        city = COALESCE(${data.city}, city),
        lat = COALESCE(${data.lat}, lat),
        lng = COALESCE(${data.lng}, lng),
        nps_score = COALESCE(${data.nps_score}, nps_score),
        rating = COALESCE(${data.rating}, rating)
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

export async function deleteCustomer(id: string) {
  await sql`DELETE FROM customers WHERE id = ${id}`
}

// ============================================
// TECHNICIANS
// ============================================

export async function getTechnicianById(id: string) {
  const result = await sql`SELECT * FROM technicians WHERE id = ${id}`
  return result.rows[0] || null
}

export async function listTechnicians() {
  const result = await sql`SELECT * FROM technicians ORDER BY email ASC`
  return result.rows
}

export async function createTechnician(data: {
  user_id: string
  email: string
  phone?: string
  specialties?: string
  certifications?: string
  join_date?: string
}) {
  const result = await sql`
    INSERT INTO technicians (user_id, email, phone, specialties, certifications, join_date)
    VALUES (${data.user_id}, ${data.email}, ${data.phone || null}, ${data.specialties || null}, 
            ${data.certifications || null}, ${data.join_date || null})
    RETURNING *
  `
  return result.rows[0]
}

export async function updateTechnician(id: string, data: Partial<{
  status: string
  average_rating: number
  total_jobs: number
  lat: number
  lng: number
}>) {
  const result = await sql`
    UPDATE technicians
    SET status = COALESCE(${data.status}, status),
        average_rating = COALESCE(${data.average_rating}, average_rating),
        total_jobs = COALESCE(${data.total_jobs}, total_jobs),
        lat = COALESCE(${data.lat}, lat),
        lng = COALESCE(${data.lng}, lng)
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

// ============================================
// WORK ORDERS
// ============================================

export async function getWorkOrderById(id: string) {
  const result = await sql`SELECT * FROM work_orders WHERE id = ${id}`
  return result.rows[0] || null
}

export async function listWorkOrders(filters?: {
  status?: string
  customer_id?: string
  technician_id?: string
}) {
  let query = sql`SELECT * FROM work_orders WHERE 1=1`
  if (filters?.status) {
    query = sql`SELECT * FROM work_orders WHERE status = ${filters.status}`
  }
  if (filters?.customer_id) {
    query = sql`SELECT * FROM work_orders WHERE customer_id = ${filters.customer_id}`
  }
  if (filters?.technician_id) {
    query = sql`SELECT * FROM work_orders WHERE technician_id = ${filters.technician_id}`
  }
  const result = await query
  return result.rows
}

export async function createWorkOrder(data: {
  order_id: string
  customer_id: string
  status: string
  priority: string
  type: string
  scheduled_date: string
  scheduled_time?: string
  address: string
  city?: string
  description?: string
  equipment_warranty?: boolean
}) {
  const result = await sql`
    INSERT INTO work_orders (order_id, customer_id, status, priority, type, scheduled_date, 
                            scheduled_time, address, city, description, equipment_warranty)
    VALUES (${data.order_id}, ${data.customer_id}, ${data.status}, ${data.priority}, ${data.type},
            ${data.scheduled_date}, ${data.scheduled_time || null}, ${data.address}, 
            ${data.city || null}, ${data.description || null}, ${data.equipment_warranty || false})
    RETURNING *
  `
  return result.rows[0]
}

export async function updateWorkOrder(id: string, data: Partial<{
  status: string
  priority: string
  technician_id: string
  completed_date: string
}>) {
  const result = await sql`
    UPDATE work_orders
    SET status = COALESCE(${data.status}, status),
        priority = COALESCE(${data.priority}, priority),
        technician_id = COALESCE(${data.technician_id}, technician_id),
        completed_date = COALESCE(${data.completed_date}, completed_date)
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0]
}

// ============================================
// INVENTORY
// ============================================

export async function getInventoryItemById(id: string) {
  const result = await sql`SELECT * FROM inventory_items WHERE id = ${id}`
  return result.rows[0] || null
}

export async function listInventoryItems() {
  const result = await sql`SELECT * FROM inventory_items ORDER BY name ASC`
  return result.rows
}

export async function createInventoryItem(data: {
  sku: string
  name: string
  category: string
  description?: string
  unit_cost: number
  min_threshold?: number
}) {
  const result = await sql`
    INSERT INTO inventory_items (sku, name, category, description, unit_cost, min_threshold)
    VALUES (${data.sku}, ${data.name}, ${data.category}, ${data.description || null}, 
            ${data.unit_cost}, ${data.min_threshold || 10})
    RETURNING *
  `
  return result.rows[0]
}

export async function recordStockMovement(data: {
  item_id: string
  type: string
  quantity: number
  from_location?: string
  to_location?: string
  reference_id?: string
  notes?: string
  created_by?: string
}) {
  const result = await sql`
    INSERT INTO stock_movements (item_id, type, quantity, from_location, to_location, reference_id, notes, created_by)
    VALUES (${data.item_id}, ${data.type}, ${data.quantity}, ${data.from_location || null}, 
            ${data.to_location || null}, ${data.reference_id || null}, ${data.notes || null}, ${data.created_by || null})
    RETURNING *
  `
  return result.rows[0]
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(data: {
  user_id: string
  type: string
  title: string
  body?: string
  reference_id?: string
}) {
  const result = await sql`
    INSERT INTO notifications (user_id, type, title, body, reference_id)
    VALUES (${data.user_id}, ${data.type}, ${data.title}, ${data.body || null}, ${data.reference_id || null})
    RETURNING *
  `
  return result.rows[0]
}

export async function listNotifications(user_id: string) {
  const result = await sql`
    SELECT * FROM notifications WHERE user_id = ${user_id} ORDER BY created_at DESC
  `
  return result.rows
}

export async function markNotificationAsRead(id: string) {
  await sql`UPDATE notifications SET read = TRUE WHERE id = ${id}`
}
