
import type { Role, RoleUser } from "@/features/roles/types/role.types";
import type { ODataResponse, TableState } from "@/types/odata.types";
import type { Permission } from "@/types/permissions.types";

const mockRoles: Role[] = Array.from({ length: 15 }, (_, i) => ({
    id: `role-${i+1}`,
    name: `Vai trò ${i+1}`,
    description: `Mô tả chi tiết cho vai trò thứ ${i+1} của hệ thống.`
}));

const mockRoleUsers: RoleUser[] = Array.from({ length: 25 }, (_, i) => ({
    id: `user-in-role-${i + 1}`,
    email: `user${i+1}@example.com`,
    connection: i % 3 === 0 ? 'Google' : i % 3 === 1 ? 'Database' : 'Microsoft',
    lockoutEnabled: i % 5 === 0
}));

const mockRolePermissions: Permission[] = Array.from({ length: 10 }, (_, i) => ({
    id: `perm-in-role-${i + 1}`,
    name: `role-permission:${i+1}`,
    description: `Mô tả quyền trong vai trò ${i + 1}`,
    clientName: `Client ${i % 2 + 1}`
}));


export interface RolesQueryResult {
    roles: Role[];
    totalCount: number;
    hasMore: boolean;
}

export interface RoleUsersQueryResult {
    roles: RoleUser[];
    totalCount: number;
    hasMore: boolean;
}

export interface RolePermissionsQueryResult {
    rolePermissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

const applyFilteringAndSorting = (data: any[], tableState: TableState, searchTerm?: string, textFields: string[] = ['name', 'description']) => {
    let filteredData = [...data];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item =>
            textFields.some(field => item[field]?.toLowerCase().includes(lowercasedFilter))
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
};


export const getRolesWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<RolesQueryResult> => {
     console.log("Mocking getRolesWithOData", { tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockRoles, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                roles: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getRolesByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<RolesQueryResult> => {
     console.log("Mocking getRolesByFieldWithOData", { field, searchTerm });
      return new Promise(resolve => {
        setTimeout(() => {
             let results = mockRoles;
            if (field && searchTerm) {
                 results = mockRoles.filter(role => {
                    const roleField = (role as any)[field];
                    if (Array.isArray(searchTerm)) {
                        return searchTerm.includes(roleField);
                    }
                    return roleField === searchTerm;
                });
            }
            resolve({
                roles: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};

export const searchRolesByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<RolesQueryResult> => {
     console.log("Mocking searchRolesByFieldWithOData", { field, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
             let results = mockRoles;
            if (field && searchTerm) {
                 results = mockRoles.filter(role => {
                    const roleField = (role as any)[field];
                    return roleField?.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
            resolve({
                roles: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};

export const getRoleUsersWithOData = async (
    roleId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<RoleUsersQueryResult> => {
    console.log("Mocking getRoleUsersWithOData", { roleId, tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockRoleUsers, tableState, searchTerm, ['email', 'connection']);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                roles: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getRolePermissionsWithOData = async (
    roleId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<RolePermissionsQueryResult> => {
    console.log("Mocking getRolePermissionsWithOData", { roleId, tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockRolePermissions, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                rolePermissions: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};
