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
    `INSERT INTO users (email, password_hash, name, role, customer_id, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.email, data.password_hash, data.name, data.role, data.customer_id || null, 'activo']
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

// ============================================
// WORK ORDERS
// ============================================

/** Normalize a work order row from DB into the shape the frontend expects */
function normalizeWorkOrder(row: any) {
  return {
    id: row.id || '',
    orderId: row.order_id || '',
    type: row.type || '',
    description: row.description || '',
    status: row.status || 'pendiente',
    priority: row.priority || 'normal',
    address: row.address || '',
    city: row.city || '',
    scheduledDate: row.scheduled_date ? String(row.scheduled_date).slice(0, 10) : '',
    scheduledTime: row.scheduled_time || '',
    customerId: row.customer_id || null,
    technicianId: row.technician_id || null,
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
  }
}

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
  // Validate technician_id: skip if not a valid UUID
  let technicianId = data.technician_id || null
  if (technicianId && !isValidUUID(technicianId)) {
    console.log(`[v0] Skipping invalid technician_id during creation: ${technicianId}`)
    technicianId = null
  }

  const result = await query(
    `INSERT INTO work_orders (order_id, type, description, status, priority, address, city, scheduled_date, scheduled_time, customer_id, technician_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
    [data.order_id, data.type, data.description, data.status, data.priority, data.address, data.city, data.scheduled_date, data.scheduled_time, data.customer_id || null, technicianId]
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
      // Skip technician_id if it's not a valid UUID (e.g., "tech-3" from frontend data)
      if (col === "technician_id" && data[key] && !isValidUUID(data[key])) {
        console.log(`[v0] Skipping invalid technician_id: ${data[key]}`)
        continue
      }
      sets.push(`${col} = $${idx}`)
      values.push(data[key] || null)
      idx++
    }
  }

  if (sets.length === 0) return getWorkOrderById(id)

  sets.push(`updated_at = NOW()`)
  const idIdx = idx
  values.push(id)
  const result = await query(
    `UPDATE work_orders SET ${sets.join(", ")} WHERE id = $${idIdx} RETURNING *`,
    values
  )
  return result.rows[0] ? normalizeWorkOrder(result.rows[0]) : null
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function deleteWorkOrder(id: string) {
  await query(`DELETE FROM work_orders WHERE id = $1`, [id])
}

// ============================================
// WORK ORDER ID GENERATION
// ============================================

export async function getNextWorkOrderId() {
  try {
    const result = await getOne<{ max: number }>(
      `SELECT CAST(SUBSTRING(MAX(order_id), 4) AS INTEGER) as max FROM work_orders WHERE order_id LIKE 'OT-%'`
    )
    const lastNumber = result?.max || 0
    const nextNumber = lastNumber + 1
    return `OT-${String(nextNumber).padStart(4, '0')}`
  } catch (error) {
    console.error('[v0] Error getting next work order ID:', error)
    // Fallback to a safe default
    return `OT-${String(Date.now() % 10000).padStart(4, '0')}`
  }
}

// ============================================
// ROLES AND PERMISSIONS
// ============================================

export async function getRolesWithPermissions() {
  return query(
    `SELECT 
      r.id,
      r.name,
      r.description,
      r.is_system,
      json_agg(json_build_object('id', p.id, 'name', p.name)) as permissions
    FROM roles r
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    GROUP BY r.id, r.name, r.description, r.is_system
    ORDER BY r.is_system DESC, r.name`,
    []
  )
}

export async function getUserPermissions(userId: string) {
  return query(
    `SELECT DISTINCT p.id, p.name, p.description
    FROM users u
    JOIN roles r ON u.role = r.name
    LEFT JOIN role_permissions rp ON r.id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = $1`,
    [userId]
  )
}

