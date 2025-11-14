
import { User, UserRole } from "@/features/users/types/user.types";
import { Permission } from "@/shared/types/permissions.types";

const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
    id: `user-${i+1}`,
    email: `user.${i+1}@example.com`,
    connection: i % 3 === 0 ? 'Database' : 'Google',
    lockoutEnabled: i % 5 === 0,
    profile: {
        firstName: `Người`,
        lastName: `Dùng ${i+1}`
    }
}));

const mockUserPermissions: Permission[] = Array.from({ length: 5 }, (_, i) => ({
    id: `user-perm-${i+1}`,
    name: `user:permission${i+1}`,
    description: `Mô tả quyền của người dùng ${i+1}`,
    clientName: 'Client 1'
}));

const mockUserRoles: UserRole[] = Array.from({ length: 3 }, (_, i) => ({
    id: `user-role-${i+1}`,
    name: `Vai trò người dùng ${i+1}`,
    description: `Mô tả cho vai trò ${i+1}`
}));


export interface UsersQueryResult {
    users: User[];
    totalCount: number;
    hasMore: boolean;
}

export interface UserPermissionsQueryResult {
    userPermissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

export interface UserRolesQueryResult {
    users: UserRole[];
    totalCount: number;
    hasMore: boolean;
}


const applyFilteringAndSorting = (data: any[], tableState: any, searchTerm?: string, textFields: string[] = ['email', 'connection']) => {
    let filteredData = [...data];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter(item =>
            textFields.some(field => item[field]?.toLowerCase().includes(lowercasedFilter))
        );
    }
     // Column filters
    tableState.columnFilters.forEach((filter: {id: string, value: any}) => {
        if(filter.id === 'lockoutEnabled' && filter.value !== undefined) {
             filteredData = filteredData.filter(user => user.lockoutEnabled === filter.value);
        }
    });
    
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

export const getUsersWithOData = async (
    tableState: any,
    searchTerm?: string
): Promise<UsersQueryResult> => {
     console.log("Mocking getUsersWithOData", { tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockUsers, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                users: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getUsersByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<UsersQueryResult> => {
    console.log("Mocking getUsersByFieldWithOData", { field, searchTerm });
    return new Promise(resolve => {
        setTimeout(() => {
             let results = mockUsers;
            if (field && searchTerm) {
                 results = mockUsers.filter(user => {
                    const userField = (user as any)[field];
                    if (Array.isArray(searchTerm)) {
                        return searchTerm.includes(userField);
                    }
                    return userField === searchTerm;
                });
            }
            resolve({
                users: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};

export const searchUsersByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<UsersQueryResult> => {
    console.log("Mocking searchUsersByFieldWithOData", { field, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
             let results = mockUsers;
            if (field && searchTerm) {
                 results = mockUsers.filter(user => {
                    const userField = (user as any)[field];
                    return userField?.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
            resolve({
                users: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};

export const getUserPermissionsWithOData = async (
    userId: string,
    tableState: any,
    searchTerm?: string
): Promise<UserPermissionsQueryResult> => {
    console.log("Mocking getUserPermissionsWithOData", { userId, tableState, searchTerm });
    return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockUserPermissions, tableState, searchTerm, ['name', 'description']);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                userPermissions: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getUserRolesWithOData = async (
    userId: string,
    tableState: any,
    searchTerm?: string
): Promise<UserRolesQueryResult> => {
    console.log("Mocking getUserRolesWithOData", { userId, tableState, searchTerm });
    return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockUserRoles, tableState, searchTerm, ['name', 'description']);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                users: paginatedData, // API returns a list of roles for a user
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};
