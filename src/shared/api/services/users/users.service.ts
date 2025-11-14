import {
    AddUser,
    User,
    UserFormData,
    UserRole,
} from "@/features/users/types/user.types";
import { apiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export type UpdateUserData = {
    id: string;
    name?: string;
    description?: string | null;
    homePageUrl?: string | null;
    logoUrl?: string | null;
    callbackUrl?: string | null;
    logoutUrl?: string | null;
    UserId?: string;
    status?: number | string;
    identifier?: string;
};

export const getUsers = async (): Promise<User[]> => {
    const data = await apiCall<{ value: User[] }>(`${API_BASE_URL}/users`, {
        method: "GET",
    });
    return data.value;
};

export const createUser = async (newUserData: AddUser): Promise<User> => {
    return await apiCall<User>(`${API_BASE_URL}/Users`, {
        method: "POST",
        body: JSON.stringify(newUserData),
    });
};

export const updateUser = async (
    userId: string,
    updateData: UserFormData
): Promise<any> => {
    return await apiCall<UserFormData>(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
            userId: updateData.id,
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            password: updateData.password,
        }),
    });
};

export const updateUserPassword = async (
    userId: string,
    updateData: { userId: string; password: string }
): Promise<any> => {
    return await apiCall<void>(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
    });
};

export const deleteUser = async (userId: string): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
    });
};

export const deleteMultipleUsers = async (userIds: string[]): Promise<void> => {
    await Promise.all(
        userIds.map(async (id) => {
            await apiCall<void>(`${API_BASE_URL}/users/${id}`, {
                method: "DELETE",
            });
        })
    );
};
export const getUserById = async (userId: string): Promise<any> => {

     const user = await apiCall<any>(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
    });

        const flatData: UserFormData = {
        id: user.id,
        email: user.email,
        connection: user.connection,
        firstName: user.profile?.firstName ?? "",
        lastName: user.profile?.lastName ?? "",
        roles: user.profile?.roles ?? [],
        signedUp: user.createdAt,
        lockoutEnabled: user.lockoutEnabled,
        };

        console.log("✅ API trả về user:", user);
        return flatData;
};

export const deleteUserRoleId = async (
    userId: string,
    roleId: string
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/users/${userId}/roles/${roleId}`, {
        method: "DELETE",
    });
};

export const updateUserStatus = async (
  userId: string,
  status: boolean
): Promise<UserFormData> => {

    return await apiCall<UserFormData>(`${API_BASE_URL}/users/${userId}/active`, {
        method: "POST",
        body: JSON.stringify({
            userId,
            active: status,
        }),
    });
};

export const getUserRole = async (userId: string): Promise<UserRole[]> => {
    const data = await apiCall<{ value: UserRole[] }>(
        `${API_BASE_URL}/users/${userId}/roles`,
        {
            method: "GET",
        }
    );
    return data.value;
};

export const createUserRole = async (
    userId: string,
    roles: string[]
): Promise<boolean> => {
     return await apiCall<boolean>(`${API_BASE_URL}/users/${userId}/roles`, {
        method: "POST",
        body: JSON.stringify({
            userId,
            roles,
        }),
    });
};