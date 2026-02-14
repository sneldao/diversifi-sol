import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'EUR' | 'GBP' | 'KES';
  language: 'en' | 'es' | 'fr' | 'sw';
  dashboardLayout: string;
  defaultChain: 'solana' | 'celo';
  notifications: {
    email: boolean;
    telegram: boolean;
    push: boolean;
  };
  display: {
    showSmallBalances: boolean;
    compactNumbers: boolean;
    showGasCosts: boolean;
  };
}

const preferences = new Map<string, UserPreferences>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, ...prefs } = body;

  if (!userId) return errorResponse('User ID required', 400);

  const userPrefs: UserPreferences = {
    userId,
    theme: prefs.theme || 'dark',
    currency: prefs.currency || 'USD',
    language: prefs.language || 'en',
    dashboardLayout: prefs.dashboardLayout || 'default',
    defaultChain: prefs.defaultChain || 'solana',
    notifications: prefs.notifications || { email: true, telegram: true, push: false },
    display: prefs.display || { showSmallBalances: false, compactNumbers: true, showGasCosts: true },
  };

  preferences.set(userId, userPrefs);
  return successResponse({ preferences: userPrefs });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return errorResponse('User ID required', 400);

  const userPrefs = preferences.get(userId);
  if (!userPrefs) {
    return errorResponse('Preferences not found', 404);
  }

  return successResponse({ preferences: userPrefs });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { userId, ...updates } = body;

  if (!userId) return errorResponse('User ID required', 400);

  const existing = preferences.get(userId);
  if (!existing) return errorResponse('Preferences not found', 404);

  const updated = { ...existing, ...updates };
  preferences.set(userId, updated);

  return successResponse({ preferences: updated });
}
