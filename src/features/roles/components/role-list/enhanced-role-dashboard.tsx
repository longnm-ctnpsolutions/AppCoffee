"use client";

import * as React from "react";

import { useGenericDashboard } from "@/shared/hooks/use-generic-dashboard";
import { ListLayout } from "@/shared/components/custom-ui/list-layout";

import { useRolesActions } from "@/shared/context/roles-context";
import { useRoleTable } from "@/features/roles/hooks/use-role-table";
import { roleDashboardConfig } from "@/features/roles/config/role-dashboard.config";

import { EnhancedRoleTable } from "./enhanced-role-table";
import { useRoleTableColumns } from "@/features/roles/components/role-list/role-table-columns";
import { RoleActions } from "@/features/roles/components/role-actions";
import { RoleEmptyState } from "./role-empty-state";
import { TablePagination } from "@/shared/components/custom-ui/pagination";

import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from '@/types/auth.types';
import { Role } from "../../types/role.types";

export function EnhancedRoleDashboard() {

    const { hasPermission } = usePermissions();

    const RolePermissions = React.useMemo(() => ({
        canRolePermissionsRead: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_READ),
        canRolePermissionsAssign: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_ASSIGN),
        canRolePermissionsDelete: hasPermission(CORE_PERMISSIONS.ROLE_PERMISSIONS_DELETE),
        canRoleUsersRead: hasPermission(CORE_PERMISSIONS.ROLE_USERS_READ),
        canRoleUsersAssign: hasPermission(CORE_PERMISSIONS.ROLE_USERS_ASSIGN),
        canRoleUsersDelete: hasPermission(CORE_PERMISSIONS.ROLE_USERS_DELETE),
        canEdit: hasPermission(CORE_PERMISSIONS.ROLES_EDIT),
        canCreate: hasPermission(CORE_PERMISSIONS.ROLES_CREATE),
        canDelete: hasPermission(CORE_PERMISSIONS.ROLES_DELETE),
        canExport: hasPermission(CORE_PERMISSIONS.ROLES_EXPORT),
    }), [hasPermission]);

    const roleContext = useRolesActions();

    const [originalRolesData, setOriginalRolesData] = React.useState<Role[]>([])

    React.useEffect(() => {
        const allRoles = roleContext.allRoles;

        if (allRoles.length === 0) {
        roleContext.fetchAllRoles();
        return;
        }

        setOriginalRolesData(prev => {
        if (prev.length !== allRoles.length) {
            return [...allRoles];
        }

        const prevIds = new Set(prev.map(c => c.id));
        const currentIds = new Set(allRoles.map(c => c.id));
        const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

        if (hasDeleted) {
            return [...allRoles];
        }

        const newRoles = allRoles.filter(c => !prevIds.has(c.id));
        if (newRoles.length > 0) {
            return [...prev, ...newRoles];
        }

        return prev;
        });
    }, [roleContext.allRoles]);

    const roleActions = React.useMemo(() => ({
        entities: roleContext.roles,
        isLoading: roleContext.isLoading,
        isActionLoading: roleContext.isActionLoading,
        error: roleContext.error,
        totalCount: roleContext.totalCount,
        hasMore: roleContext.hasMore,
        searchTerm: roleContext.searchTerm,
        isSearching: roleContext.isSearching,
        setSearchTerm: roleContext.setSearchTerm,
        clearSearch: roleContext.clearSearch,
        fetchEntities: roleContext.fetchRoles,
        addEntity: roleContext.addRole,
        removeEntity: roleContext.removeRole,
        removeMultipleEntities: roleContext.removeMultipleRoles,
    }), [roleContext]);

    // ✅ Generic dashboard logic
    const dashboardState = useGenericDashboard(roleActions, roleDashboardConfig);

    const {
        entities: roles,
        isLoading,
        totalCount,
        tableState,
        stablePaginationData,
        setStablePaginationData,
        isAddDialogOpen,
        setAddDialogOpen,
        isMounted,
        isSidebarExpanded,
        form: addRoleForm,
        handleAdd,
        handleDelete,
        handleDeleteMultiple,
        handleRefreshData,
        handleSearchTermChange,
        isEmpty,
        searchTerm,
        isActionLoading,
    } = dashboardState;

    const {
        sorting, setSorting,
        columnFilters, setColumnFilters,
        columnVisibility, setColumnVisibility,
        rowSelection, setRowSelection,
        pagination, setPagination,
    } = tableState;

    // const columns = React.useMemo(
    //     () => createRoleTableColumns(handleDelete, originalRolesData),
    //     [handleDelete , originalRolesData]
    // );

    const columns = useRoleTableColumns(handleDelete, originalRolesData)

    const tableStateValues = React.useMemo(() => ({
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection, // 🚨 Make sure this is included
        pagination
    }), [sorting, columnFilters, columnVisibility, rowSelection, pagination]);

    const tableSetters = React.useMemo(() => ({
        setSorting,
        setColumnFilters,
        setColumnVisibility,
        setRowSelection, // 🔥 FIX: Include setRowSelection in tableSetters
    }), [setSorting, setColumnFilters, setColumnVisibility, setRowSelection]);

    // ✅ Create table using hook - pass setRowSelection explicitly
    const { table, extendedTable } = useRoleTable(
        roles,
        handleDelete,
        stablePaginationData,
        tableStateValues,
        tableSetters,
        setRowSelection, // Make sure this is passed correctly
        setPagination,
        setStablePaginationData,
        originalRolesData
    );

    // ✅ Delete selected handler - add table state dependency
    const handleDeleteSelectedRoles = React.useCallback(async () => {
        const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
        await handleDeleteMultiple(selectedIds);
    }, [handleDeleteMultiple, table, rowSelection]); // 🔥 FIX: Add rowSelection dependency

        const emptyStateComponent = React.useMemo(() => {
        if (!isEmpty) return undefined;

        return (
            <RoleEmptyState
                isSearching={roleContext.isSearching}
                hasFilters={columnFilters.length > 0}
                onAddRole={() => setAddDialogOpen(true)}
            />
        );
    }, [isEmpty, roleContext.isSearching, columnFilters.length, setAddDialogOpen]);
    
    const tableComponent = React.useMemo(() => (
        <EnhancedRoleTable
            table={table}
            columns={columns}
            isLoading={isLoading} 
            emptyState= {emptyStateComponent}
        />
    ), [table, columns, isLoading, columnVisibility, rowSelection]); // 🔥 FIX: Add rowSelection dependency

    const actionsComponent = React.useMemo(() => (
        <RoleActions
            table={table}
            isLoading={!isMounted || isActionLoading}
            isAddRoleDialogOpen={isAddDialogOpen}
            setAddRoleDialogOpen={setAddDialogOpen}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
            onAddRole={handleAdd}
            onDeleteSelected={handleDeleteSelectedRoles}
            onRefreshData={handleRefreshData}
            isSidebarExpanded={isSidebarExpanded}
            exportData={roles}
            permissions={RolePermissions}
        />
    ), [
        table,
        isMounted,
        isActionLoading,
        isAddDialogOpen,
        setAddDialogOpen,
        addRoleForm,
        searchTerm,
        handleSearchTermChange,
        handleAdd,
        handleDeleteSelectedRoles,
        handleRefreshData,
        isSidebarExpanded,
        roles,
        rowSelection, // 🔥 FIX: Add rowSelection dependency
    ]);

    const paginationComponent = React.useMemo(() => {
        if (isEmpty) return null;

        return (
            <TablePagination
                table={extendedTable as any}
                totalCount={stablePaginationData.totalCount}
                isTableLoading={isLoading}
            />
        );
    }, [isEmpty, extendedTable, stablePaginationData.totalCount, isLoading]);

    return (
        <ListLayout
            actions={actionsComponent}
            tableContent={tableComponent}
            pagination={paginationComponent}
        />
    );
}
