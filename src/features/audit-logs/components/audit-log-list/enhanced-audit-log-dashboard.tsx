"use client"

import * as React from "react"

import { useGenericDashboard } from "@/shared/hooks/use-generic-dashboard"
import { ListLayout } from "@/shared/components/custom-ui/list-layout"

import { useAuditLogsActions } from "@/shared/context/audit-logs-context"

import { useAuditLogTable } from "@/features/audit-logs/hooks/use-audit-log-table"
import { useAuditLogTableColumns } from "@/features/audit-logs/components/audit-log-list/audit-log-table-columns"
import { AuditLogActions } from "@/features/audit-logs/components/audit-log-actions"
import { AuditLogEmptyState } from "./audit-log-empty-state"
import { TablePagination } from "@/shared/components/custom-ui/pagination"

import { usePermissions } from "@/context/auth-context"
import { CORE_PERMISSIONS } from '@/types/auth.types'
import { AuditLog } from "@/features/audit-logs/types/audit-log.types"
import { auditLogDashboardConfig } from "../../configs/audit-log-dashboard.config"
import { EnhancedAuditLogTable } from "./enhanced-audit-log-table"
import { FilterActions } from "../filter-action"

interface PaginationState {
        pageIndex: number;
        pageSize: number;
}

export function EnhancedAuditLogDashboard() {
  const { hasPermission } = usePermissions()

//   const clientPermissions = React.useMemo(() => ({
//     canPermissionsRead: hasPermission(CORE_PERMISSIONS.CLIENT_PERMISSIONS_READ),
//     canChangeStatus: hasPermission(CORE_PERMISSIONS.CLIENTS_CHANGE_STATUS),
//     canEdit: hasPermission(CORE_PERMISSIONS.CLIENTS_EDIT),
//     canPermissionsCreate: hasPermission(CORE_PERMISSIONS.CLIENT_PERMISSIONS_CREATE),
//     canPermissionsDelete: hasPermission(CORE_PERMISSIONS.CLIENT_PERMISSIONS_DELETE),
//     canCreate: hasPermission(CORE_PERMISSIONS.CLIENTS_CREATE),
//     canDelete: hasPermission(CORE_PERMISSIONS.CLIENTS_DELETE),
//     canExport: hasPermission(CORE_PERMISSIONS.CLIENTS_EXPORT),
//   }), [hasPermission])

  const auditLogContext = useAuditLogsActions()

  const [originalAuditLogsData, setOriginalAuditLogsData] = React.useState<AuditLog[]>([])

  React.useEffect(() => {
    if (auditLogContext.allAuditLogs && auditLogContext.allAuditLogs.length > 0) {
      setOriginalAuditLogsData(prev => {
        if (prev.length === 0 || Math.abs(prev.length - auditLogContext.allAuditLogs.length) > 10) {
          return [...auditLogContext.allAuditLogs]
        }
        
        const existingIds = new Set(prev.map(c => c.id))
        const newAuditLogs = auditLogContext.allAuditLogs.filter(c => !existingIds.has(c.id))
        
        if (newAuditLogs.length > 0) {
          return [...prev, ...newAuditLogs]
        }
        
        return prev
      })
    }
  }, [auditLogContext.allAuditLogs, originalAuditLogsData])



  const auditLogActions = React.useMemo(() => ({
    entities: auditLogContext.auditLogs,
    isLoading: auditLogContext.isLoading,
    isActionLoading: auditLogContext.isActionLoading,
    error: auditLogContext.error,
    totalCount: auditLogContext.totalCount,
    hasMore: auditLogContext.hasMore,
    searchTerm: auditLogContext.searchTerm,
    isSearching: auditLogContext.isSearching,
    setSearchTerm: auditLogContext.setSearchTerm,
    clearSearch: auditLogContext.clearSearch,
    fetchEntities: auditLogContext.fetchAuditLogs,
    addEntity: auditLogContext.addAuditLog,
    removeEntity: auditLogContext.removeAuditLog,
    removeMultipleEntities: auditLogContext.removeMultipleAuditLogs,
  }), [auditLogContext])
        
  // ✅ Generic dashboard logic
  const dashboardState = useGenericDashboard(auditLogActions, auditLogDashboardConfig)

  const {
    entities: auditLogs,
    isLoading,
    totalCount,
    tableState,
    stablePaginationData,
    setStablePaginationData,
    isAddDialogOpen,
    setAddDialogOpen,
    isMounted,
    isSidebarExpanded,
    form: addAuditLogForm,
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

  const columns = useAuditLogTableColumns(handleDelete, originalAuditLogsData)

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

  const { table, extendedTable } = useAuditLogTable(
    auditLogs,
    handleDelete,
    stablePaginationData,
    tableStateValues,
    tableSetters,
    setRowSelection, 
    setPagination,
    setStablePaginationData,
    originalAuditLogsData 
  )

  const handleDeleteSelectedAuditLogs = React.useCallback(async () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)
    await handleDeleteMultiple(selectedIds)
  }, [handleDeleteMultiple, table, rowSelection]) 

  const emptyStateComponent = React.useMemo(() => {
    if (!isEmpty) return undefined
        
    return (
      <AuditLogEmptyState
        isSearching={auditLogContext.isSearching}
        hasFilters={columnFilters.length > 0}
      />
    )
  }, [isEmpty, auditLogContext.isSearching, columnFilters.length, setAddDialogOpen])

  const tableComponent = React.useMemo(() => (
    <EnhancedAuditLogTable
      table={table}
      columns={columns}
      isLoading={isLoading}
      emptyState={emptyStateComponent}
    />
  ), [table, columns, isLoading, columnVisibility, rowSelection]) 

  const actionsComponent = React.useMemo(() => (
    <AuditLogActions 
      table={table}
      isLoading={!isMounted || isActionLoading}
      isAddAuditLogDialogOpen={isAddDialogOpen}
      setAddAuditLogDialogOpen={setAddDialogOpen}
      searchTerm={searchTerm}
      setSearchTerm={handleSearchTermChange}
      onAddAuditLog={handleAdd}
      onDeleteSelected={handleDeleteSelectedAuditLogs}
      onRefreshData={handleRefreshData}
      isSidebarExpanded={isSidebarExpanded}
      exportData={auditLogs}
    //   permissions={auditLogPermissions}
    />
  ), [
    table,
    isMounted,
    isActionLoading,
    isAddDialogOpen,
    setAddDialogOpen,
    addAuditLogForm,
    searchTerm,
    handleSearchTermChange,
    handleAdd,
    handleDeleteSelectedAuditLogs,
    handleRefreshData,
    isSidebarExpanded,
    auditLogs,
    rowSelection, 
  ])

const filterComponent = React.useMemo(() => (
  <FilterActions table={table}/>
), [table]);

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
      filters={filterComponent}
      tableContent={tableComponent}
      pagination={paginationComponent}
    />
  )
}