import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { getCircuit, getAllCircuits, setCircuit, circuitConfig } from '@/lib/circuitbreaker';

interface CircuitState {
  provider: string;
  chain: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure?: string;
  nextAttempt?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const chain = searchParams.get('chain');

  if (provider && chain) {
    const key = `${chain}:${provider}`;
    const circuit = getCircuit(key);
    return successResponse({ circuit: circuit || { provider, chain, state: 'closed', failures: 0, successes: 0 } });
  }

  return successResponse({ circuits: getAllCircuits() });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { provider, chain, action } = body;

  const key = `${chain}:${provider}`;
  let circuit = getCircuit(key);

  if (!circuit) {
    circuit = { provider, chain, state: 'closed', failures: 0, successes: 0 };
    setCircuit(key, circuit);
  }

  switch (action) {
    case 'failure':
      circuit.failures++;
      circuit.lastFailure = new Date().toISOString();
      if (circuit.failures >= circuitConfig.failureThreshold) {
        circuit.state = 'open';
        circuit.nextAttempt = new Date(Date.now() + circuitConfig.timeout).toISOString();
      }
      break;

    case 'success':
      circuit.successes++;
      if (circuit.state === 'half-open' && circuit.successes >= circuitConfig.successThreshold) {
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

  setCircuit(key, circuit);
  return successResponse({ circuit });
}
