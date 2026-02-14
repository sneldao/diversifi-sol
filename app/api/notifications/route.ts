import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface Notification {
  id: string;
  userId: string;
  type: 'alert' | 'rebalance' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const notifications = new Map<string, Notification[]>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, type, title, message } = body;

  if (!userId || !type || !title) {
    return errorResponse('User ID, type, and title required', 400);
  }

  const notification: Notification = {
    id: `notif_${Date.now()}`,
    userId,
    type,
    title,
    message: message || '',
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (!notifications.has(userId)) {
    notifications.set(userId, []);
  }
  notifications.get(userId)!.push(notification);

  return successResponse({ notification });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const unreadOnly = searchParams.get('unread') === 'true';

  if (!userId) {
    return errorResponse('User ID required', 400);
  }

  let userNotifs = notifications.get(userId) || [];

  if (unreadOnly) {
    userNotifs = userNotifs.filter(n => !n.read);
  }

  const unreadCount = userNotifs.filter(n => !n.read).length;

  return successResponse({ 
    notifications: userNotifs.reverse().slice(0, 50),
    unreadCount 
  });
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('id');
  const userId = searchParams.get('userId');
  const markRead = searchParams.get('read') === 'true';

  if (!userId) return errorResponse('User ID required', 400);

  const userNotifs = notifications.get(userId) || [];
  const notif = userNotifs.find(n => n.id === notificationId);

  if (notif && markRead) {
    notif.read = true;
  }

  return successResponse({ updated: !!notif });
}
