# ServicePro - Database Configuration

## 🗄️ Architecture

### Authentication (localStorage/sessionStorage)
- **Location**: `lib/context/auth-context.tsx`
- **Storage**: Client-side only (sessionStorage)
- **Users**: Defined in SEED_USERS constant
- **No database required** for login

### Application Data (Neon PostgreSQL)
- **Connection**: `@neondatabase/serverless` via `lib/db.ts`
- **Tables**: customers, users, technicians, work_orders, inventory_items, stock_movements, notifications
- **Environment Variable**: `DATABASE_URL` (already configured via Neon integration)

## 🔧 Setup Complete

### Database Schema
✅ Created via `scripts/init-db.sql` - Already executed
✅ Seeded via `scripts/seed-db.sql` - Already executed

### API Routes Using Database
✅ `/api/customers` - Customer management
✅ `/api/customers/[id]` - Customer details
✅ `/api/inventory` - Inventory items
✅ `/api/inventory/[id]` - Inventory details
✅ `/api/users` - User management (admin only)
✅ `/api/users/[id]` - User details

### Authentication (No Database)
✅ `/auth/login` - Login page (uses sessionStorage)
✅ `lib/context/auth-context.tsx` - Auth logic

## 🐛 Troubleshooting

### Error: "Module not found: Can't resolve '@vercel/postgres'"

This is a **Next.js cache issue**. The project no longer uses `@vercel/postgres`.

**Solution:**
1. The project automatically installs dependencies on save
2. Wait for the preview to rebuild
3. If error persists, it's a stale cache in the preview environment

**Files Checked:**
- ✅ No `@vercel/postgres` imports in code
- ✅ Removed from `package.json`
- ✅ All APIs use `@neondatabase/serverless` via `lib/db.ts`

## 📊 Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@servicepro.mx | admin123 |
| Supervisor | supervisor@servicepro.mx | super123 |
| Técnico | tecnico@servicepro.mx | tecnico123 |
| Cliente | cliente@empresaalfa.mx | cliente123 |

## 🚀 Current Status

- ✅ Database schema created and populated
- ✅ Authentication works with sessionStorage (no DB)
- ✅ All API routes configured to use Neon
- ✅ No `@vercel/postgres` dependencies
- ✅ `@neondatabase/serverless` installed
- ✅ `bcryptjs` installed for future password hashing
