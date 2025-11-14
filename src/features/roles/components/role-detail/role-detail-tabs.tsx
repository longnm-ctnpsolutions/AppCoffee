
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card } from "@/shared/components/ui/card";
import { useRolesActions, useRoleDetail } from "@/context/roles-context";
import RoleDetailsForm from "@/features/roles/components/role-detail/role-detail-form";
import PermissionsTableWrapper from "@/features/roles/components/role-detail/permissions-table-wrap";
import UsersTableWrapper from "@/features/roles/components/role-detail/users-table-wrap";
import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from "@/types/auth.types";

interface RoleDetailTabsProps {
    onTabChange?: (tab: string) => void;
}

export default function RoleDetailTabs({ onTabChange }: RoleDetailTabsProps) {
    const { error } = useRolesActions();
    const { selectedRole } = useRoleDetail();
    const { hasPermission } = usePermissions();

    const [tab, setTab] = React.useState("details");

    const rolePermissions = React.useMemo(() => ({
        canEdit: hasPermission(CORE_PERMISSIONS.ROLES_EDIT),
        canRolePermissionsRead: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_READ),
        canRolePermissionsCreate: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_ASSIGN),
        canRolePermissionsDelete: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_DELETE),
        canRoleUsersRead: hasPermission(CORE_PERMISSIONS.ROLE_USERS_READ),
        canRoleUsersCreate: hasPermission(CORE_PERMISSIONS.ROLE_USERS_ASSIGN),
        canRoleUsersDelete: hasPermission(CORE_PERMISSIONS.ROLE_USERS_DELETE),
    }), [hasPermission]);

    const handleChange = (value: string) => {
        setTab(value);
        onTabChange?.(value);
    };

    return (
        <Tabs value={tab} onValueChange={handleChange} className="flex-1 flex flex-col overflow-hidden">
            {/* Card chứa TabsList (Header) - Added shadow */}
            <Card className="rounded-b-none border-b-0 shadow-md">
                <div className="px-2 pt-1 pb-2">
                    <TabsList className="w-full justify-start bg-transparent">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        {rolePermissions.canRolePermissionsRead &&
                            (
                                <TabsTrigger value="permissions">
                                    Permissions

                                </TabsTrigger>
                            )
                        }
                        {rolePermissions.canRoleUsersRead &&
                            (
                                <TabsTrigger value="users">
                                    Users

                                </TabsTrigger>
                            )
                        }


                    </TabsList>
                </div>
            </Card>

            {/* Card chứa nội dung, có thể scroll - Added shadow */}
            <Card className="flex flex-col flex-1 overflow-hidden rounded-t-none shadow-lg">
                <div className="flex flex-col flex-1 h-full min-h-0">
                    <div className="flex-1 flex flex-col overflow-y-auto min-h-0 px-4 pb-6 pt-0">
                        <TabsContent value="details">
                            <RoleDetailsForm error={error} canEdit={rolePermissions.canEdit} />
                        </TabsContent>

                        {rolePermissions.canRolePermissionsRead &&
                            (
                                <TabsContent value="permissions">
                                    <PermissionsTableWrapper
                                        roleId={selectedRole!.id}
                                        initialPageSize={20}
                                        canRolePermissionsCreate={rolePermissions.canRolePermissionsCreate}
                                        canRolePermissionsDelete={rolePermissions.canRolePermissionsDelete}
                                    />
                                </TabsContent>
                            )
                        }

                        {
                            rolePermissions.canRoleUsersRead &&
                            (
                                <TabsContent value="users">
                                    <UsersTableWrapper
                                        roleId={selectedRole!.id}
                                        initialPageSize={20}
                                        canRoleUsersCreate={rolePermissions.canRoleUsersCreate}
                                        canRoleUsersDelete={rolePermissions.canRolePermissionsDelete}
                                    />
                                </TabsContent>
                            )
                        }
                    </div>
                </div>
            </Card>
        </Tabs>
    );
}
