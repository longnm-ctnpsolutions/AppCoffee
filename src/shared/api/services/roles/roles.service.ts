
import type { Role, RoleUser } from "@/features/roles/types/role.types";

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


export type UpdateRoleData = {
    id: string;
    name?: string;
    description?: string | null;
};

export const getRoles = async (): Promise<Role[]> => {
    console.log("Mocking getRoles");
    return new Promise(resolve => setTimeout(() => resolve([...mockRoles]), 300));
};

export const createRole = async (
    newRoleData: Omit<Role, "id">
): Promise<Role> => {
     console.log("Mocking createRole", newRoleData);
     return new Promise(resolve => {
        setTimeout(() => {
            const newRole: Role = {
                id: `role-${Date.now()}`,
                ...newRoleData
            };
            mockRoles.unshift(newRole);
            resolve(newRole);
        }, 500);
   });
};

export const updateRole = async (
    roleId: string,
    updateData: UpdateRoleData
): Promise<Role> => {
     console.log("Mocking updateRole", roleId, updateData);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockRoles.findIndex(r => r.id === roleId);
            if (index !== -1) {
                mockRoles[index] = { ...mockRoles[index], ...updateData };
                resolve(mockRoles[index]);
            } else {
                reject(new Error("Role not found"));
            }
        }, 500);
    });
};

export const deleteRole = async (roleId: string): Promise<void> => {
  console.log("Mocking deleteRole", roleId);
  return new Promise(resolve => setTimeout(() => {
      const index = mockRoles.findIndex(r => r.id === roleId);
      if (index !== -1) {
          mockRoles.splice(index, 1);
      }
      resolve();
  }, 500));
};

export const deleteMultipleRoles = async (roleIds: string[]): Promise<void> => {
  console.log("Mocking deleteMultipleRoles", roleIds);
   return new Promise(resolve => setTimeout(() => {
      roleIds.forEach(id => {
          const index = mockRoles.findIndex(r => r.id === id);
          if (index !== -1) {
              mockRoles.splice(index, 1);
          }
      });
      resolve();
  }, 500));
};

export const updateRoleStatus = async (
    roleId: string,
    status: number
): Promise<Role> => {
    // This function seems not implemented in the original service, but we can mock it.
    console.log("Mocking updateRoleStatus", roleId, status);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockRoles.findIndex(r => r.id === roleId);
            if (index !== -1) {
                // Assuming Role has a status property for this mock
                // (original type does not have it)
                (mockRoles[index] as any).status = status;
                resolve(mockRoles[index]);
            } else {
                reject(new Error("Role not found"));
            }
        }, 500);
    });
};

export const getRoleById = async (roleId: string): Promise<Role> => {
   console.log("Mocking getRoleById", roleId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const role = mockRoles.find(r => r.id === roleId);
            if (role) {
                resolve(role);
            } else {
                reject(new Error("Role not found"));
            }
        }, 300);
    });
};

export const createRoleUser = async (
    roleId: string,
    users: string[]
): Promise<boolean> => {
    console.log("Mocking createRoleUser", {roleId, users});
    // Simulate adding users to a role
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
};

export const deleteRoleUserId = async (
    roleId: string,
    userId: string
): Promise<void> => {
    console.log("Mocking deleteRoleUserId", {roleId, userId});
    return new Promise(resolve => setTimeout(() => {
        const index = mockRoleUsers.findIndex(u => u.id === userId);
         if (index !== -1) {
              mockRoleUsers.splice(index, 1);
         }
        resolve();
    }, 500));
};

export const getRoleUser = async (roleId: string): Promise<RoleUser[]> => {
    console.log("Mocking getRoleUser", roleId);
    return new Promise(resolve => setTimeout(() => resolve([...mockRoleUsers]), 300));
};
