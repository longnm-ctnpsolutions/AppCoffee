import React, { useEffect, useState } from "react";
import type { TableState } from "@/types/odata.types";
import { toast } from "@/shared/hooks/use-toast";
import { UserRole } from "@/features/users/types/user.types";
import {
    UserRolesProvider,
    useUserRolesStateActions,
} from "@/shared/context/users-role-context";
import RolesTable from "./roles-table";
import AddRoleWrapper from "./add-role-form";

interface RolesTableWrapperInternalProps {
    userId: string;
    onDeleteRole?: (userRole: UserRole) => void;
    initialPageSize?: number;
    onAddRoleUser?: (data: { name: string; description: string; }) => void;
    canUserRolesCreate?: boolean
    canUserRolesDelete?: boolean
}

// Internal component that uses the context
const RolesTableWrapperInternal: React.FC<RolesTableWrapperInternalProps> = ({
    userId,
    onDeleteRole,
    initialPageSize = 20,
    canUserRolesDelete,
    canUserRolesCreate,
}) => {
    const {
        userRoles,
        totalCount,
        isLoading,
        isActionLoading,
        error,
        allUserRoles,
        deleteUserRoleAction,
        fetchUserRoles,
        addUserRoleAction,
        fetchAllUserRoles,
    } = useUserRolesStateActions(userId, 300);

    const initialTableState: TableState = {
        pagination: {
            pageIndex: 0,
            pageSize: initialPageSize,
        },
        sorting: [{ id: "name", desc: false }],
        columnFilters: [],
        globalFilter: "",
    };

    const [tableState, setTableState] = useState<TableState>(initialTableState);

    useEffect(() => {
        fetchUserRoles(userId, tableState);
    }, [userId, fetchUserRoles]);

    const [originalUserRolesData, setOriginalUserRolesData] = React.useState<UserRole[]>([])
            
    React.useEffect(() => {
        if (!allUserRoles || allUserRoles.length === 0) return;

        setOriginalUserRolesData(prev => {
            if (prev.length !== allUserRoles.length) {
            return [...allUserRoles];
            }

            const prevIds = new Set(prev.map(p => p.id));
            const currentIds = new Set(allUserRoles.map(p => p.id));
            const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

            if (hasDeleted) {
            return [...allUserRoles];
            }

            const newUserRoles = allUserRoles.filter(p => !prevIds.has(p.id));
            if (newUserRoles.length > 0) {
            return [...prev, ...newUserRoles];
            }

            return prev;
        });
    }, [allUserRoles]);

    const handleDeleteRole = async (userRole: UserRole) => {
        try {
            // ✅ Check permission.id trước khi gọi
            if (!userRole.id) {
                console.error("Permission ID is missing");
                return;
            }

            await deleteUserRoleAction(userRole.id);
            fetchUserRoles(userId, tableState);

            console.log("✅ User deleted successfully");
        } catch (error) {
            console.error("❌ Failed to delete user:", error);
        }
    };

    const handleAddRole = async (roleIds: string[]) => {
        try {
            const isAddUserRole = await addUserRoleAction(roleIds);
            fetchUserRoles(userId, tableState);

            if (!isAddUserRole) {
                toast({
                    title: "Add role failed",
                    description: "Role already in user",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Role added successfully!",
            });
        } catch (error) {
            console.error("❌ Failed to add role:", error);
            toast({
                title: "Error",
                description: "Unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const handleTableStateChange = (userId: string, newTableState: TableState) => {
        setTableState(newTableState);
        fetchUserRoles(userId, newTableState);
    };

    // Show error state
    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error loading users: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {canUserRolesCreate && (
                <div className="flex justify-end mt-2">
                    <AddRoleWrapper userId={userId} onAddRole={handleAddRole} />
                </div>
            )}
            <RolesTable
                userRoles={userRoles}
                totalCount={totalCount}
                isLoading={isLoading || isActionLoading}
                onDeleteRole={handleDeleteRole}
                onTableStateChange={handleTableStateChange}
                userId={userId}
                initialPageSize={initialPageSize}
                canUserRolesDelete={canUserRolesDelete}
                originalData={originalUserRolesData}
            />
        </div>
    );
};

// Main wrapper component that provides the context
interface UsersTableWrapperProps {
    userId: string;
    onDeleteRole?: (roleUser: UserRole) => void;
    initialPageSize?: number;
    canUserRolesCreate?: boolean;
    canUserRolesDelete?: boolean;
}

const RolesTableWrapper: React.FC<UsersTableWrapperProps> = (props) => {
    return (
        <UserRolesProvider>
            <RolesTableWrapperInternal {...props} />
        </UserRolesProvider>
    );
};

export default RolesTableWrapper;
