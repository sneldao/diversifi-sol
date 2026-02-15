interface CircuitState {
  provider: string;
  chain: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure?: string;
  nextAttempt?: string;
}

const CONFIG = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
};

const circuits: Map<string, CircuitState> = new Map();

export function getCircuit(key: string) {
  return circuits.get(key);
}

export function getAllCircuits() {
  return Array.from(circuits.values());
}

export function setCircuit(key: string, circuit: CircuitState) {
  circuits.set(key, circuit);
}

export function isCircuitOpen(chain: string, provider: string): boolean {
  const key = `${chain}:${provider}`;
  const circuit = circuits.get(key);
  
  if (!circuit) return false;
  
  if (circuit.state === 'open') {
    if (circuit.nextAttempt && Date.now() > new Date(circuit.nextAttempt).getTime()) {
      circuit.state = 'half-open';
      circuit.successes = 0;
      return false;
    }
    return true;
  }
  
  return false;
}

export const circuitConfig = CONFIG;
