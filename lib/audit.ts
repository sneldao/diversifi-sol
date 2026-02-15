interface AuditEntry {
  id: string;
  userId?: string;
  apiKey?: string;
  ip: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

const auditLog: AuditEntry[] = [];

export function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const fullEntry: AuditEntry = {
    ...entry,
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(fullEntry);
  
  // Keep last 10000 entries
  if (auditLog.length > 10000) {
    auditLog.splice(0, auditLog.length - 10000);
  }
}

export function getAuditLog() {
  return auditLog;
}
