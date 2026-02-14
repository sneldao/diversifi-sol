import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';

interface CircuitState {
  provider: string;
  chain: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure?: string;
  nextAttempt?: string;
}

// Circuit breaker states per provider
const circuits: Map<string, CircuitState> = new Map();

const CONFIG = {
  failureThreshold: 5,    // Open after 5 failures
  successThreshold: 2,     // Close after 2 successes
  timeout: 30000,         // Try again after 30 seconds
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const chain = searchParams.get('chain');

  if (provider && chain) {
    const key = `${chain}:${provider}`;
    const circuit = circuits.get(key);
    return successResponse({ circuit: circuit || { provider, chain, state: 'closed', failures: 0, successes: 0 } });
  }

  return successResponse({ circuits: Array.from(circuits.values()) });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { provider, chain, action } = body;

  const key = `${chain}:${provider}`;
  let circuit = circuits.get(key);

  if (!circuit) {
    circuit = { provider, chain, state: 'closed', failures: 0, successes: 0 };
    circuits.set(key, circuit);
  }

  switch (action) {
    case 'failure':
      circuit.failures++;
      circuit.lastFailure = new Date().toISOString();
      if (circuit.failures >= CONFIG.failureThreshold) {
        circuit.state = 'open';
        circuit.nextAttempt = new Date(Date.now() + CONFIG.timeout).toISOString();
      }
      break;

    case 'success':
      circuit.successes++;
      if (circuit.state === 'half-open' && circuit.successes >= CONFIG.successThreshold) {
        circuit.state = 'closed';
        circuit.failures = 0;
        circuit.successes = 0;
        circuit.nextAttempt = undefined;
      }
      break;

    case 'reset':
      circuit.state = 'closed';
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.nextAttempt = undefined;
      break;

    default:
      return errorResponse('Action required: failure, success, or reset', 400);
  }

  return successResponse({ circuit });
}

// Check if circuit allows request
export function isCircuitOpen(chain: string, provider: string): boolean {
  const key = `${chain}:${provider}`;
  const circuit = circuits.get(key);
  
  if (!circuit) return false;
  
  if (circuit.state === 'open') {
    if (circuit.nextAttempt && Date.now() > new Date(circuit.nextAttempt).getTime()) {
      // Try half-open
      circuit.state = 'half-open';
      circuit.successes = 0;
      return false;
    }
    return true;
  }
  
  return false;
}
