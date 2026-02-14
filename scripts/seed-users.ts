import bcrypt from 'bcryptjs'
import { query } from '../lib/db'

const SEED_USERS = [
  {
    email: 'admin@servicepro.mx',
    password: 'admin123',
    name: 'Carlos Rodriguez',
    role: 'admin',
    status: 'active',
  },
  {
    email: 'supervisor@servicepro.mx',
    password: 'super123',
    name: 'Laura Sanchez',
    role: 'supervisor',
    status: 'active',
  },
  {
    email: 'tecnico@servicepro.mx',
    password: 'tecnico123',
    name: 'Miguel Torres',
    role: 'tecnico',
    status: 'active',
  },
  {
    email: 'cliente@empresaalfa.mx',
    password: 'cliente123',
    name: 'Empresa Alfa',
    role: 'cliente',
    status: 'active',
  },
]

async function seedUsers() {
  try {
    console.log('[SEED] Starting user seed...')

    for (const user of SEED_USERS) {
      // Check if user already exists
      const existing = await query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      )

      if (existing.rowCount > 0) {
        console.log(`[SEED] User ${user.email} already exists, skipping...`)
        continue
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10)

      // Insert user
      await query(
        `INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user.email, passwordHash, user.name, user.role, user.status]
      )

      console.log(`[SEED] Created user: ${user.email}`)
    }

    console.log('[SEED] User seed completed!')
  } catch (error) {
    console.error('[SEED] Error:', error)
    process.exit(1)
  }
}

seedUsers()
