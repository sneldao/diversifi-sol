import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

// In-memory store
const webhooks = new Map<string, Webhook>();

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, events } = body;

  if (!url || !events?.length) {
    return errorResponse('URL and events array required', 400);
  }

  const id = `wh_${Date.now()}`;
  const webhook: Webhook = {
    id,
    url,
    events,
    secret: generateSecret(),
    enabled: true,
    createdAt: new Date().toISOString(),
    triggerCount: 0,
  };

  webhooks.set(id, webhook);

  return successResponse({ 
    webhookId: id,
    secret: webhook.secret, // Only returned on creation
  }, { type: 'webhook_created' });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const webhook = webhooks.get(id);
    if (!webhook) {
      return errorResponse('Webhook not found', 404);
    }
    // Don't return secret
    const { secret, ...safe } = webhook;
    return successResponse({ webhook: safe });
  }

  return successResponse({ 
    webhooks: Array.from(webhooks.values()).map(w => ({ ...w, secret: undefined })) 
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return errorResponse('Webhook ID required', 400);
  }

  const deleted = webhooks.delete(id);
  return successResponse({ deleted });
}

// Webhook event dispatcher (internal)
async function dispatchEvent(event: string, data: unknown) {
  for (const [id, webhook] of webhooks) {
    if (!webhook.enabled) continue;
    if (!webhook.events.includes(event) && !webhook.events.includes('*')) continue;

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DiversiFi-Event': event,
          'X-DiversiFi-Signature': webhook.secret, // In production, use HMAC
        },
        body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
      });

      if (response.ok) {
        webhook.lastTriggered = new Date().toISOString();
        webhook.triggerCount++;
      }
    } catch (error) {
      console.error(`Webhook ${id} failed:`, error);
    }
  }
}
