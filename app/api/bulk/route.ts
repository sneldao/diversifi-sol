import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface BulkOperation {
  id: string;
  operations: Array<{
    endpoint: string;
    method: string;
    params: Record<string, unknown>;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: unknown[];
  createdAt: string;
}

const bulkOperations = new Map<string, BulkOperation>();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { operations } = body;

  if (!operations?.length) {
    return errorResponse('Operations array required', 400);
  }

  if (operations.length > 10) {
    return errorResponse('Maximum 10 operations per bulk request', 400);
  }

  const id = `bulk_${Date.now()}`;
  const op: BulkOperation = {
    id,
    operations,
    status: 'pending',
    results: [],
    createdAt: new Date().toISOString(),
  };

  bulkOperations.set(id, op);

  // Process operations in background
  processBulkOperations(id);

  return successResponse({ bulkId: id, operationCount: operations.length });
}

async function processBulkOperations(id: string) {
  const op = bulkOperations.get(id);
  if (!op) return;

  op.status = 'processing';

  const results: unknown[] = [];

  for (const operation of op.operations) {
    try {
      // Simulate processing (in production, call actual endpoints)
      await new Promise(resolve => setTimeout(resolve, 100));
      results.push({ status: 'success', operation: operation.endpoint });
    } catch (error) {
      results.push({ status: 'error', operation: operation.endpoint, error: String(error) });
    }
  }

  op.results = results;
  op.status = 'completed';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const op = bulkOperations.get(id);
    if (!op) {
      return errorResponse('Bulk operation not found', 404);
    }
    return successResponse({ operation: op });
  }

  return successResponse({ 
    operations: Array.from(bulkOperations.values()).map(o => ({ 
      id: o.id, 
      operationCount: o.operations.length, 
      status: o.status 
    }))
  });
}
