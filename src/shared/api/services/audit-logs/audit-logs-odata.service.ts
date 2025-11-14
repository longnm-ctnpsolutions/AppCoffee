
import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import type { ODataResponse, TableState } from "@/types/odata.types";

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
    data1: `Mục tiêu ${i + 1}`
}));


export interface AuditLogsQueryResult {
    auditLogs: AuditLog[];
    totalCount: number;
    hasMore: boolean;
}

const applyFilteringAndSorting = (logs: AuditLog[], tableState: TableState, searchTerm?: string): AuditLog[] => {
    let filteredData = [...logs];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter(log =>
            log.action?.toLowerCase().includes(lowercasedFilter) ||
            log.actorName?.toLowerCase().includes(lowercasedFilter) ||
            log.data1?.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    // Sắp xếp
    if (tableState.sorting.length > 0) {
        const sorter = tableState.sorting[0];
        filteredData.sort((a, b) => {
            const valA = (a as any)[sorter.id] || '';
            const valB = (b as any)[sorter.id] || '';
            if (valA < valB) return sorter.desc ? 1 : -1;
            if (valA > valB) return sorter.desc ? -1 : 1;
            return 0;
        });
    }

    return filteredData;
}


export const getAuditLogsWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<AuditLogsQueryResult> => {
     console.log("Mocking getAuditLogsWithOData", { tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockAuditLogs, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                auditLogs: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getAuditLogsMeWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<AuditLogsQueryResult> => {
    console.log("Mocking getAuditLogsMeWithOData", { tableState, searchTerm });
    const myLogs = mockAuditLogs.filter(log => log.actorName === 'user1@example.com');
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(myLogs, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                auditLogs: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};
