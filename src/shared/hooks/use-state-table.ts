import * as React from "react"
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    type PaginationState,
  } from "@tanstack/react-table"

export function useTableState() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })
  
    return {
      sorting,
      setSorting,
      columnFilters,
      setColumnFilters,
      columnVisibility,
      setColumnVisibility,
      rowSelection,
      setRowSelection,
      pagination,
      setPagination,
    }
  }