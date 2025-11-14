
import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";

const mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    action: i % 5 === 0 ? 'LOGIN_SUCCESS' : i % 5 === 1 ? 'UPDATE_USER_INFO' : i % 5 === 2 ? 'CREATE_ROLE' : i % 5 === 3 ? 'DELETE_CLIENT' : 'LOGOUT',
    actorName: `user${i % 10 + 1}@example.com`,
    result: i % 4 === 0 ? 'Failed' : 'Success',
    targetType: i % 3 === 0 ? 'User' : i % 3 === 1 ? 'Role' : 'Client',
    ipAddress: `192.168.1.${i + 1}`,
    browserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    details: { a: 1, b: 2 },
    data1: `Target User ${i + 1}`
}));

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    console.log("Mocking getAuditLogs");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockAuditLogs);
        }, 300);
    });
};

export const getAuditLogsMe = async (): Promise<AuditLog[]> => {
    console.log("Mocking getAuditLogsMe");
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockAuditLogs.slice(0, 10)); // Giả sử user này chỉ có 10 logs
        }, 300);
    });
};

export const getAuditLogById = async (
    auditLogId: string
): Promise<AuditLog> => {
     console.log("Mocking getAuditLogById", auditLogId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const log = mockAuditLogs.find(l => l.id === auditLogId);
            if (log) {
                resolve(log);
            } else {
                reject(new Error("Audit Log not found"));
            }
        }, 300);
    });
};
