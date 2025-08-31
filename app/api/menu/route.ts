import { NextResponse } from 'next/server';
import { getMenuData } from '../homepage/services/menuService';

export async function GET() {
  try {
    const menuData = await getMenuData();
    
    return NextResponse.json(menuData);
    
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}
