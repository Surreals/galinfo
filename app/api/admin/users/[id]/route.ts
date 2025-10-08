import { NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';
import crypto from 'crypto';

export interface UserFormData {
  uname_ua: string;
  uname: string;
  uagency: string;
  upass: string;
  active: boolean;
  permissions: Record<string, boolean>;
  role: string;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body: UserFormData = await request.json();
    
    // Validate required fields
    if (!body.uname_ua || !body.uname) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [existingUsers] = await executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count FROM a_powerusers WHERE id = ?
    `, [userId]);

    if (existingUsers[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username already exists (excluding current user)
    const [duplicateUsers] = await executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count FROM a_powerusers WHERE uname = ? AND id != ?
    `, [body.uname, userId]);

    if (duplicateUsers[0].count > 0) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Serialize permissions
    const serializedPermissions = JSON.stringify(body.permissions);

    // Build update query
    let updateQuery = `
      UPDATE a_powerusers 
      SET uname_ua = ?, uname = ?, uagency = ?, perm = ?, role = ?, active = ?
    `;
    let queryParams: any[] = [
      body.uname_ua,
      body.uname,
      body.uagency || '',
      serializedPermissions,
      body.role || 'journalist',
      body.active ? 1 : 0
    ];

    // Only update password if provided
    if (body.upass && body.upass.trim() !== '') {
      const hashedPassword = crypto.createHash('md5').update(body.upass).digest('hex');
      updateQuery += ', upass = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);

    // Update user
    await executeQuery(updateQuery, queryParams);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    // Check if user exists
    const [existingUsers] = await executeQuery<{ count: number }>(`
      SELECT COUNT(*) as count FROM a_powerusers WHERE id = ?
    `, [userId]);

    if (existingUsers[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await executeQuery(`
      DELETE FROM a_powerusers WHERE id = ?
    `, [userId]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
