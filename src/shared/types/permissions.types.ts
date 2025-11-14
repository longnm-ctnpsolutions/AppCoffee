export type Permission = {
  id: string;
  name: string;
  description: string;
  clientName?: string;
};

export interface ClientPermissions {
  canCreate?: boolean;
  canRead?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canChangeStatus?: boolean;

  canPermissionsRead?: boolean;
  canPermissionsCreate?: boolean;
  canPermissionsEdit?: boolean;
  canPermissionsDelete?: boolean;
}


export interface RolePermissions {
  canCreate?: boolean;
  canRead?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;

  canRolePermissionsRead?: boolean;
  canRolePermissionsAssign?: boolean;
  canRolePermissionsDelete?: boolean;

  canRoleUsersRead?: boolean;
  canRoleUsersAssign?: boolean;
  canRoleUsersDelete?: boolean;
}

export interface UserPermissions {
  canCreate?: boolean;
  canRead?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canChangeStatus?: boolean;

  canUserPermissionsRead?: boolean;
  canUserPermissionsAssign?: boolean;
  canUserPermissionsDelete?: boolean;

  canUserRolesRead?: boolean;
  canUserRolesAssign?: boolean;
  canUserRolesDelete?: boolean;
}