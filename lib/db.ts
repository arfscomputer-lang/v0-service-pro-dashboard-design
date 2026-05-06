import { neon } from "@neondatabase/serverless"
import { generateOccurrenceDates, AssetMaintenanceInfo } from "@/lib/maintenance"

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

export async function updateInventoryItem(id: string, data: Record<string, any>) {
  const allowedFields: Record<string, string> = {
    sku: "sku", name: "name", category: "category", description: "description",
    unit_cost: "unit_cost", price_unit: "price_unit",
    min_threshold: "min_threshold", max_stock: "max_stock",
    total_stock: "total_stock", is_active: "is_active",
    barcode: "barcode", unit: "unit", image_url: "image_url",
  }
  const sets: string[] = []
  const values: any[] = []
  let idx = 1

  // Accept both camelCase (frontend) and snake_case (DB) field names
  const fieldMap: Record<string, string> = {
    costUnit: "unit_cost", priceUnit: "price_unit",
    minStock: "min_threshold", maxStock: "max_stock",
    totalStock: "total_stock", isActive: "is_active",
    imageUrl: "image_url",
  }

  const normalized: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    const dbKey = fieldMap[k] ?? k
    normalized[dbKey] = v
  }

  for (const [key, col] of Object.entries(allowedFields)) {
    if (normalized[key] !== undefined) {
      sets.push(`${col} = $${idx}`)
      values.push(normalized[key])
      idx++
    }
  }

  if (sets.length === 0) return getInventoryItemById(id)

  values.push(id)
  const result = await query(
    `UPDATE inventory_items SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  )
  return result.rows[0] || null
}

export async function deleteInventoryItem(id: string) {
  await query(`DELETE FROM stock_movements WHERE item_id = $1`, [id])
  await query(`DELETE FROM inventory_items WHERE id = $1`, [id])
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
    technicianName: row.technician_name || null,
    technicianRole: row.technician_role || null,
    technicianPhone: row.technician_phone || null,
    assetId: row.asset_id || null,
    category: row.category || 'Otros',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    technicianStartedAt: row.technician_started_at || null,
    technicianCompletedAt: row.technician_completed_at || null,
    technicianNotes: row.technician_notes || null,
  }
}

export async function listWorkOrders(technician_id?: string) {
  if (technician_id) {
    const rows = await getMany<any>(
      `SELECT * FROM work_orders WHERE technician_id = $1 ORDER BY scheduled_date DESC, scheduled_time DESC`,
      [technician_id]
    )
    return rows.map(normalizeWorkOrder)
  }
  const rows = await getMany<any>(`SELECT * FROM work_orders ORDER BY scheduled_date DESC, scheduled_time DESC`)
  return rows.map(normalizeWorkOrder)
}

export async function getWorkOrderById(id: string) {
  const row = await getOne<any>(
    `SELECT wo.*,
            t.name  AS technician_name,
            t.role  AS technician_role,
            t.phone AS technician_phone
     FROM work_orders wo
     LEFT JOIN technicians t ON t.id = wo.technician_id
     WHERE wo.id = $1`,
    [id]
  )
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

  // Lazy: ensure optional columns exist
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS asset_id UUID`).catch(() => {})
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS category TEXT`).catch(() => {})

  const allowedFields: Record<string, string> = {
    order_id: "order_id", type: "type", description: "description",
    status: "status", priority: "priority", address: "address",
    city: "city", scheduled_date: "scheduled_date", scheduled_time: "scheduled_time",
    customer_id: "customer_id", technician_id: "technician_id",
    asset_id: "asset_id", category: "category",
    technician_started_at: "technician_started_at",
    technician_completed_at: "technician_completed_at",
    technician_notes: "technician_notes",
  }

  // Columns that are nullable (empty string → null)
  const nullableColumns = new Set(["customer_id", "technician_id", "asset_id", "technician_started_at", "technician_completed_at", "technician_notes"])

  for (const [key, col] of Object.entries(allowedFields)) {
    if (data[key] !== undefined) {
      if (col === "technician_id" && data[key] && !isValidUUID(data[key])) {
        console.log(`[v0] Skipping invalid technician_id: ${data[key]}`)
        continue
      }
      // Only convert empty string to null for nullable columns
      const value = nullableColumns.has(col) ? (data[key] || null) : data[key]
      sets.push(`${col} = $${idx}`)
      values.push(value)
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
  status?: string
  criticality?: string
  description?: string
  brand?: string
  model?: string
  year_manufactured?: number
  site_location?: string
  department?: string
  capacity?: string
  lat?: number
  lng?: number
  has_maintenance_plan?: boolean
  recurrence_type?: string
  interval_months?: number
  interval_hours?: number
  interval_cycles?: number
  hours_threshold_alert?: number
}) {
  await Promise.all([
    query(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS department TEXT`).catch(() => {}),
    query(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS lat NUMERIC(10,7)`).catch(() => {}),
    query(`ALTER TABLE assets ADD COLUMN IF NOT EXISTS lng NUMERIC(10,7)`).catch(() => {}),
  ])
  const result = await query(
    `INSERT INTO assets (
      asset_id, name, customer_id, type, category, serial_number, status,
      criticality, description, brand, model, year_manufactured,
      site_location, department, capacity, lat, lng,
      has_maintenance_plan, recurrence_type,
      interval_months, interval_hours, interval_cycles, hours_threshold_alert,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW()
    ) RETURNING *`,
    [
      data.asset_id,
      data.name,
      data.customer_id,
      data.type,
      data.category,
      data.serial_number,
      data.status || 'activo',
      data.criticality || 'medio',
      data.description || null,
      data.brand || '',
      data.model || '',
      data.year_manufactured || null,
      data.site_location || null,
      data.department || null,
      data.capacity || null,
      data.lat || null,
      data.lng || null,
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
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS asset_id UUID`).catch(() => {})
  await query(`ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Otros'`).catch(() => {})

  // Search by UUID first; fall back to short-code for old QR codes that only have asset_id
  let asset = await getOne<any>(`SELECT * FROM assets WHERE id = $1`, [id]).catch(() => null)
  if (!asset) {
    asset = await getOne<any>(`SELECT * FROM assets WHERE asset_id = $1`, [id]).catch(() => null)
  }
  if (!asset) return null

  const assetUuid: string = asset.id

  const lastService = await getOne<any>(
    `SELECT
       COALESCE(t.name, u.name, 'Sin asignar') AS last_technician_name,
       wo.type                          AS last_service_type,
       wo.description                   AS last_service_description,
       wo.technician_notes              AS last_technician_notes,
       COALESCE(wo.technician_completed_at, wo.updated_at) AS last_service_date
     FROM work_orders wo
     LEFT JOIN technicians t ON t.id = wo.technician_id
     LEFT JOIN users u ON u.id = wo.technician_id
     WHERE wo.status = 'completada'
       AND (
         wo.asset_id = $1::uuid
         OR wo.order_id IN (
           SELECT work_order_id FROM maintenance_occurrences
           WHERE asset_id = $1::uuid AND work_order_id IS NOT NULL
         )
         OR wo.description ILIKE $2
       )
     ORDER BY COALESCE(wo.technician_completed_at, wo.updated_at) DESC NULLS LAST
     LIMIT 1`,
    [assetUuid, `%${asset.asset_id}%`]
  ).catch((e) => { console.error('[db] lastService query error:', e); return null })

  console.log(`[db] getAssetById ${assetUuid} (${asset.asset_id}): lastService =`, lastService ? `found — ${lastService.last_technician_name}` : 'null')
  return { ...asset, lastService: lastService ?? null }
}

