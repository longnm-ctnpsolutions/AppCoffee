import React, { useEffect, useState } from 'react';
import { RolePermissionsProvider, useRolePermissionsStateActions } from '@/shared/context/roles-permissions-context';
import PermissionsTable from "@/features/roles/components/role-detail/permissions-table";
import type { Permission } from '@/types/permissions.types';
import type { TableState } from '@/types/odata.types';
import AddPermissionWrapper from "@/features/roles/components/role-detail/add-permission-form";

interface PermissionsTableWrapperInternalProps {
    roleId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    onAddPermission?: (data: { name: string; description: string; }) => void;
    canRolePermissionsCreate?: boolean;
    canRolePermissionsDelete?: boolean;
}

// Internal component that uses the context
const PermissionsTableWrapperInternal: React.FC<PermissionsTableWrapperInternalProps> = ({
    roleId,
    onDeletePermission,
    initialPageSize = 20,
    canRolePermissionsCreate,
    canRolePermissionsDelete
}) => {

    const {
        rolePermissions,
        allPermissions,
        totalCount,
        isLoading,
        isActionLoading,
        error,
        searchTerm,
        setSearchTerm,
        deleteRolePermissionAction,
        fetchRolePermissions,
        addRolePermissionAction
    } = useRolePermissionsStateActions(roleId, 300);

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

    // Initialize permissions data when component mounts
    useEffect(() => {
        fetchRolePermissions(roleId, tableState);
    }, [roleId, fetchRolePermissions]);

    const handleDeletePermission = async (permission: Permission) => {
        try {
            // ✅ Check permission.id trước khi gọi

            if (!permission.id) {
                console.error('Permission ID is missing');
                return;
            }

            await deleteRolePermissionAction(roleId, permission.id);
            fetchRolePermissions(roleId, tableState);

        } catch (error) {
            console.error('❌ Failed to delete permission:', error);
        }
    };

    const handleAddPermission = async (permissionIds: string[]) => {
        try {
            await addRolePermissionAction(permissionIds);
            fetchRolePermissions(roleId, tableState);

        } catch (error) {
            console.error('❌ Failed to add permission:', error);
        }
    };

    const handleTableStateChange = (roleId: string, newTableState: TableState) => {
        setTableState(newTableState);
        fetchRolePermissions(roleId, newTableState);
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

            {canRolePermissionsCreate &&
                (<div className="flex justify-end mt-2">
                    <AddPermissionWrapper roleId={roleId} onAddPermissions={handleAddPermission} />
                </div>)
            }

            <PermissionsTable
                permissions={rolePermissions}
                totalCount={totalCount}
                isLoading={isLoading || isActionLoading}
                onDeletePermission={handleDeletePermission}
                onTableStateChange={handleTableStateChange}
                roleId={roleId}
                initialPageSize={initialPageSize}
                canRolePermissionsDelete={canRolePermissionsDelete}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                originalData={originalPermissionsData}
            />
        </div>
    );
};

// Main wrapper component that provides the context
interface PermissionsTableWrapperProps {
    roleId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    canRolePermissionsCreate?: boolean;
    canRolePermissionsDelete?: boolean;
}

const PermissionsTableWrapper: React.FC<PermissionsTableWrapperProps> = (props) => {
    return (
        <RolePermissionsProvider>
            <PermissionsTableWrapperInternal {...props} />
        </RolePermissionsProvider>
    );
};

export default PermissionsTableWrapper;
