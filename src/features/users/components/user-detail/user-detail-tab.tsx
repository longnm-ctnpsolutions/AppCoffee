
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card } from "@/shared/components/ui/card";
import { useUsersActions, useUserDetail } from "@/context/users-context";

import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from "@/types/auth.types";
import UserDetailsForm from "./user-detail-form-tab/user-detail-form";
import PermissionsTableWrapper from "./permissions-user-tab/permissions-table-wrap";
import RolesTableWrapper from "./roles-tab/roles-table-wrap";

interface UserDetailTabsProps {
    onTabChange?: (tab: string) => void;
}

export default function UserDetailTabs({ onTabChange }: UserDetailTabsProps) {
    const { error } = useUsersActions();
    const { selectedUser } = useUserDetail();
    const { hasPermission } = usePermissions();

    const [tab, setTab] = React.useState("details");

    const userPermissions = React.useMemo(() => ({
        canEdit: hasPermission(CORE_PERMISSIONS.USERS_EDIT),
        canChangeStatus: hasPermission(CORE_PERMISSIONS.USERS_CHANGE_STATUS),
        canUserPermissionsRead: hasPermission(CORE_PERMISSIONS.USER_PERMISSIONS_READ),
        canUserPermissionsCreate: hasPermission(CORE_PERMISSIONS.USER_PERMISSIONS_ASSIGN),
        canUserPermissionsDelete: hasPermission(CORE_PERMISSIONS.USER_PERMISSIONS_DELETE),
        canUserRolesRead: hasPermission(CORE_PERMISSIONS.USER_ROLES_READ),
        canUserRolesCreate: hasPermission(CORE_PERMISSIONS.USER_ROLES_ASSIGN),
        canUserRolesDelete: hasPermission(CORE_PERMISSIONS.USER_ROLES_DELETE),
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
                        {userPermissions.canUserPermissionsRead &&
                            (
                                <TabsTrigger value="permissions">
                                    Permissions

                                </TabsTrigger>
                            )
                        }
                        {userPermissions.canUserRolesRead &&
                            (
                                <TabsTrigger value="roles">
                                    Roles

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
                            <UserDetailsForm error={error} permissions={userPermissions} />
                        </TabsContent>
                        <TabsContent value="permissions">
                            <PermissionsTableWrapper
                                userId={selectedUser!.id}
                                initialPageSize={20}
                                canPermissionsCreate={userPermissions.canUserPermissionsCreate}
                                canPermissionsDelete={userPermissions.canUserPermissionsDelete}
                            />
                        </TabsContent>

                        <TabsContent value="roles">
                            <RolesTableWrapper
                                userId={selectedUser!.id}
                                initialPageSize={20}
                                canUserRolesCreate={userPermissions.canUserRolesCreate}
                                canUserRolesDelete={userPermissions.canUserRolesDelete}
                            />
                        </TabsContent>
                    </div>
                </div>
            </Card>
        </Tabs>
    );
}