export async function getAssetsByCustomer(customer_id: string) {
  return getMany(
    `SELECT * FROM assets 
     WHERE customer_id = $1 AND status != 'retirado' 
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
  return result.rows[0] ?? null
}

export async function deleteAsset(id: string) {
  await query(`DELETE FROM assets WHERE id = $1`, [id])
}

export async function getAssetsDueForMaintenance(customer_id: string, days_ahead: number = 7) {
  return getMany(
    `SELECT * FROM assets
     WHERE customer_id = $1
     AND has_maintenance_plan = true
     AND status != 'retirado'
     AND next_maintenance_date <= NOW() + INTERVAL '1 day' * $2
     ORDER BY next_maintenance_date ASC`,
    [customer_id, days_ahead]
  )
}

export async function updateAssetMaintenanceDates(
  id: string,
  next_maintenance_date: Date | null
) {
  return getOne(
    `UPDATE assets SET next_maintenance_date = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [next_maintenance_date, id]
  )
}

export async function getAssetsWithMaintenancePlan(customer_id: string) {
  return getMany(
    `SELECT id, asset_id, name, customer_id, has_maintenance_plan, recurrence_type,
            interval_months, last_maintenance_date, next_maintenance_date, created_at
     FROM assets
     WHERE customer_id = $1
     AND has_maintenance_plan = true
     AND status != 'retirado'
     ORDER BY next_maintenance_date ASC NULLS LAST`,
    [customer_id]
  )
}

