import { NextRequest, NextResponse } from 'next/server';

interface TelegramChannel {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'private';
  chatId: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for demo purposes
// In production, this should be stored in a database
let channels: TelegramChannel[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    let filteredChannels = [...channels];

    if (type) {
      filteredChannels = filteredChannels.filter(ch => ch.type === type);
    }

    if (active !== null) {
      const isActive = active === 'true';
      filteredChannels = filteredChannels.filter(ch => ch.isActive === isActive);
    }

    return NextResponse.json({
      success: true,
      channels: filteredChannels,
      total: filteredChannels.length
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка при завантаженні каналів'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, chatId, description } = await request.json();

    // Validate required fields
    if (!name || !type || !chatId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Назва, тип та Chat ID є обов\'язковими'
        },
        { status: 400 }
      );
    }

    // Check if channel with same chatId already exists
    const existingChannel = channels.find(ch => ch.chatId === chatId);
    if (existingChannel) {
      return NextResponse.json(
        {
          success: false,
          message: 'Канал з таким Chat ID вже існує'
        },
        { status: 400 }
      );
    }

    // Create new channel
    const newChannel: TelegramChannel = {
      id: Date.now().toString(),
      name,
      type,
      chatId,
      isActive: true,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    channels.push(newChannel);

    return NextResponse.json({
      success: true,
      message: 'Канал успішно створено',
      channel: newChannel
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка при створенні каналу'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, type, chatId, description, isActive } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID каналу є обов\'язковим'
        },
        { status: 400 }
      );
    }

    const channelIndex = channels.findIndex(ch => ch.id === id);
    if (channelIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Канал не знайдено'
        },
        { status: 404 }
      );
    }

    // Update channel
    channels[channelIndex] = {
      ...channels[channelIndex],
      ...(name && { name }),
      ...(type && { type }),
      ...(chatId && { chatId }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Канал успішно оновлено',
      channel: channels[channelIndex]
    });
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка при оновленні каналу'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID каналу є обов\'язковим'
        },
        { status: 400 }
      );
    }

    const channelIndex = channels.findIndex(ch => ch.id === id);
    if (channelIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: 'Канал не знайдено'
        },
        { status: 404 }
      );
    }

    // Remove channel
    const deletedChannel = channels.splice(channelIndex, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Канал успішно видалено',
      channel: deletedChannel
    });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Помилка при видаленні каналу'
      },
      { status: 500 }
    );
  }
}
