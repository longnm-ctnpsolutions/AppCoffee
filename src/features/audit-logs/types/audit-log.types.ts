export type AuditLog = {
    id: string;
    timestamp?: string | null;
    action?: string | null;
    actorName?: string | null;
    result?: number | string;
    targetType?: string | null;
    ipAddress?: string | null;
    browserAgent?: string | null;
    details?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changeReason?: string | null;
    data1?: string | null;
    data2?: string | null;
    data3?: string | null;
    data4?: string | null;
};
