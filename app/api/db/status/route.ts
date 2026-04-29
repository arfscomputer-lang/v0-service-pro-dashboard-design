import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ connected: false, error: "DATABASE_URL no configurada" })
  }

  try {
    const start = Date.now()
    const info = await query(
      `SELECT
        current_database() AS database,
        current_user AS db_user,
        version() AS version,
        (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') AS table_count,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_connections
      `,
      []
    )
    const latency = Date.now() - start
    const row = info.rows[0] as any

    const versionShort = (row.version as string).split(" ").slice(0, 2).join(" ")
    const host = process.env.DATABASE_URL.replace(/^[^@]+@/, "").split("/")[0].split("?")[0]

    return NextResponse.json({
      connected: true,
      latency,
      database: row.database,
      db_user: row.db_user,
      version: versionShort,
      table_count: parseInt(row.table_count),
      active_connections: parseInt(row.active_connections),
      host,
    })
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : "Error de conexión",
    })
  }
}
