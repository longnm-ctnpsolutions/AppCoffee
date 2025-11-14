
import type { Permission } from "@/types/permissions.types";
import type { ODataResponse, TableState } from "@/types/odata.types";

const mockPermissions: Permission[] = Array.from({ length: 30 }, (_, i) => ({
    id: `perm-${i + 1}`,
    name: `permissions:action${i+1}`,
    description: `Mô tả cho quyền ${i + 1}`,
    clientName: `Client ${i % 5 + 1}`
}));


export interface PermissionsQueryResult {
    permissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

const applyFilteringAndSorting = (permissions: Permission[], tableState: any, searchTerm?: string): Permission[] => {
     let filteredData = [...permissions];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter(p =>
            p.name?.toLowerCase().includes(lowercasedFilter) ||
            p.description?.toLowerCase().includes(lowercasedFilter)
        );
    }

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


export const getPermissionsWithOData = async (
    clientId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<PermissionsQueryResult> => {
     console.log("Mocking getPermissionsWithOData", { clientId, tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const clientPermissions = mockPermissions.filter(p => p.clientName === `Client for ${clientId}`);
            const filteredData = applyFilteringAndSorting(clientPermissions, tableState, searchTerm);
            
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                permissions: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const searchClientPermissionByFieldWithOData = async (
    field?: string,
    searchTerm?: string,
    clientId?: string
): Promise<PermissionsQueryResult> => {
    console.log("Mocking searchClientPermissionByFieldWithOData", { field, searchTerm, clientId });
    return new Promise(resolve => {
        setTimeout(() => {
             let results = mockPermissions.filter(p => p.clientName === `Client for ${clientId}`);
            if (field && searchTerm) {
                 results = results.filter(p => {
                    const pField = (p as any)[field];
                    return pField?.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
            resolve({
                permissions: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};
