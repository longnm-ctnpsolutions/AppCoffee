"use client";

import * as React from "react";

import { useGenericDashboard } from "@/shared/hooks/use-generic-dashboard";
import { ListLayout } from "@/shared/components/custom-ui/list-layout";

import { useUsersActions } from "@/shared/context/users-context";

import { EnhancedUserTable } from "./enhanced-user-table";
import { useUserTableColumns } from "@/features/users/components/user-list/user-table-columns";
import { UserEmptyState } from "./user-empty-state";
import { TablePagination } from "@/shared/components/custom-ui/pagination";
import { userDashboardConfig } from "../../config/user-dashboard.config";
import { useUserTable } from "../../hooks/use-client-table";
import { UserActions } from "../user-actions";
import { usePermissions } from "@/shared/context/auth-context";
import { User } from "../../types/user.types";
import { CORE_PERMISSIONS } from '@/types/auth.types'

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

export function EnhancedUserDashboard() {

    const userContext = useUsersActions();
    
    // Always allow all permissions in dev
    const userPermissions = React.useMemo(() => ({
        canCreate: true,
        canDelete: true,
        canExport: true,
    }), []);
    
    const [originalUsersData, setOriginalUsersData] = React.useState<User[]>([])

    React.useEffect(() => {
        const allUsers = userContext.allUsers;

        if (allUsers.length === 0) {
        userContext.fetchAllUsers();
        return;
        }

        setOriginalUsersData(prev => {
        if (prev.length !== allUsers.length) {
            return [...allUsers];
        }

        const prevIds = new Set(prev.map(c => c.id));
        const currentIds = new Set(allUsers.map(c => c.id));
        const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

        if (hasDeleted) {
            return [...allUsers];
        }

        const newUsers = allUsers.filter(c => !prevIds.has(c.id));
        if (newUsers.length > 0) {
            return [...prev, ...newUsers];
        }

        return prev;
        });
    }, [userContext.allUsers]);

    // ✅ Create adapter to match EntityActions interface
    const userActions = React.useMemo(() => ({
        entities: userContext.users,
        isLoading: userContext.isLoading,
        isActionLoading: userContext.isActionLoading,
        error: userContext.error,
        totalCount: userContext.totalCount,
        hasMore: userContext.hasMore,
        searchTerm: userContext.searchTerm,
        isSearching: userContext.isSearching,
        setSearchTerm: userContext.setSearchTerm,
        clearSearch: userContext.clearSearch,
        fetchEntities: userContext.fetchUsers,
        addEntity: userContext.addUser,
        removeEntity: userContext.removeUser,
        removeMultipleEntities: userContext.removeMultipleUsers,
    }), [userContext]);

    // ✅ Generic dashboard logic
    const dashboardState = useGenericDashboard(userActions, userDashboardConfig);

    const {
        entities: users,
        isLoading,
        totalCount,
        tableState,
        stablePaginationData,
        setStablePaginationData,
        isAddDialogOpen,
        setAddDialogOpen,
        isMounted,
        isSidebarExpanded,
        form: addUserForm,
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
    //     () => createUserTableColumns(handleDelete, originalUsersData),
    //     [handleDelete, originalUsersData]
    // )
    React.useEffect(() => {
    if (columnFilters.length > 0) {
        setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }));
    }
    }, [columnFilters, setPagination]);

    React.useEffect(() => {
    if (searchTerm !== undefined && searchTerm !== '') {
        setPagination((prev: PaginationState) => ({ ...prev, pageIndex: 0 }));
    }
    }, [searchTerm, setPagination]);
    const columns = useUserTableColumns(handleDelete, originalUsersData)

    // ✅ Prepare data for useUserTable hook
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
    const { table, extendedTable } = useUserTable(
        users,
        handleDelete,
        stablePaginationData,
        tableStateValues,
        tableSetters,
        setRowSelection, // Make sure this is passed correctly
        setPagination,
        setStablePaginationData,
        originalUsersData
    );

    // ✅ Delete selected handler - add table state dependency
    const handleDeleteSelectedUsers = React.useCallback(async () => {
        const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);
        await handleDeleteMultiple(selectedIds);
    }, [handleDeleteMultiple, table, rowSelection]); // 🔥 FIX: Add rowSelection dependency


    const emptyStateComponent = React.useMemo(() => {
        if (!isEmpty) return undefined;

        return (
            <UserEmptyState
                isSearching={userContext.isSearching}
                hasFilters={columnFilters.length > 0}
                onAddUser={() => setAddDialogOpen(true)}
            />
        );
    }, [isEmpty, userContext.isSearching, columnFilters.length, setAddDialogOpen]);

    const tableComponent = React.useMemo(() => (
        <EnhancedUserTable
            table={table}
            columns={columns}
            isLoading={isLoading}
            emptyState={emptyStateComponent}
        />
    ), [table, columns, isLoading, columnVisibility, rowSelection, emptyStateComponent]); // 🔥 FIX: Add rowSelection dependency

    const actionsComponent = React.useMemo(() => (
        <UserActions
            table={table}
            isLoading={!isMounted || isActionLoading}
            isAddUserDialogOpen={isAddDialogOpen}
            setAddUserDialogOpen={setAddDialogOpen}
            searchTerm={searchTerm}
            setSearchTerm={handleSearchTermChange}
            onAddUser={handleAdd}
            onDeleteSelected={handleDeleteSelectedUsers}
            onRefreshData={handleRefreshData}
            isSidebarExpanded={isSidebarExpanded}
            exportData={users}
            permissions={userPermissions}
        />
    ), [
        table,
        isMounted,
        isActionLoading,
        isAddDialogOpen,
        setAddDialogOpen,
        addUserForm,
        searchTerm,
        handleSearchTermChange,
        handleAdd,
        handleDeleteSelectedUsers,
        handleRefreshData,
        isSidebarExpanded,
        users,
        rowSelection, 
        userPermissions
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
