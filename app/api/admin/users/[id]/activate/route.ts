import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

/**
 * Maps user roles to their corresponding permissions
 */
function getRolePermissions(role: string): Record<string, boolean> {
  switch (role) {
    case 'admin':
      return {
        ac_usermanage: true,
        ac_newsmanage: true,
        ac_articlemanage: true,
        ac_commentmanage: true,
        ac_sitemanage: true,
        ac_admanage: true,
        ac_telegrammanage: true,
      };
    
    case 'editor':
      return {
        ac_usermanage: false,
        ac_newsmanage: true,
        ac_articlemanage: true,
        ac_commentmanage: true,
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
    
    case 'journalist':
      return {
        ac_usermanage: false,
        ac_newsmanage: true,
        ac_articlemanage: true,
        ac_commentmanage: false,
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
    
    default:
      return {
        ac_usermanage: false,
        ac_newsmanage: false,
        ac_articlemanage: false,
        ac_commentmanage: false,
        ac_sitemanage: false,
        ac_admanage: false,
        ac_telegrammanage: false,
      };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    // Check if user exists
    const [existingUsers] = await executeQuery<{ count: number; role: string }>(`
      SELECT COUNT(*) as count, role FROM a_powerusers WHERE id = ?
    `, [userId]);

    if (existingUsers[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userRole = existingUsers[0].role || 'journalist';

    // Get user info
    const [userInfo] = await executeQuery<{
      id: number;
      uname: string;
      uname_ua: string;
    }>(`
      SELECT id, uname, uname_ua FROM a_powerusers WHERE id = ?
    `, [userId]);

    const user = userInfo[0];

    // Restore permissions based on role
    const permissions = getRolePermissions(userRole);
    const serializedPermissions = JSON.stringify(permissions);

    // Activate user and restore permissions
    await executeQuery(`
      UPDATE a_powerusers 
      SET active = 1, perm = ?
      WHERE id = ?
    `, [serializedPermissions, userId]);

    console.log(`User ${user.uname} (${user.uname_ua}) has been activated with ${userRole} role`);

    return NextResponse.json({
      success: true,
      message: 'User activated successfully',
      data: {
        userId: user.id,
        username: user.uname,
        fullName: user.uname_ua,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Error activating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate user' },
      { status: 500 }
    );
  }
}
