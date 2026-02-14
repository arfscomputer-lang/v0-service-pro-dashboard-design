import { neon } from "@neondatabase/serverless"

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(process.env.DATABASE_URL)
}

// ============================================
// QUERY HELPERS
// ============================================

export async function query(text: string, params?: any[]) {
  const sql = getSql()
  try {
    const rows = await sql(text, params)
    return { rows, rowCount: rows.length }
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
    return getMany(`SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC`, [role])
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
    [data.name, data.email, data.phone || null, data.address || null, data.city || null, data.lat || null, data.lng || null, data.type]
  )
  return result.rows[0]
}

export async function updateCustomer(
  id: string,
  data: Record<string, any>
) {
  const result = await query(
    `UPDATE customers SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       phone = COALESCE($3, phone),
       address = COALESCE($4, address),
       city = COALESCE($5, city),
       lat = COALESCE($6, lat),
       lng = COALESCE($7, lng),
       nps_score = COALESCE($8, nps_score),
       rating = COALESCE($9, rating),
       type = COALESCE($10, type)
     WHERE id = $11 RETURNING *`,
    [
      data.name ?? null, data.email ?? null, data.phone ?? null,
      data.address ?? null, data.city ?? null, data.lat ?? null,
      data.lng ?? null, data.nps_score ?? null, data.rating ?? null,
      data.type ?? null, id,
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
  sku: string; name: string; category: string; description?: string; unit_cost: number; min_threshold?: number
}) {
  const result = await query(
    `INSERT INTO inventory_items (sku, name, category, description, unit_cost, min_threshold)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.sku, data.name, data.category, data.description || null, data.unit_cost, data.min_threshold || 10]
  )
  return result.rows[0]
}

export async function recordStockMovement(data: {
  item_id: string; type: string; quantity: number; from_location?: string; to_location?: string; reference_id?: string; notes?: string; created_by?: string
}) {
  const result = await query(
    `INSERT INTO stock_movements (item_id, type, quantity, from_location, to_location, reference_id, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.item_id, data.type, data.quantity, data.from_location || null, data.to_location || null, data.reference_id || null, data.notes || null, data.created_by || null]
  )
  return result.rows[0]
}

// ============================================
// TECHNICIANS
// ============================================

export async function listTechnicians() {
  const rows = await getMany<any>(`SELECT * FROM technicians ORDER BY name ASC`)
  return rows.map(normalizeTechnician)
}

export async function getTechnicianById(id: string) {
  const row = await getOne<any>(`SELECT * FROM technicians WHERE id = $1`, [id])
  return row ? normalizeTechnician(row) : null
}

export async function createTechnician(data: {
  name: string; email: string; phone?: string; role?: string; status?: string;
  specialties?: string[]; certifications?: any[]; address?: string;
  lat?: number; lng?: number; avg_response_min?: number;
}) {
  const initials = data.name.split(" ").filter(Boolean).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
  const result = await query(
    `INSERT INTO technicians (name, email, phone, role, status, specialties, certifications, address, lat, lng, avg_response_min, initials, join_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_DATE) RETURNING *`,
    [
      data.name, data.email, data.phone || null, data.role || "junior",
      data.status || "disponible", JSON.stringify(data.specialties || []),
      JSON.stringify(data.certifications || []), data.address || null,
      data.lat || null, data.lng || null, data.avg_response_min || 0, initials,
    ]
  )
  return normalizeTechnician(result.rows[0])
}

export async function updateTechnician(id: string, data: Record<string, any>) {
  // Build dynamic SET clause from provided fields
  const allowedFields: Record<string, string> = {
    name: "name", email: "email", phone: "phone", role: "role",
    status: "status", address: "address", lat: "lat", lng: "lng",
    avg_response_min: "avg_response_min", average_rating: "average_rating",
    total_jobs: "total_jobs",
  }
  const sets: string[] = []
  const values: any[] = []
  let idx = 1

  for (const [key, col] of Object.entries(allowedFields)) {
    if (data[key] !== undefined) {
      sets.push(`${col} = $${idx}`)
      values.push(data[key])
      idx++
    }
  }
  // Handle JSON fields separately
  if (data.specialties !== undefined) {
    sets.push(`specialties = $${idx}`)
    values.push(JSON.stringify(data.specialties))
    idx++
  }
  if (data.certifications !== undefined) {
    sets.push(`certifications = $${idx}`)
    values.push(JSON.stringify(data.certifications))
    idx++
  }
  if (data.name) {
    const initials = data.name.split(" ").filter(Boolean).map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    sets.push(`initials = $${idx}`)
    values.push(initials)
    idx++
  }

  if (sets.length === 0) return getTechnicianById(id)

  sets.push(`updated_at = NOW()`)
  values.push(id)
  const result = await query(
    `UPDATE technicians SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ? normalizeTechnician(result.rows[0]) : null
}

export async function deleteTechnician(id: string) {
  await query(`DELETE FROM technician_availability WHERE technician_id = $1`, [id])
  await query(`DELETE FROM technicians WHERE id = $1`, [id])
}

/** Normalise a technician row from DB into the shape the frontend expects (TechnicianProfile) */
function normalizeTechnician(row: any) {
  let specialties = row.specialties || "[]"
  if (typeof specialties === "string") {
    try { specialties = JSON.parse(specialties) } catch { specialties = [] }
  }
  let certifications = row.certifications || "[]"
  if (typeof certifications === "string") {
    try { certifications = JSON.parse(certifications) } catch { certifications = [] }
  }
  // Map certification fields: DB uses {name, issuer, date, expiry} -> frontend uses {name, issuer, expires}
  const mappedCerts = (Array.isArray(certifications) ? certifications : []).map((c: any) => ({
    name: c.name || "",
    issuer: c.issuer || "",
    expires: c.expiry || c.expires || "",
  }))
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    initials: row.initials || "",
    role: row.role || "junior",
    status: row.status || "disponible",
    specialties: Array.isArray(specialties) ? specialties : [],
    certifications: mappedCerts,
    rating: row.average_rating ?? 0,
    completedJobs: row.total_jobs ?? 0,
    avgResponseMin: row.avg_response_min ?? 0,
    latitude: row.lat ?? 0,
    longitude: row.lng ?? 0,
    address: row.address || "",
    joinDate: row.join_date ? String(row.join_date).slice(0, 10) : "",
    availability: { days: ["Lun", "Mar", "Mie", "Jue", "Vie"], startHour: 8, endHour: 18 },
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export async function createNotification(data: {
  user_id: string; type: string; title: string; body?: string; reference_id?: string
}) {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.user_id, data.type, data.title, data.body || null, data.reference_id || null]
  )
  return result.rows[0]
}

export async function listNotifications(user_id: string) {
  return getMany(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, [user_id])
}

// ============================================
// WORK ORDERS
// ============================================

export async function listWorkOrders() {
  const rows = await getMany<any>(`SELECT * FROM work_orders ORDER BY scheduled_date DESC, scheduled_time DESC`)
  return rows.map(normalizeWorkOrder)
}

export async function getWorkOrderById(id: string) {
  const row = await getOne<any>(`SELECT * FROM work_orders WHERE id = $1`, [id])
  return row ? normalizeWorkOrder(row) : null
}

export async function createWorkOrder(data: {
  order_id: string; type: string; description: string; status: string;
  priority: string; address: string; city: string; scheduled_date: string;
  scheduled_time: string; customer_id?: string; technician_id?: string;
}) {
  const result = await query(
    `INSERT INTO work_orders (order_id, type, description, status, priority, address, city, scheduled_date, scheduled_time, customer_id, technician_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
    [data.order_id, data.type, data.description, data.status, data.priority, data.address, data.city, data.scheduled_date, data.scheduled_time, data.customer_id || null, data.technician_id || null]
  )
  return normalizeWorkOrder(result.rows[0])
}

export async function updateWorkOrder(id: string, data: Record<string, any>) {
  const sets: string[] = []
  const values: any[] = []
  let idx = 1

  const allowedFields: Record<string, string> = {
    order_id: "order_id", type: "type", description: "description",
    status: "status", priority: "priority", address: "address",
    city: "city", scheduled_date: "scheduled_date", scheduled_time: "scheduled_time",
    customer_id: "customer_id", technician_id: "technician_id",
  }

  for (const [key, col] of Object.entries(allowedFields)) {
    if (data[key] !== undefined) {
      sets.push(`${col} = $${idx}`)
      values.push(data[key] || null)
      idx++
    }
  }

  if (sets.length === 0) return getWorkOrderById(id)

  sets.push(`updated_at = NOW()`)
  values.push(id)
  const result = await query(
    `UPDATE work_orders SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] ? normalizeWorkOrder(result.rows[0]) : null
}

export async function deleteWorkOrder(id: string) {
  await query(`DELETE FROM work_orders WHERE id = $1`, [id])
}

function normalizeWorkOrder(row: any) {
  return {
    id: row.id,
    orderId: row.order_id,
    type: row.type || "",
    description: row.description || "",
    status: row.status || "pendiente",
    priority: row.priority || "normal",
    address: row.address || "",
    city: row.city || "",
    scheduledDate: row.scheduled_date ? String(row.scheduled_date).slice(0, 10) : "",
    scheduledTime: row.scheduled_time || "09:00",
    customerId: row.customer_id || null,
    technicianId: row.technician_id || null,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  }
}
