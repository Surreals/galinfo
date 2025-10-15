import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export async function POST(
  request: NextRequest,
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

    // Get user info for logout
    const [userInfo] = await executeQuery<{
      id: number;
      uname: string;
      uname_ua: string;
    }>(`
      SELECT id, uname, uname_ua FROM a_powerusers WHERE id = ?
    `, [userId]);

    const user = userInfo[0];

    // Deactivate user and remove all permissions
    await executeQuery(`
      UPDATE a_powerusers 
      SET active = 0, perm = '{}'
      WHERE id = ?
    `, [userId]);

    // Log user logout for tracking
    console.log(`User ${user.uname} (${user.uname_ua}) has been deactivated and logged out`);
    
    // Note: In a production environment, you would invalidate all active sessions here
    // For now, the logout will be enforced when the user tries to access protected routes

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        userId: user.id,
        username: user.uname,
        fullName: user.uname_ua
      }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
