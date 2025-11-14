"use client"

import * as React from "react"

import { useGenericDashboard } from "@/shared/hooks/use-generic-dashboard"
import { ListLayout } from "@/shared/components/custom-ui/list-layout"

import { useClientsActions } from "@/shared/context/clients-context"

import { useClientTable } from "@/features/clients/hooks/use-client-table"
import { useClientTableColumns } from "@/features/clients/components/client-list/client-table-columns"
import { ClientActions } from "@/features/clients/components/client-actions"
import { ClientEmptyState } from "./client-empty-state"
import { TablePagination } from "@/shared/components/custom-ui/pagination"

import { usePermissions } from "@/context/auth-context"
import { CORE_PERMISSIONS } from '@/types/auth.types'
import { Client } from "@/features/clients/types/client.types"
import { clientDashboardConfig } from "../../config/client-dashboard.config"
import { EnhancedClientTable } from "./enhanced-client-table"
interface PaginationState {
        pageIndex: number;
        pageSize: number;
}

export function EnhancedClientDashboard() {
  const { hasPermission } = usePermissions()

  // Always allow actions for development
  const clientPermissions = React.useMemo(() => ({
    canPermissionsRead: true,
    canChangeStatus: true,
    canEdit: true,
    canPermissionsCreate: true,
    canPermissionsDelete: true,
    canCreate: true,
    canDelete: true,
    canExport: true,
  }), []);

  const clientContext = useClientsActions()

  const [originalClientsData, setOriginalClientsData] = React.useState<Client[]>([])

  React.useEffect(() => {
    const allClients = clientContext.allClients;

    if (allClients.length === 0) {
      clientContext.fetchAllClients();
      return;
    }

    setOriginalClientsData(prev => {
      if (prev.length !== allClients.length) {
        return [...allClients];
      }

      const prevIds = new Set(prev.map(c => c.id));
      const currentIds = new Set(allClients.map(c => c.id));
      const hasDeleted = [...prevIds].some(id => !currentIds.has(id));

      if (hasDeleted) {
        return [...allClients];
      }

      const newClients = allClients.filter(c => !prevIds.has(c.id));
      if (newClients.length > 0) {
        return [...prev, ...newClients];
      }

      return prev;
    });
  }, [clientContext.allClients]);


  const clientActions = React.useMemo(() => ({
    entities: clientContext.clients,
    isLoading: clientContext.isLoading,
    isActionLoading: clientContext.isActionLoading,
    error: clientContext.error,
    totalCount: clientContext.totalCount,
    hasMore: clientContext.hasMore,
    searchTerm: clientContext.searchTerm,
    isSearching: clientContext.isSearching,
    setSearchTerm: clientContext.setSearchTerm,
    clearSearch: clientContext.clearSearch,
    fetchEntities: clientContext.fetchClients,
    addEntity: clientContext.addClient,
    removeEntity: clientContext.removeClient,
    removeMultipleEntities: clientContext.removeMultipleClients,
  }), [clientContext])
        
  // ✅ Generic dashboard logic
  const dashboardState = useGenericDashboard(clientActions, clientDashboardConfig)

  const {
    entities: clients,
    isLoading,
    totalCount,
    tableState,
    stablePaginationData,
    setStablePaginationData,
    isAddDialogOpen,
    setAddDialogOpen,
    isMounted,
    isSidebarExpanded,
    form: addClientForm,
    handleAdd,
    handleDelete,
    handleDeleteMultiple,
    handleRefreshData,
    handleSearchTermChange,
    isEmpty,
    searchTerm,
    isActionLoading,
  } = dashboardState

  const {
    sorting, setSorting,
    columnFilters, setColumnFilters,
    columnVisibility, setColumnVisibility,
    rowSelection, setRowSelection,
    pagination, setPagination,
  } = tableState

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
  const columns = useClientTableColumns(handleDelete, originalClientsData)

  const tableStateValues = React.useMemo(() => ({
    sorting,
    columnFilters, 
    columnVisibility,
    rowSelection,
    pagination
  }), [sorting, columnFilters, columnVisibility, rowSelection, pagination])

  const tableSetters = React.useMemo(() => ({
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection, 
  }), [setSorting, setColumnFilters, setColumnVisibility, setRowSelection])

  const { table, extendedTable } = useClientTable(
    clients,
    handleDelete,
    stablePaginationData,
    tableStateValues,
    tableSetters,
    setRowSelection, 
    setPagination,
    setStablePaginationData,
    originalClientsData 
  )

  const handleDeleteSelectedClients = React.useCallback(async () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)
    await handleDeleteMultiple(selectedIds)
  }, [handleDeleteMultiple, table, rowSelection]) 

  const emptyStateComponent = React.useMemo(() => {
    if (!isEmpty) return undefined
        
    return (
      <ClientEmptyState
        isSearching={clientContext.isSearching}
        hasFilters={columnFilters.length > 0}
        onAddClient={() => setAddDialogOpen(true)}
      />
    )
  }, [isEmpty, clientContext.isSearching, columnFilters.length, setAddDialogOpen])

  const tableComponent = React.useMemo(() => (
    <EnhancedClientTable 
      table={table}
      columns={columns}
      isLoading={isLoading}
      emptyState={emptyStateComponent}
    />
  ), [table, columns, isLoading, columnVisibility, rowSelection, emptyStateComponent]) 

  const actionsComponent = React.useMemo(() => (
    <ClientActions 
      table={table}
      isLoading={!isMounted || isActionLoading}
      isAddClientDialogOpen={isAddDialogOpen}
      setAddClientDialogOpen={setAddDialogOpen}
      searchTerm={searchTerm}
      setSearchTerm={handleSearchTermChange}
      onAddClient={handleAdd}
      onDeleteSelected={handleDeleteSelectedClients}
      onRefreshData={handleRefreshData}
      isSidebarExpanded={isSidebarExpanded}
      exportData={clients}
      permissions={clientPermissions}
    />
  ), [
    table,
    isMounted,
    isActionLoading,
    isAddDialogOpen,
    setAddDialogOpen,
    addClientForm,
    searchTerm,
    handleSearchTermChange,
    handleAdd,
    handleDeleteSelectedClients,
    handleRefreshData,
    isSidebarExpanded,
    clients,
    rowSelection,
    clientPermissions
  ])

  const paginationComponent = React.useMemo(() => {
    if (isEmpty) return null
        
    return (
      <TablePagination 
        table={extendedTable as any}
        totalCount={stablePaginationData.totalCount}
        isTableLoading={isLoading}
      />
    )
  }, [isEmpty, extendedTable, stablePaginationData.totalCount, isLoading])

  return (
    <ListLayout
      actions={actionsComponent}
      tableContent={tableComponent}
      pagination={paginationComponent}
    />
  )
}
