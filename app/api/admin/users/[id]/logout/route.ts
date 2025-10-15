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

    // Get user info
    const [userInfo] = await executeQuery<{
      id: number;
      uname: string;
      uname_ua: string;
      active: number;
    }>(`
      SELECT id, uname, uname_ua, active FROM a_powerusers WHERE id = ?
    `, [userId]);

    const user = userInfo[0];

    // Log the logout action
    console.log(`Forcing logout for user ${user.uname} (${user.uname_ua}) - User active status: ${user.active}`);

    // Note: In a production environment, you would implement session management
    // For now, we'll just log the action and return success
    // The actual logout will happen when the user tries to access protected routes
    // and the system checks their active status

    return NextResponse.json({
      success: true,
      message: 'User logout initiated',
      data: {
        userId: user.id,
        username: user.uname,
        fullName: user.uname_ua,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout user' },
      { status: 500 }
    );
  }
}
