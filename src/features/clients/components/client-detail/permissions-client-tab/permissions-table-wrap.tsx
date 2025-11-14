import React, { useEffect, useState } from 'react';
import { PermissionsProvider, usePermissionsStateActions } from '@/context/permissions-context';
import PermissionsTable from "@/features/clients/components/client-detail/permissions-client-tab/permissions-table";
import type { Permission } from '@/types/permissions.types';
import type { TableState } from '@/types/odata.types';
import AddPermissionForm from './add-permission-form';

interface PermissionsTableWrapperInternalProps {
    clientId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    onPermissionsCountChange?: (count: number) => void;
    onAddPermission?: (data: { name: string; description: string; }) => void;
    canPermissionsDelete?: boolean;
    canPermissionsCreate?: boolean;
}

// Internal component that uses the context
const PermissionsTableWrapperInternal: React.FC<PermissionsTableWrapperInternalProps> = ({
    clientId,
    onDeletePermission,
    initialPageSize = 10,
    onPermissionsCountChange,
    canPermissionsCreate = false,
    canPermissionsDelete = false
}) => {
    const {
        permissions,
        allPermissions,
        totalCount,
        isLoading,
        isActionLoading,
        error,
        searchTerm,
        setSearchTerm,
        fetchPermissions,
        fetchAllPermissions,
        deletePermissionAction,
        addPermissionAction,
        importPermissionAction,
    } = usePermissionsStateActions(clientId, 300);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    // Update parent component with permissions count
    useEffect(() => {
        if (onPermissionsCountChange) {
            onPermissionsCountChange(totalCount);
        }
    }, [totalCount, onPermissionsCountChange]);

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
        fetchPermissions(clientId, tableState);
        fetchAllPermissions(clientId);
    }, [clientId, fetchPermissions]);

    const handleAddPermission = async (
        permissionName: string,
        description: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await addPermissionAction({ name: permissionName, description });
            return { success: true };
        } catch (error: any) {
            const message =
                error?.message || "Failed to add permission due to unexpected error.";
            return { success: false, error: message };
        }
    };

    const handleImportPermissions = async (
        file: File
    ): Promise<void> => {
        await importPermissionAction(file);
    };

    const handleDeletePermission = async (permission: Permission) => {
        try {
            // ✅ Check permission.id trước khi gọi
            if (!permission.id) {
                console.error('Permission ID is missing');
                return;
            }

            console.log('🗑️ Deleting permission:', permission.name);

            await deletePermissionAction(permission.id); // Giờ TypeScript không complain
            fetchPermissions(clientId, tableState);

            if (onDeletePermission) {
                await onDeletePermission(permission);
            }

            console.log('✅ Permission deleted successfully');

        } catch (error) {
            console.error('❌ Failed to delete permission:', error);
        }
    };

    const handleTableStateChange = (clientId: string, newTableState: TableState) => {
        setTableState(newTableState);
        fetchPermissions(clientId, newTableState);
    };

      const [originalPermissionsData, setOriginalPermissionsData] = React.useState<Permission[]>([])
    
      React.useEffect(() => {
        if ( allPermissions && allPermissions.length > 0) {
          setOriginalPermissionsData(prev => {
            if (prev.length === 0 || Math.abs(prev.length - allPermissions.length) > 10) {
              return [...allPermissions]
            }
            
            const existingIds = new Set(prev.map(c => c.id))
            const newPermissions = allPermissions.filter(c => !existingIds.has(c.id))
            
            if (newPermissions.length > 0) {
              return [...prev, ...newPermissions]
            }
            
            return prev
          })
        }
      }, [allPermissions, originalPermissionsData])

    return (
        <div className="space-y-4">
            {canPermissionsCreate && (
                <AddPermissionForm onAddPermission={handleAddPermission} clientId={clientId} />
            )}
            <PermissionsTable
                permissions={permissions}
                totalCount={totalCount}
                isLoading={isLoading || isActionLoading}
                onDeletePermission={handleDeletePermission}
                onTableStateChange={handleTableStateChange}
                clientId={clientId}
                initialPageSize={initialPageSize}
                canPermissionsDelete={canPermissionsDelete}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onAddPermission={handleImportPermissions}
                originalData={originalPermissionsData}
            />
        </div>
    );
};

// Main wrapper component that provides the context
interface PermissionsTableWrapperProps {
    clientId: string;
    onDeletePermission?: (permission: Permission) => void;
    initialPageSize?: number;
    onPermissionsCountChange?: (count: number) => void;
    canPermissionsDelete?: boolean;
    canPermissionsCreate?: boolean;
}

const PermissionsTableWrapper: React.FC<PermissionsTableWrapperProps> = (props) => {
    return (
        <PermissionsProvider>
            <PermissionsTableWrapperInternal {...props} />
        </PermissionsProvider>
    );
};

export default PermissionsTableWrapper;