// ============================================
// FASE 3 — PLANES DE MANTENIMIENTO
// ============================================

export async function getMaintenancePlans(filters: {
  customer_id?: string
  search?: string
}) {
  const conditions: string[] = ["a.has_maintenance_plan = true", "a.status != 'retirado'"]
  const params: any[] = []
  let idx = 1

  if (filters.customer_id) {
    conditions.push(`a.customer_id = $${idx++}`)
    params.push(filters.customer_id)
  }

  if (filters.search) {
    conditions.push(`(LOWER(a.name) LIKE $${idx} OR LOWER(a.asset_id) LIKE $${idx})`)
    params.push(`%${filters.search.toLowerCase()}%`)
    idx++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return getMany(
    `SELECT
       a.id, a.asset_id, a.name, a.brand, a.model, a.site_location,
       a.customer_id, a.recurrence_type, a.interval_months,
       a.last_maintenance_date, a.next_maintenance_date,
       a.has_maintenance_plan, a.created_at,
       c.name AS customer_name
     FROM assets a
     LEFT JOIN customers c ON c.id = a.customer_id
     ${where}
     ORDER BY a.next_maintenance_date ASC NULLS LAST`,
    params
  )
}

export async function getMaintenanceHistoryByAsset(asset_internal_id: string) {
  return getMany(
    `SELECT
       wo.id, wo.order_id, wo.status, wo.scheduled_date,
       wo.technician_completed_at AS completed_date,
       wo.description,
       wo.technician_notes AS notes,
       wo.created_at,
       CASE
         WHEN wo.technician_notes LIKE 'Técnico:%'
         THEN split_part(wo.technician_notes, chr(10), 1)
         ELSE NULL
       END AS technician_name
     FROM work_orders wo
     WHERE wo.type = 'preventivo'
       AND wo.description LIKE $1
     ORDER BY wo.created_at DESC
     LIMIT 24`,
    [`%${asset_internal_id}%`]
  )
}

export async function completeMaintenanceExecution(data: {
  asset_id: string
  asset_internal_id: string
  customer_id: string
  asset_name: string
  completed_date: Date
  technician_name: string
  notes: string
  was_overdue: boolean
  next_maintenance_date: Date | null
}) {
  // 1. Create the completed work order
  const orderId = `PV-${Date.now().toString(36).toUpperCase().slice(-8)}`
  const techNotes = [
    data.technician_name ? `Técnico: ${data.technician_name}` : null,
    data.notes || null,
  ].filter(Boolean).join('\n') || null
  const wo = await getOne(
    `INSERT INTO work_orders (order_id, customer_id, type, status, priority, description, technician_notes, address, city, scheduled_date, scheduled_time, technician_completed_at, created_at, updated_at)
     VALUES ($1, $2, 'preventivo', 'completada', 'normal', $3, $4, '', '', $5::date, '00:00', $5::timestamptz, NOW(), NOW())
     RETURNING *`,
    [
      orderId,
      data.customer_id,
      `Mantenimiento preventivo: ${data.asset_name} (${data.asset_id})`,
      techNotes,
      data.completed_date,
    ]
  )

  // 2. Update asset last_maintenance_date and recalculate next
  await query(
    `UPDATE assets
     SET last_maintenance_date = $1,
         next_maintenance_date = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [data.completed_date, data.next_maintenance_date, data.asset_internal_id]
  )

  // 3. Mark the oldest pending occurrence as completed and link to the new work order
  const woRow = wo as any
  if (woRow?.order_id) {
    await linkOccurrenceToWorkOrder(
      data.asset_internal_id,
      woRow.order_id,
      data.completed_date,
      data.notes || undefined
    )
  }

  // 4. Regenerate pending occurrences from the new next_maintenance_date
  if (data.next_maintenance_date) {
    const updatedAsset = await getOne<any>(`SELECT * FROM assets WHERE id = $1`, [data.asset_internal_id])
    if (updatedAsset) {
      await upsertMaintenanceOccurrences(data.asset_internal_id, updatedAsset as AssetMaintenanceInfo)
    }
  }

  return wo
}

export async function createPreventiveWorkOrder(data: {
  order_id: string
  customer_id: string
  asset_id: string
  asset_name: string
  scheduled_date: Date
}) {
  // Verify no pending preventive order already exists for this asset
  const existing = await getOne<{ id: string }>(
    `SELECT id FROM work_orders
     WHERE customer_id = $1
     AND description LIKE $2
     AND type = 'preventivo'
     AND status IN ('pendiente', 'en_progreso')`,
    [data.customer_id, `%${data.asset_id}%`]
  )
  if (existing) return null

  return getOne(
    `INSERT INTO work_orders (order_id, customer_id, type, status, description, scheduled_date, created_at, updated_at)
     VALUES ($1, $2, 'preventivo', 'pendiente', $3, $4, NOW(), NOW())
     RETURNING *`,
    [
      data.order_id,
      data.customer_id,
      `Mantenimiento preventivo: ${data.asset_name} (${data.asset_id})`,
      data.scheduled_date,
    ]
  )
}

// ============================================
// MAINTENANCE OCCURRENCES
// ============================================

async function ensureMaintenanceOccurrencesTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS maintenance_occurrences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
      scheduled_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendiente',
      work_order_id TEXT REFERENCES work_orders(order_id),
      generated_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      notes TEXT
    )
  `).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_mo_asset_id ON maintenance_occurrences(asset_id)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_mo_scheduled_date ON maintenance_occurrences(scheduled_date)`).catch(() => {})
}

export async function upsertMaintenanceOccurrences(
  asset_internal_id: string,
  asset: AssetMaintenanceInfo
) {
  await ensureMaintenanceOccurrencesTable()
  const dates = generateOccurrenceDates(asset)
  if (dates.length === 0) return []

  // Replace all pending occurrences; keep completed ones untouched
  await query(
    `DELETE FROM maintenance_occurrences WHERE asset_id = $1 AND status = 'pendiente'`,
    [asset_internal_id]
  )

  const results: any[] = []
  for (const date of dates) {
    const row = await getOne(
      `INSERT INTO maintenance_occurrences (asset_id, scheduled_date) VALUES ($1, $2) RETURNING *`,
      [asset_internal_id, date]
    )
    if (row) results.push(row)
  }

  // Auto-generate work orders for occurrences within the next 30 days
  await autoGenerateWorkOrdersFromOccurrences({ asset_id: asset_internal_id })

  return results
}

export async function getMaintenanceOccurrences(filters: {
  asset_id?: string
  customer_id?: string
  status?: string
  from?: string
  to?: string
}) {
  await ensureMaintenanceOccurrencesTable()

  const conditions: string[] = []
  const params: any[] = []
  let idx = 1

  if (filters.asset_id) { conditions.push(`mo.asset_id = $${idx++}`); params.push(filters.asset_id) }
  if (filters.customer_id) { conditions.push(`a.customer_id = $${idx++}`); params.push(filters.customer_id) }
  if (filters.status) { conditions.push(`mo.status = $${idx++}`); params.push(filters.status) }
  if (filters.from) { conditions.push(`mo.scheduled_date >= $${idx++}`); params.push(filters.from) }
  if (filters.to) { conditions.push(`mo.scheduled_date <= $${idx++}`); params.push(filters.to) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return getMany(
    `SELECT
       mo.id, mo.asset_id, mo.scheduled_date, mo.status,
       mo.work_order_id, mo.generated_at, mo.completed_at, mo.notes,
       a.asset_id AS asset_code, a.name AS asset_name,
       a.customer_id, c.name AS customer_name
     FROM maintenance_occurrences mo
     JOIN assets a ON a.id = mo.asset_id
     LEFT JOIN customers c ON c.id = a.customer_id
     ${where}
     ORDER BY mo.scheduled_date ASC`,
    params
  )
}

export async function linkOccurrenceToWorkOrder(
  asset_internal_id: string,
  work_order_id: string,
  completed_at: Date,
  notes?: string
) {
  await ensureMaintenanceOccurrencesTable()

  const occurrence = await getOne<{ id: string }>(
    `SELECT id FROM maintenance_occurrences
     WHERE asset_id = $1 AND status = 'pendiente'
     ORDER BY scheduled_date ASC LIMIT 1`,
    [asset_internal_id]
  )
  if (!occurrence) return null

  await query(
    `UPDATE maintenance_occurrences
     SET status = 'completada', work_order_id = $1, completed_at = $2, notes = $3
     WHERE id = $4`,
    [work_order_id, completed_at, notes || null, occurrence.id]
  )
  return occurrence
}

export async function autoGenerateWorkOrdersFromOccurrences(filters: {
  asset_id?: string
  customer_id?: string
  days_ahead?: number
}) {
  await ensureMaintenanceOccurrencesTable()

  const daysAhead = filters.days_ahead ?? 30
  const conditions = [
    `mo.status = 'pendiente'`,
    `mo.work_order_id IS NULL`,
    `mo.scheduled_date <= CURRENT_DATE + INTERVAL '1 day' * $1`,
  ]
  const params: any[] = [daysAhead]
  let idx = 2

  if (filters.asset_id) {
    conditions.push(`mo.asset_id = $${idx++}`)
    params.push(filters.asset_id)
  }
  if (filters.customer_id) {
    conditions.push(`a.customer_id = $${idx++}`)
    params.push(filters.customer_id)
  }

  const due = await getMany<any>(
    `SELECT mo.id AS occurrence_id, mo.scheduled_date,
            a.id AS asset_internal_id, a.asset_id AS asset_code,
            a.name AS asset_name, a.customer_id
     FROM maintenance_occurrences mo
     JOIN assets a ON a.id = mo.asset_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY mo.scheduled_date ASC`,
    params
  )

  const created: string[] = []

  for (const occ of due) {
    const datePart = String(occ.scheduled_date).slice(0, 7).replace('-', '')
    const codePart = String(occ.asset_code).replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const orderId = `PV-${codePart}-${datePart}`

    const existing = await getOne<{ id: string }>(
      `SELECT id FROM work_orders WHERE order_id = $1`,
      [orderId]
    )
    if (existing) {
      // Link occurrence to the already-existing work order
      await query(
        `UPDATE maintenance_occurrences SET work_order_id = $1 WHERE id = $2 AND work_order_id IS NULL`,
        [orderId, occ.occurrence_id]
      )
      continue
    }

    const wo = await getOne<any>(
      `INSERT INTO work_orders
         (order_id, customer_id, type, status, priority, description,
          scheduled_date, scheduled_time, address, city, asset_id, category, created_at, updated_at)
       VALUES ($1, $2, 'preventivo', 'pendiente', 'normal', $3, $4, '08:00', '', '', $5, 'Preventivo', NOW(), NOW())
       RETURNING id, order_id`,
      [
        orderId,
        occ.customer_id,
        `Mantenimiento preventivo: ${occ.asset_name} (${occ.asset_code})`,
        occ.scheduled_date,
        occ.asset_internal_id,
      ]
    )

    if (wo?.id) {
      await query(
        `UPDATE maintenance_occurrences SET work_order_id = $1 WHERE id = $2`,
        [wo.id, occ.occurrence_id]
      )
      created.push(wo.order_id)
    }
  }

  return created
}
