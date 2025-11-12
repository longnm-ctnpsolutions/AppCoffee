"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { Client } from "@/features/clients/types/client.types"
import { useToast } from "@/shared/hooks/use-toast"
import { EnhancedClientTable } from "./enhanced-client-table"
import { ClientActions } from "@/features/clients/components/client-actions"
import { ClientPagination } from "@/features/clients/components/client-pagination"
import { useSidebar } from "@/shared/components/ui/sidebar"
import { ListLayout } from "@/shared/components/custom-ui/list-layout"

import { useClientsActions } from "@/shared/context/clients-context"

const addClientFormSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập tên máy khách." }),
  identifier: z.string().min(1, { message: "Vui lòng nhập định danh máy khách." }),
  description: z.string(),
  homepageurl: z.string(),
  logo: z.any().optional(),
})

export function EnhancedClientDashboard() {
  const { toast } = useToast()
  const { state: sidebarState } = useSidebar()
  
  const {
    clients,
    isLoading,
    isActionLoading,
    error,
    totalCount,
    hasMore,
    searchTerm,
    isSearching,
    setSearchTerm,
    clearSearch,
    fetchClients,
    addClient,
    removeClient,
    removeMultipleClients,
  } = useClientsActions()

  // ✅ STABLE TABLE STATE
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // ✅ SEPARATED LOADING STATES
  const [isTableDataLoading, setIsTableDataLoading] = React.useState(false)
  const [stablePaginationData, setStablePaginationData] = React.useState({
    totalCount: 0,
    currentPage: 0,
    pageSize: 10
  })

  // ✅ UI STATE - TÁCH RIÊNG KHỎI DATA LOADING
  const [isAddClientDialogOpen, setAddClientDialogOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const isSidebarExpanded = sidebarState === 'expanded'

  // ✅ MOUNT STATE
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // ✅ UPDATE STABLE PAGINATION DATA khi data load xong
  React.useEffect(() => {
    if (!isLoading) {
      setStablePaginationData({
        totalCount,
        currentPage: pagination.pageIndex,
        pageSize: pagination.pageSize
      })
      setIsTableDataLoading(false)
    } else {
      setIsTableDataLoading(true)
    }
  }, [isLoading, totalCount, pagination.pageIndex, pagination.pageSize])

  // ✅ STABLE FORM INSTANCE
  const addClientForm = useForm<z.infer<typeof addClientFormSchema>>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: { 
      name: "",
      identifier: "",
      description: "",
      homepageurl: "",
      logo: null,
    },
  })

  // ✅ MEMOIZED TABLE STATE
  const tableState = React.useMemo(() => ({
    pagination,
    sorting,
    columnFilters,
    globalFilter: searchTerm,
  }), [pagination, sorting, columnFilters, searchTerm])

  // ✅ DATA FETCHING LOGIC
  const hasInitialized = React.useRef(false);
  const lastTableStateRef = React.useRef<string>('');

  React.useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🚀 Dashboard initialized, fetching initial data...');
      fetchClients(tableState);
      return;
    }

    const tableStateForComparison = {
      pagination,
      sorting,
      columnFilters,
    };
    
    const currentStateStr = JSON.stringify(tableStateForComparison);
    
    if (lastTableStateRef.current !== currentStateStr) {
      console.log('📊 Table state changed (non-search):', {
        previous: lastTableStateRef.current,
        current: currentStateStr
      });
      
      lastTableStateRef.current = currentStateStr;
      fetchClients(tableState);
    }
  }, [fetchClients, pagination, sorting, columnFilters, tableState]);

  // ✅ STABLE CRUD HANDLERS
  const handleAddClient = React.useCallback(async (values: z.infer<typeof addClientFormSchema>) => {
    const newClientData = {
      name: values.name,
      clientId: values.identifier,
      description: values.description,
      logo: '/images/new-icon.png'
    }

    const success = await addClient(newClientData)

    if (success) {
      setAddClientDialogOpen(false)
      addClientForm.reset()
      toast({
        title: "Đã thêm máy khách",
        description: `${values.name} đã được thêm vào danh sách máy khách.`,
      })
    }
  }, [addClient, addClientForm, toast])
  
  const handleDeleteRow = React.useCallback(async (clientId: string) => {
    const success = await removeClient(clientId)
    if (success) {
      toast({
        title: "Đã xóa máy khách",
        description: `Máy khách đã được xóa.`,
        variant: "destructive"
      })
    }
  }, [removeClient, toast])

  const handleRefreshData = React.useCallback(() => {
    console.log('🔄 Manual refresh triggered')
    fetchClients(tableState)
  }, [fetchClients, tableState])

  const handleSearchTermChange = React.useCallback((newSearchTerm: string) => {
    console.log('🔍 Search term changing from Dashboard:', newSearchTerm)
    setSearchTerm(newSearchTerm)
  }, [setSearchTerm])

  // ✅ ERROR HANDLING
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Đã xảy ra lỗi",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // ✅ STABLE PAGINATION HANDLERS với immediate UI update
  const handlePaginationChange = React.useCallback((updater: any) => {
    setPagination(prev => {
      const newPagination = typeof updater === 'function' ? updater(prev) : updater
      
      // ✅ CẬP NHẬT NGAY pagination UI (không đợi data load)
      setStablePaginationData(current => ({
        ...current,
        currentPage: newPagination.pageIndex,
        pageSize: newPagination.pageSize
      }))
      
      return newPagination
    })
  }, [])

  // ✅ CREATE TABLE INSTANCE
  const table = useReactTable({
    data: clients,
    columns: EnhancedClientTable.columns(handleDeleteRow),
    pageCount: Math.ceil(stablePaginationData.totalCount / stablePaginationData.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    autoResetPageIndex: false,
    meta: {
      setPageIndex: (pageIndex: number) => {
        setPagination(prev => {
          const newPagination = { ...prev, pageIndex }
          // ✅ CẬP NHẬT NGAY pagination UI
          setStablePaginationData(current => ({
            ...current,
            currentPage: pageIndex
          }))
          return newPagination
        })
      },
      setPageSize: (pageSize: number) => {
        setPagination(prev => {
          const newPagination = { ...prev, pageSize, pageIndex: 0 }
          // ✅ CẬP NHẬT NGAY pagination UI
          setStablePaginationData(current => ({
            ...current,
            pageSize,
            currentPage: 0
          }))
          return newPagination
        })
      },
    },
  })

  // ✅ HANDLE DELETE SELECTED
  const handleDeleteSelected = React.useCallback(async () => {
    const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id)
    const success = await removeMultipleClients(selectedIds)
    
    if (success) {
      setRowSelection({})
      toast({
        title: "Đã xóa máy khách",
        description: `${selectedIds.length} máy khách đã được xóa.`,
        variant: "destructive"
      })
    }
  }, [removeMultipleClients, toast, table])

  // ✅ EXTENDED TABLE with stable pagination data
  const extendedTable = React.useMemo(() => ({
    ...table,
    setPageIndex: (pageIndex: number) => {
      setPagination(prev => {
        const newPagination = { ...prev, pageIndex }
        setStablePaginationData(current => ({
          ...current,
          currentPage: pageIndex
        }))
        return newPagination
      })
    },
    setPageSize: (pageSize: number) => {
      setPagination(prev => {
        const newPagination = { ...prev, pageSize, pageIndex: 0 }
        setStablePaginationData(current => ({
          ...current,
          pageSize,
          currentPage: 0
        }))
        return newPagination
      })
    },
    getFilteredRowModel: () => ({
      ...table.getFilteredRowModel(),
      rows: table.getFilteredRowModel().rows.map((row, index) => ({
        ...row,
        globalIndex: stablePaginationData.currentPage * stablePaginationData.pageSize + index
      }))
    })
  }), [table, stablePaginationData])

  // ✅ COMPUTED VALUES
  const isEmpty = React.useMemo(() => 
    !isLoading && clients.length === 0 && totalCount === 0, 
    [isLoading, clients.length, totalCount]
  )

  // ✅ CLIENT ACTIONS - CHỈ re-render khi UI state thay đổi
  const clientActionsComponent = React.useMemo(() => {
    const shouldShowLoading = !isMounted || isActionLoading;
    
    return (
      <ClientActions 
        table={table}
        isLoading={shouldShowLoading}
        isAddClientDialogOpen={isAddClientDialogOpen}
        setAddClientDialogOpen={setAddClientDialogOpen}
        addClientForm={addClientForm}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermChange}
        onAddClient={handleAddClient}
        onDeleteSelected={handleDeleteSelected}
        onRefreshData={handleRefreshData}
        isSidebarExpanded={isSidebarExpanded}
      />
    );
  }, [
    isMounted,
    isActionLoading,
    table,
    isAddClientDialogOpen,
    addClientForm,
    searchTerm,
    handleSearchTermChange,
    handleAddClient,
    handleDeleteSelected,
    handleRefreshData,
    isSidebarExpanded
  ])

  // ✅ TABLE CONTENT - CHỈ re-render khi table data loading
  const tableContentComponent = React.useMemo(() => (
    <EnhancedClientTable 
      table={table} 
      columns={EnhancedClientTable.columns(handleDeleteRow)}
      isLoading={isTableDataLoading} // ✅ Sử dụng separated loading state
    />
  ), [table, handleDeleteRow, isTableDataLoading])

  // ✅ STABLE PAGINATION - CHỈ dùng stable data, KHÔNG phụ thuộc isLoading
  const paginationComponent = React.useMemo(() => {
    if (isEmpty) return null;
    
    return (
      <ClientPagination 
        table={extendedTable as any}
        totalCount={stablePaginationData.totalCount}
        isTableLoading={isTableDataLoading} // ✅ Pass loading state for visual feedback
      />
    );
  }, [
    isEmpty,
    stablePaginationData.totalCount, // ✅ Stable total count
    stablePaginationData.currentPage, // ✅ Stable current page  
    stablePaginationData.pageSize,   // ✅ Stable page size
    extendedTable.getState,           // ✅ For handlers
    isTableDataLoading               // ✅ For visual feedback only
  ])

  // ✅ EMPTY STATE
  const emptyStateComponent = React.useMemo(() => {
    if (!isEmpty) return undefined;

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M34 40v-4a9.971 9.971 0 01-.712-3.714M14 40v-4a9.971 9.971 0 00-.712-3.714"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Không tìm thấy máy khách nào
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSearching || columnFilters.length > 0 
              ? "Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn để tìm thấy những gì bạn đang tìm kiếm."
              : "Bắt đầu bằng cách thêm máy khách đầu tiên của bạn vào hệ thống."
            }
          </p>
          {(!isSearching && columnFilters.length === 0) && (
            <button 
              onClick={() => setAddClientDialogOpen(true)}
              className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Thêm máy khách đầu tiên của bạn
            </button>
          )}
        </div>
      </div>
    );
  }, [isEmpty, isSearching, columnFilters.length])

  return (
    <ListLayout
      actions={clientActionsComponent}
      tableContent={tableContentComponent}
      pagination={paginationComponent}
      emptyState={emptyStateComponent}
    />
  )
}
