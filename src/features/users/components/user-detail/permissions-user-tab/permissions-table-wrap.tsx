import React, { useEffect, useState } from "react";
import {
    UserPermissionsProvider,
    useUserPermissionsStateActions,
} from "@/shared/context/users-permissions-context";
import type { Permission } from "@/types/permissions.types";
import type { TableState } from "@/types/odata.types";
import AddPermissionWrapper from "@/features/users/components/user-detail/permissions-user-tab/add-permission-form";
import PermissionsTable from "./permissions-table";
import {
    ClientsProvider,
} from "@/shared/context/clients-context";

interface PermissionsTableWrapperInternalProps {
    userId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    onAddPermission?: (data: { name: string; description: string; }) => void;
    canUserPermissionsCreate?: boolean;
    canUserPermissionsDelete?: boolean;
}

const PermissionsTableWrapperInternal: React.FC<
    PermissionsTableWrapperInternalProps
> = ({ userId,
     onDeletePermission,
    initialPageSize = 20,
    canUserPermissionsCreate,
    canUserPermissionsDelete = true
}) => {
    const {
        userPermissions,
        allPermissions,
        totalCount,
        isLoading,
        isActionLoading,
        error,
        searchTerm,
        setSearchTerm,
        deleteUserPermissionAction,
        fetchUserPermissions,
        addUserPermissionAction,
    } = useUserPermissionsStateActions(userId, 300);

    // Initialize permissions data when component mounts

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
        fetchUserPermissions(userId, tableState);
    }, [userId, fetchUserPermissions]);

        const handleDeletePermission = async (permission: Permission) => {
            try {
                if (!permission.id) {
                    console.error("Permission ID is missing");
                    return;
                }

                console.log("🗑️ Deleting permission:", permission.name);

            await deleteUserPermissionAction(userId, permission.id);
            fetchUserPermissions(userId, tableState);

                console.log("✅ Permission deleted successfully");
            } catch (error) {
                console.error("❌ Failed to delete permission:", error);
            }
        };

    const handleAddPermission = async (permissionIds: string[]) => {
        try {
            await addUserPermissionAction(permissionIds);
            fetchUserPermissions(userId, tableState);
        } catch (error) {
            console.error("❌ Failed to add permission:", error);
        }
    };

    const handleTableStateChange = (userId: string, newTableState: TableState) => {
        setTableState(newTableState);
        fetchUserPermissions(userId, newTableState);
    };

    const [originalPermissionsData, setOriginalPermissionsData] = React.useState<Permission[]>([])
        
    React.useEffect(() => {
        if (!allPermissions || allPermissions.length === 0) return;

        setOriginalPermissionsData(prev => {
            if (prev.length !== allPermissions.length) {
            return [...allPermissions];
            }

            const prevIds = new Set(prev.map(p => p.id));
            const currentIds = new Set(allPermissions.map(p => p.id));
            const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

            if (hasDeleted) {
            return [...allPermissions];
            }

            const newPermissions = allPermissions.filter(p => !prevIds.has(p.id));
            if (newPermissions.length > 0) {
            return [...prev, ...newPermissions];
            }

            return prev;
        });
    }, [allPermissions]);


    return (
        <div className="space-y-4">
            <div className="flex justify-end mt-2">
                <AddPermissionWrapper
                    userId={userId}
                    onAddPermissions={handleAddPermission}
                />
            </div>

            <PermissionsTable
                permissions={userPermissions}
                totalCount={totalCount}
                isLoading={isLoading || isActionLoading}
                onDeletePermission={handleDeletePermission}
                onTableStateChange={handleTableStateChange}
                userId={userId}
                initialPageSize={initialPageSize}
                canUserPermissionsDelete={canUserPermissionsDelete}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                originalData={originalPermissionsData}
            />
        </div>
    );
};

// Main wrapper component that provides the context
interface PermissionsTableWrapperProps {
    userId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    canPermissionsDelete?: boolean;
    canPermissionsCreate?: boolean;
}

const PermissionsTableWrapper: React.FC<PermissionsTableWrapperProps> = (
    props
) => {
    return (
        <UserPermissionsProvider>
            <ClientsProvider>
                <PermissionsTableWrapperInternal {...props} />
            </ClientsProvider>

        </UserPermissionsProvider>
    );
};

export default PermissionsTableWrapper;
