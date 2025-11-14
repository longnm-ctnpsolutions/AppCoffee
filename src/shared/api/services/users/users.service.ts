
import {
    AddUser,
    User,
    UserFormData,
    UserRole,
} from "@/features/users/types/user.types";

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

const mockUserRoles: UserRole[] = Array.from({ length: 3 }, (_, i) => ({
    id: `user-role-${i+1}`,
    name: `Vai trò người dùng ${i+1}`,
    description: `Mô tả cho vai trò ${i+1}`
}));


export const getUsers = async (): Promise<User[]> => {
    console.log("Mocking getUsers");
    return new Promise(resolve => setTimeout(() => resolve([...mockUsers]), 300));
};

export const createUser = async (newUserData: AddUser): Promise<User> => {
    console.log("Mocking createUser", newUserData);
    return new Promise(resolve => {
        setTimeout(() => {
            const newUser: User = {
                id: `user-${Date.now()}`,
                email: newUserData.email,
                connection: 'Database', // Default connection for new users
                lockoutEnabled: false,
                profile: {
                    firstName: newUserData.firstName,
                    lastName: newUserData.lastName || '',
                }
            };
            mockUsers.unshift(newUser);
            resolve(newUser);
        }, 500);
    });
};

export const updateUser = async (
    userId: string,
    updateData: Partial<UserFormData>
): Promise<User> => {
    console.log("Mocking updateUser", userId, updateData);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockUsers.findIndex(u => u.id === userId);
            if (index !== -1) {
                const user = mockUsers[index];
                user.profile.firstName = updateData.firstName || user.profile.firstName;
                user.profile.lastName = updateData.lastName || user.profile.lastName;
                // Password update is handled separately
                resolve(user);
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
};

export const updateUserPassword = async (
    userId: string,
    password: string
): Promise<any> => {
    console.log("Mocking updateUserPassword", userId);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};

export const deleteUser = async (userId: string): Promise<void> => {
    console.log("Mocking deleteUser", userId);
    return new Promise(resolve => setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === userId);
        if (index !== -1) {
            mockUsers.splice(index, 1);
        }
        resolve();
    }, 500));
};

export const deleteMultipleUsers = async (userIds: string[]): Promise<void> => {
    console.log("Mocking deleteMultipleUsers", userIds);
    return new Promise(resolve => setTimeout(() => {
        userIds.forEach(id => {
            const index = mockUsers.findIndex(u => u.id === id);
            if (index !== -1) {
                mockUsers.splice(index, 1);
            }
        });
        resolve();
    }, 500));
};

export const getUserById = async (userId: string): Promise<UserFormData> => {
    console.log("Mocking getUserById", userId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.id === userId);
            if (user) {
                const flatData: UserFormData = {
                    id: user.id,
                    email: user.email,
                    connection: user.connection,
                    firstName: user.profile?.firstName ?? "",
                    lastName: user.profile?.lastName ?? "",
                    roles: ['Admin', 'User'], // Mock roles
                    signedUp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // Mock signed up date
                    lockoutEnabled: user.lockoutEnabled,
                };
                resolve(flatData);
            } else {
                reject(new Error("User not found"));
            }
        }, 300);
    });
};

export const deleteUserRoleId = async (
    userId: string,
    roleId: string
): Promise<void> => {
     console.log("Mocking deleteUserRoleId", { userId, roleId });
    // In a real app, this would disassociate a user from a role
    return new Promise(resolve => setTimeout(resolve, 500));
};

export const updateUserStatus = async (
  userId: string,
  active: boolean
): Promise<UserFormData> => {
    console.log("Mocking updateUserStatus", { userId, active });
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockUsers.findIndex(u => u.id === userId);
            if (index !== -1) {
                mockUsers[index].lockoutEnabled = !active;
                const user = mockUsers[index];
                 const flatData: UserFormData = {
                    id: user.id,
                    email: user.email,
                    connection: user.connection,
                    firstName: user.profile?.firstName ?? "",
                    lastName: user.profile?.lastName ?? "",
                    roles: ['Admin', 'User'],
                    signedUp: new Date().toISOString(),
                    lockoutEnabled: user.lockoutEnabled,
                };
                resolve(flatData);
            } else {
                reject(new Error("User not found"));
            }
        }, 500);
    });
};

export const getUserRole = async (userId: string): Promise<UserRole[]> => {
    console.log("Mocking getUserRole", userId);
    return new Promise(resolve => setTimeout(() => resolve([...mockUserRoles]), 300));
};

export const createUserRole = async (
    userId: string,
    roles: string[]
): Promise<boolean> => {
    console.log("Mocking createUserRole", { userId, roles });
    // Simulate adding roles to a user
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
};
