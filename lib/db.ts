// Neon HTTP SQL API — zero dependencies
// Uses the Neon serverless driver protocol over HTTP/fetch

function getConnectionInfo() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  // Parse postgres://user:password@host/dbname?sslmode=require
  const parsed = new URL(url)
  const host = parsed.hostname
  const user = parsed.username
  const password = decodeURIComponent(parsed.password)
  const database = parsed.pathname.slice(1)
  return { host, user, password, database }
}

async function neonQuery(text: string, params?: any[]) {
  const { host, user, password, database } = getConnectionInfo()
  const apiUrl = `https://${host}/sql`

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": process.env.DATABASE_URL!,
    },
    body: JSON.stringify({
      query: text,
      params: params || [],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error("[v0] Neon HTTP error:", err)
    throw new Error(`Database query failed: ${response.status}`)
  }

  const data = await response.json()
  // Neon returns { rows, fields, ... }
  return data
}

// ============================================
// QUERY HELPERS
// ============================================

export async function query(text: string, params?: any[]) {
  try {
    const data = await neonQuery(text, params)
    const rows = data.rows || []
    // Convert array rows to objects using field names
    const fields = data.fields || []
    const fieldNames = fields.map((f: any) => f.name)
    const objectRows = rows.map((row: any[]) => {
      if (Array.isArray(row)) {
        const obj: any = {}
        fieldNames.forEach((name: string, i: number) => {
          obj[name] = row[i]
        })
        return obj
      }
      return row // already an object
    })
    return { rows: objectRows, rowCount: objectRows.length }
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export async function getOne<T>(text: string, params?: any[]): Promise<T | null> {
  const result = await query(text, params)
  return (result.rows[0] || null) as T | null
}

export async function getMany<T>(text: string, params?: any[]): Promise<T[]> {
  const result = await query(text, params)
  return result.rows as T[]
}

// ============================================
// USERS
// ============================================

export async function getUserByEmail(email: string) {
  return getOne(`SELECT * FROM users WHERE email = $1`, [email])
}

export async function getUserById(id: string) {
  return getOne(`SELECT * FROM users WHERE id = $1`, [id])
}

export async function createUser(data: {
  email: string
  password_hash: string
  name: string
  role: "admin" | "supervisor" | "tecnico" | "cliente"
  customer_id?: string
}) {
  const result = await query(
    `INSERT INTO users (email, password_hash, name, role, customer_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.email, data.password_hash, data.name, data.role, data.customer_id || null]
  )
  return result.rows[0]
}

export async function listUsers(role?: string) {
  if (role) {
    return getMany(
      `SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC`,
      [role]
    )
  }
  return getMany(`SELECT * FROM users ORDER BY created_at DESC`)
}

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomerById(id: string) {
  return getOne(`SELECT * FROM customers WHERE id = $1`, [id])
}

export async function listCustomers() {
  return getMany(`SELECT * FROM customers ORDER BY name ASC`)
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
  const result = await query(
    `INSERT INTO customers (name, email, phone, address, city, lat, lng, type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.name,
      data.email,
      data.phone || null,
      data.address || null,
      data.city || null,
      data.lat || null,
      data.lng || null,
      data.type,
    ]
  )
  return result.rows[0]
}

export async function updateCustomer(
  id: string,
  data: Partial<{
    name: string
    email: string
    phone: string
    address: string
    city: string
    lat: number
    lng: number
    nps_score: number
    rating: number
  }>
) {
  const result = await query(
    `UPDATE customers
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         address = COALESCE($4, address),
         city = COALESCE($5, city),
         lat = COALESCE($6, lat),
         lng = COALESCE($7, lng),
         nps_score = COALESCE($8, nps_score),
         rating = COALESCE($9, rating)
     WHERE id = $10 RETURNING *`,
    [
      data.name,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.lat,
      data.lng,
      data.nps_score,
      data.rating,
      id,
    ]
  )
  return result.rows[0]
}

export async function deleteCustomer(id: string) {
  await query(`DELETE FROM customers WHERE id = $1`, [id])
}

// ============================================
// INVENTORY
// ============================================

export async function getInventoryItemById(id: string) {
  return getOne(`SELECT * FROM inventory_items WHERE id = $1`, [id])
}

export async function listInventoryItems() {
  return getMany(`SELECT * FROM inventory_items ORDER BY name ASC`)
}

export async function createInventoryItem(data: {
  sku: string
  name: string
  category: string
  description?: string
  unit_cost: number
  min_threshold?: number
}) {
  const result = await query(
    `INSERT INTO inventory_items (sku, name, category, description, unit_cost, min_threshold)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      data.sku,
      data.name,
      data.category,
      data.description || null,
      data.unit_cost,
      data.min_threshold || 10,
    ]
  )
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
  const result = await query(
    `INSERT INTO stock_movements (item_id, type, quantity, from_location, to_location, reference_id, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.item_id,
      data.type,
      data.quantity,
      data.from_location || null,
      data.to_location || null,
      data.reference_id || null,
      data.notes || null,
      data.created_by || null,
    ]
  )
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
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.user_id, data.type, data.title, data.body || null, data.reference_id || null]
  )
  return result.rows[0]
}

export async function listNotifications(user_id: string) {
  return getMany(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  )
}

export async function markNotificationAsRead(id: string) {
  await query(`UPDATE notifications SET read = TRUE WHERE id = $1`, [id])
}
