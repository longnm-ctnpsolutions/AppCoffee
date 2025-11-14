import React, { useEffect, useState } from 'react';
import { RoleUsersProvider, useRoleUsersStateActions } from '@/shared/context/roles-user-context';
import UsersTable from "@/features/roles/components/role-detail/users-table";
import type { Role, RoleUser } from '@/features/roles/types/role.types';
import type { TableState } from '@/types/odata.types';
import AddUserWrapper from "@/features/roles/components/role-detail/add-user-form";
import { toast } from "@/shared/hooks/use-toast";

interface UsersTableWrapperInternalProps {
    roleId: string;
    onDeleteUser?: (roleUser: RoleUser) => void;
    initialPageSize?: number;
    onAddRoleUser?: (data: { name: string; description: string; }) => void;
    canRoleUsersCreate?: boolean,
    canRoleUsersDelete?: boolean;
}

// Internal component that uses the context
const UsersTableWrapperInternal: React.FC<UsersTableWrapperInternalProps> = ({
    roleId,
    onDeleteUser,
    initialPageSize = 20,
    canRoleUsersCreate,
    canRoleUsersDelete
}) => {
    const {
        roleUsers,
        totalCount,
        isLoading,
        isActionLoading,
        error,
        allRoleUsers,
        deleteRoleUserAction,
        fetchRoleUsers,
        addRoleUserAction
    } = useRoleUsersStateActions(roleId, 300);

    const initialTableState: TableState = {
        pagination: {
            pageIndex: 0,
            pageSize: initialPageSize,
        },
        sorting: [{ id: "email", desc: false }],
        columnFilters: [],
        globalFilter: "",
    };

    const [tableState, setTableState] = useState<TableState>(initialTableState);

    useEffect(() => {
        fetchRoleUsers(roleId, tableState);
    }, [roleId, fetchRoleUsers]);

    const [originalRoleUsersData, setOriginalRoleUsersData] = React.useState<RoleUser[]>([])

    React.useEffect(() => {
        if (!allRoleUsers || allRoleUsers.length === 0) return;

        setOriginalRoleUsersData(prev => {
            if (prev.length !== allRoleUsers.length) {
                return [...allRoleUsers];
            }

            const prevIds = new Set(prev.map(p => p.id));
            const currentIds = new Set(allRoleUsers.map(p => p.id));
            const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

            if (hasDeleted) {
                return [...allRoleUsers];
            }

            const newRoleUsers = allRoleUsers.filter(p => !prevIds.has(p.id));
            if (newRoleUsers.length > 0) {
                return [...prev, ...newRoleUsers];
            }

            return prev;
        });
    }, [allRoleUsers]);

    const handleDeleteUser = async (roleUser: RoleUser) => {
        try {
            // ✅ Check permission.id trước khi gọi
            if (!roleUser.id) {
                return;
            }

            await deleteRoleUserAction(roleUser.id);
            fetchRoleUsers(roleId, tableState);

        } catch (error) {
            console.error('❌ Failed to delete user:', error);
        }
    };

    const handleAddUser = async (userIds: string[]) => {
        try {
            const isAddRoleUser = await addRoleUserAction(userIds);
            fetchRoleUsers(roleId, tableState);

            if (!isAddRoleUser) {
                toast({
                    title: "Add user failed",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "User added successfully!",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    const handleTableStateChange = (roleId: string, newTableState: TableState) => {
        setTableState(newTableState);
        fetchRoleUsers(roleId, newTableState);
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
            {canRoleUsersCreate &&
                (
                    <div className="flex justify-end mt-2">
                        <AddUserWrapper roleId={roleId} onAddUser={handleAddUser} />
                    </div>
                )
            }

            <UsersTable
                roleUsers={roleUsers}
                totalCount={totalCount}
                isLoading={isLoading || isActionLoading}
                onDeleteUser={handleDeleteUser}
                onTableStateChange={handleTableStateChange}
                roleId={roleId}
                initialPageSize={initialPageSize}
                canRoleUsersDelete={canRoleUsersDelete}
                originalData={originalRoleUsersData}
            />
        </div>
    );
};

// Main wrapper component that provides the context
interface UsersTableWrapperProps {
    roleId: string;
    onDeleteUser?: (roleUser: RoleUser) => void;
    initialPageSize?: number;
    canRoleUsersCreate?: boolean;
    canRoleUsersDelete?: boolean;
}

const UsersTableWrapper: React.FC<UsersTableWrapperProps> = (props) => {
    return (
        <RoleUsersProvider>
            <UsersTableWrapperInternal {...props} />
        </RoleUsersProvider>
    );
};

export default UsersTableWrapper;
