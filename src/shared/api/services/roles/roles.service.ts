import type { Role, RoleUser } from "@/features/roles/types/role.types";
import { apiCall } from '@/lib/response-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type UpdateRoleData = {
    id: string;
    name?: string;
    description?: string | null;
};

interface AddRoleUserRequest {
    email: string;
    description: string;
}

export const getRoles = async (): Promise<Role[]> => {
    const data = await apiCall<{ value: Role[] }>(`${API_BASE_URL}/roles`, {
        method: "GET",
    });
    return data.value;
};

export const createRole = async (
    newRoleData: Omit<Role, "id" | "status">
): Promise<Role> => {
    return await apiCall<Role>(`${API_BASE_URL}/roles`, {
        method: "POST",
        body: JSON.stringify(newRoleData),
    });
};

export const updateRole = async (
    roleId: string,
    updateData: UpdateRoleData
): Promise<Role> => {
    return await apiCall<Role>(`${API_BASE_URL}/roles/${roleId}`, {
        method: "PUT",
        body: JSON.stringify({
            id: roleId,
            name: updateData.name,
            description: updateData.description,
        }),
    });
};

export const deleteRole = async (roleId: string): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/roles/${roleId}`, {
        method: "DELETE",
    });
};

export const deleteMultipleRoles = async (roleIds: string[]): Promise<void> => {
    await Promise.all(
        roleIds.map(async (id) => {
            await apiCall<void>(`${API_BASE_URL}/roles/${id}`, {
                method: "DELETE",
            });
        })
    );
};

export const updateRoleStatus = async (
    roleId: string,
    status: number
): Promise<Role> => {
    return await apiCall<Role>(`${API_BASE_URL}/roles/${roleId}/status`, {
        method: "PUT",
        body: JSON.stringify({
            id: roleId,
            status: status,
        }),
    });
};

export const getRoleById = async (roleId: string): Promise<Role> => {
    return await apiCall<Role>(`${API_BASE_URL}/roles/${roleId}`, {
        method: "GET",
    });
};

export const createRoleUser = async (
    roleId: string,
    users: string[]
): Promise<boolean> => {
    try {
        await apiCall<void>(`${API_BASE_URL}/roles/${roleId}/users`, {
            method: "POST",
            body: JSON.stringify({
                roleId,
                users,
            }),
        });
        return true;
    } catch (error) {
        console.error("❌ Add user failed:", error);
        return false;
    }
};

export const deleteRoleUserId = async (
    roleId: string,
    userId: string
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/roles/${roleId}/users/${userId}`, {
        method: "DELETE",
    });
};

export const getRoleUser = async (roleId: string): Promise<RoleUser[]> => {
    const data = await apiCall<{ value: RoleUser[] }>(`${API_BASE_URL}/roles/${roleId}/users`, {
        method: "GET",
    });
    return data.value;
};