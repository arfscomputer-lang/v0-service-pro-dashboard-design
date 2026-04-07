import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Get all roles with their permissions
    const rolesResult = await query(
      `SELECT 
        r.id,
        r.name,
        r.description,
        r.is_system,
        r.created_at,
        json_agg(json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description
        )) as permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id, r.name, r.description, r.is_system, r.created_at
      ORDER BY r.is_system DESC, r.name ASC`,
      []
    )

    // Get all available permissions
    const permissionsResult = await query(
      `SELECT id, name, description, category FROM permissions ORDER BY category, name`,
      []
    )

    return NextResponse.json({
      roles: rolesResult.rows || [],
      permissions: permissionsResult.rows || [],
    })
  } catch (error) {
    console.error('[v0] Error fetching roles and permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles and permissions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description } = body

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    // Create new role
    const result = await query(
      `INSERT INTO roles (name, description, is_system) 
       VALUES ($1, $2, false) 
       RETURNING id, name, description, is_system, created_at`,
      [name, description]
    )

    console.log('[v0] Role created:', name)

    return NextResponse.json({
      data: result.rows[0],
      message: 'Role created successfully',
    })
  } catch (error) {
    console.error('[v0] Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
