
import type { Permission } from "@/types/permissions.types";

const mockPermissions: Permission[] = Array.from({ length: 30 }, (_, i) => ({
    id: `perm-${i + 1}`,
    name: `permissions:action${i+1}`,
    description: `Mô tả cho quyền ${i + 1}`,
    clientName: `Client ${i % 5 + 1}`
}));


export const deletePermissionId = async (
    clientId: string,
    permissionId: string
): Promise<void> => {
    console.log("Mocking deletePermissionId", {clientId, permissionId});
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockPermissions.findIndex(p => p.id === permissionId);
            if (index !== -1) {
                mockPermissions.splice(index, 1);
            }
            resolve();
        }, 500);
    });
};

export const deleteRolePermissionId = async (
    roleId: string,
    permissionId: string
): Promise<void> => {
    console.log("Mocking deleteRolePermissionId", {roleId, permissionId});
    // In a real scenario, this would remove the permission from the role
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const deleteUserPermissionId = async (
    userId: string,
    permissionId: string
): Promise<void> => {
    console.log("Mocking deleteUserPermissionId", {userId, permissionId});
     // In a real scenario, this would remove the permission from the user
    return new Promise(resolve => setTimeout(resolve, 500));
};

interface AddPermissionRequest {
    name: string;
    description: string;
}


export const addPermission = async (
    clientId: string,
    permissionData: Omit<AddPermissionRequest, "clientId">
): Promise<Permission> => {
    console.log("Mocking addPermission", {clientId, permissionData});
    return new Promise(resolve => {
        setTimeout(() => {
            const newPermission: Permission = {
                id: `perm-${Date.now()}`,
                name: permissionData.name,
                description: permissionData.description,
                clientName: `Client for ${clientId}`
            };
            mockPermissions.unshift(newPermission);
            resolve(newPermission);
        }, 500);
    });
};

export const importPermission = async (
    clientId: string,
    file: File
): Promise<Permission[]> => {
    console.log("Mocking importPermission", {clientId, fileName: file.name});
    return new Promise(resolve => {
        setTimeout(() => {
            // Simulate adding a few permissions from the file
            const newPerms = [
                { id: `imported-${Date.now()}-1`, name: 'imported:read', description: 'Imported Read', clientName: `Client for ${clientId}` },
                { id: `imported-${Date.now()}-2`, name: 'imported:write', description: 'Imported Write', clientName: `Client for ${clientId}` },
            ];
            mockPermissions.unshift(...newPerms);
            resolve(newPerms);
        }, 1000);
    });
};

export const addRolePermission = async (
    roleId: string,
    permissions: string[]
): Promise<boolean> => {
    console.log("Mocking addRolePermission", {roleId, permissions});
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const addUserPermission = async (
    userId: string,
    permissions: string[]
): Promise<boolean> => {
     console.log("Mocking addUserPermission", {userId, permissions});
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const getRolePermission = async (roleId: string): Promise<Permission[]> => {
    console.log("Mocking getRolePermission", roleId);
    return new Promise(resolve => {
        setTimeout(() => {
            // Return a subset of permissions for the role
            resolve(mockPermissions.slice(0, 5));
        }, 300);
    });
};

export const getUserPermission = async (userId: string): Promise<Permission[]> => {
     console.log("Mocking getUserPermission", userId);
      return new Promise(resolve => {
        setTimeout(() => {
            // Return a subset of permissions for the user
            resolve(mockPermissions.slice(5, 10));
        }, 300);
    });
};

export const getPermission = async (clientId: string): Promise<Permission[]> => {
     console.log("Mocking getPermission", clientId);
      return new Promise(resolve => {
        setTimeout(() => {
            // Return permissions for a specific client
            resolve(mockPermissions.filter(p => p.clientName === `Client for ${clientId}`));
        }, 300);
    });
};
