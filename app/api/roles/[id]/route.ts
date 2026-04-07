import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, permissions } = body

    // Update role
    const updateResult = await query(
      `UPDATE roles SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND is_system = false
       RETURNING id, name, description`,
      [name, description, id]
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found or is a system role' },
        { status: 404 }
      )
    }

    // Update permissions if provided
    if (Array.isArray(permissions)) {
      // Delete existing permissions
      await query(
        `DELETE FROM role_permissions WHERE role_id = $1`,
        [id]
      )

      // Insert new permissions
      for (const permId of permissions) {
        await query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
          [id, permId]
        )
      }
    }

    console.log('[v0] Role updated:', name)

    return NextResponse.json({
      data: updateResult.rows[0],
      message: 'Role updated successfully',
    })
  } catch (error) {
    console.error('[v0] Error updating role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if role is system role
    const roleResult = await query(
      `SELECT is_system FROM roles WHERE id = $1`,
      [id]
    )

    if (roleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    if (roleResult.rows[0].is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      )
    }

    // Delete role permissions first
    await query(`DELETE FROM role_permissions WHERE role_id = $1`, [id])

    // Delete role
    await query(`DELETE FROM roles WHERE id = $1`, [id])

    console.log('[v0] Role deleted:', id)

    return NextResponse.json({
      message: 'Role deleted successfully',
    })
  } catch (error) {
    console.error('[v0] Error deleting role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