export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const result = await query(
    `SELECT EXISTS(
      SELECT 1
      FROM users u
      JOIN roles r ON u.role = r.name
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1 AND p.name = $2
    )`,
    [userId, permissionName]
  )
  return result.rows[0]?.exists || false
}


// ============================================
// SESSIONS
// ============================================

export async function createSession(data: {
  user_id: string
  token: string
  expires_at: Date
}) {
  const result = await query(
    `INSERT INTO sessions (user_id, token, expires_at)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.user_id, data.token, data.expires_at]
  )
  return result.rows[0]
}

export async function getSessionByToken(token: string) {
  return getOne(
    `SELECT s.*, u.* FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token]
  )
}

export async function deleteSession(token: string) {
  await query(`DELETE FROM sessions WHERE token = $1`, [token])
}

export async function deleteUserSessions(user_id: string) {
  await query(`DELETE FROM sessions WHERE user_id = $1`, [user_id])
}

export async function cleanupExpiredSessions() {
  await query(`DELETE FROM sessions WHERE expires_at <= NOW()`)
}

// ============================================
// ASSETS / EQUIPMENT MANAGEMENT
// ============================================

export async function createAsset(data: {
  asset_id: string
  name: string
  customer_id: string
  type: string
  category: string
  serial_number: string
  status?: 'active' | 'inactive' | 'in_repair' | 'retired'
  criticality?: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  brand?: string
  model?: string
  year_manufactured?: number
  site_location?: string
  capacity?: string
  has_maintenance_plan?: boolean
  recurrence_type?: string
  interval_months?: number
  interval_hours?: number
  interval_cycles?: number
  hours_threshold_alert?: number
}) {
  const result = await query(
    `INSERT INTO assets (
      asset_id, name, customer_id, type, category, serial_number, status, 
      criticality, description, brand, model, year_manufactured, 
      site_location, capacity, has_maintenance_plan, recurrence_type, 
      interval_months, interval_hours, interval_cycles, hours_threshold_alert,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
      $15, $16, $17, $18, $19, $20, NOW(), NOW()
    ) RETURNING *`,
    [
      data.asset_id,
      data.name,
      data.customer_id,
      data.type,
      data.category,
      data.serial_number,
      data.status || 'active',
      data.criticality || 'medium',
      data.description || null,
      data.brand || null,
      data.model || null,
      data.year_manufactured || null,
      data.site_location || null,
      data.capacity || null,
      data.has_maintenance_plan || false,
      data.recurrence_type || null,
      data.interval_months || null,
      data.interval_hours || null,
      data.interval_cycles || null,
      data.hours_threshold_alert || null,
    ]
  )
  return result.rows[0]
}

export async function getAssets() {
  return getMany(`SELECT * FROM assets ORDER BY created_at DESC`)
}

export async function getAssetById(id: string) {
  return getOne(`SELECT * FROM assets WHERE id = $1`, [id])
}

export async function getAssetsByCustomer(customer_id: string) {
  return getMany(
    `SELECT * FROM assets 
     WHERE customer_id = $1 AND status = 'active' 
     ORDER BY name ASC`,
    [customer_id]
  )
}

export async function updateAsset(id: string, data: Partial<any>) {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  if (fields.length === 0) return { rows: [] }

  fields.push(`updated_at = $${paramIndex}`)
  values.push(new Date())
  paramIndex++
  values.push(id)

  const result = await query(
    `UPDATE assets SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )
  return result.rows[0]
}

export async function deleteAsset(id: string) {
  await query(`DELETE FROM assets WHERE id = $1`, [id])
}

export async function getAssetsDueForMaintenance(customer_id: string, days_ahead: number = 7) {
  return getMany(
    `SELECT * FROM assets
     WHERE customer_id = $1
     AND has_maintenance_plan = true
     AND status = 'active'
     AND next_maintenance_date <= NOW() + INTERVAL '1 day' * $2
     ORDER BY next_maintenance_date ASC`,
    [customer_id, days_ahead]
  )
}
