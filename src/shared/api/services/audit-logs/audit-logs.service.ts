import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import { apiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    const data = await apiCall<{ value: AuditLog[] }>(
        `${API_BASE_URL}/audit-logs`,
        {
            method: "GET",
        }
    );
    return data.value;
};

export const getAuditLogsMe = async (): Promise<AuditLog[]> => {
    const data = await apiCall<{ value: AuditLog[] }>(
        `${API_BASE_URL}/audit-logs/me`,
        {
            method: "GET",
        }
    );
    return data.value;
};

export const getAuditLogById = async (
    auditLogId: string
): Promise<AuditLog> => {
    return await apiCall<AuditLog>(`${API_BASE_URL}/audit-logs/${auditLogId}`, {
        method: "GET",
    });
};
