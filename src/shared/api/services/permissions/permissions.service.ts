import type { Permission } from "@/types/permissions.types";
import { apiCall, handleResponse } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export const deletePermissionId = async (
    clientId: string,
    permissionId: string
): Promise<void> => {
    try {
          await apiCall<void>(`${API_BASE_URL}/clients/${clientId}/permissions/${permissionId}`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
          });
    } catch (error) {
        console.error("Delete client failed:", error);
        throw error;
    }
};

export const deleteRolePermissionId = async (
    roleId: string,
    permissionId: string
): Promise<void> => {
    try {
        await apiCall<void>(`${API_BASE_URL}/roles/${roleId}/permissions/${permissionId}`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Delete client failed:", error);
        throw error;
    }
};

export const deleteUserPermissionId = async (
    userId: string,
    permissionId: string
): Promise<void> => {
    try {
        await apiCall<void>(`${API_BASE_URL}/users/${userId}/permissions/${permissionId}`, {
            method: 'DELETE',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Delete client failed:", error);
        throw error;
    }
};

interface AddPermissionRequest {
    clientId: string;
    name: string;
    description: string;
}

interface AddRolePermissionRequest {
    roleId: string;
    permissionIds: string[];
}

export const addPermission = async (
    clientId: string,
    permissionData: Omit<AddPermissionRequest, "clientId">
): Promise<Permission> => {
    try {
        return await apiCall<Permission>(`${API_BASE_URL}/clients/${clientId}/permissions`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            
            body: JSON.stringify({
                clientId,
                name: permissionData.name,
                description: permissionData.description,
            })});
    } catch (error) {
        console.error("Add permission failed:", error);
        throw error;
    }
};

export const importPermission = async (
    clientId: string,
    file: File
): Promise<Permission[]> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        return await apiCall<Permission[]>(
            `${API_BASE_URL}/clients/${clientId}/permissions/import`,
            {
                method: "POST",
                credentials: "include",
                body: formData,
            }
        );
    } catch (error) {
        console.error("Import permissions failed:", error);
        throw error;
    }
};

export const addRolePermission = async (
    roleId: string,
    permissions: string[]
): Promise<boolean> => {
    try {
        return await apiCall<boolean>(`${API_BASE_URL}/roles/${roleId}/permissions`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                    roleId,
                    permissions, 
                })});
    } catch (error) {
        console.error("❌ Add permission failed:", error);
        return false;
    }
};

export const addUserPermission = async (
    userId: string,
    permissions: string[]
): Promise<boolean> => {
    try {
         return await apiCall<boolean>(`${API_BASE_URL}/users/${userId}/permissions`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
                body: JSON.stringify({
                    userId,
                    permissions, // truyền nguyên mảng ID
                })});
    } catch (error) {
        console.error("❌ Add permission failed:", error);
        return false;
    }
};

export const getRolePermission = async (roleId: string): Promise<Permission[]> => {
    try {

        const data = await apiCall<{ value: Permission[] }>(`${API_BASE_URL}/roles/${roleId}/permissions`, {
                method: "GET",
        });

        return data.value;
    } catch (error) {
        console.error("API call failed, falling back to mock data:", error);
        return [];
    }
};

export const getUserPermission = async (userId: string): Promise<Permission[]> => {
    try {
        const data = await apiCall<{ value: Permission[] }>(`${API_BASE_URL}/users/${userId}/permissions`, {
                method: "GET",
        });

        return data.value;
    } catch (error) {
        console.error("API call failed, falling back to mock data:", error);
        return [];
    }
};

export const getPermission = async (clientId: string): Promise<Permission[]> => {
    try {

        const data = await apiCall<{ value: Permission[] }>(`${API_BASE_URL}/clients/${clientId}/permissions`, {
                method: "GET",
        });

        return data.value;
    } catch (error) {
        console.error("API call failed, falling back to mock data:", error);
        return [];
    }
};


