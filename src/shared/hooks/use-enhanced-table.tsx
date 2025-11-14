"use client"

import * as React from "react"
import { RowData, HeaderGroup, Row, Cell } from "@tanstack/react-table"

interface UseEnhancedTableOptions {
  getOrderedColumnIds: () => string[]
  isColumnVisible: (columnId: string) => boolean
}

export function useEnhancedTable<TData extends RowData>({
  getOrderedColumnIds,
  isColumnVisible
}: UseEnhancedTableOptions) {
  const getOrderedHeaders = React.useCallback((headerGroup: HeaderGroup<TData>) => {
    const orderedColumnIds = getOrderedColumnIds()
    return headerGroup.headers
      .filter(header => isColumnVisible(header.id) && header.column.getIsVisible())
      .sort((a, b) => {
        const aIndex = orderedColumnIds.indexOf(a.id)
        const bIndex = orderedColumnIds.indexOf(b.id)
        return aIndex - bIndex
      })
  }, [getOrderedColumnIds, isColumnVisible])

  const getOrderedCells = React.useCallback((row: Row<TData>) => {
    const orderedColumnIds = getOrderedColumnIds()
    return row.getVisibleCells()
      .filter((cell: Cell<TData, unknown>) => isColumnVisible(cell.column.id) && cell.column.getIsVisible())
      .sort((a, b) => {
        const aIndex = orderedColumnIds.indexOf(a.column.id)
        const bIndex = orderedColumnIds.indexOf(b.column.id)
        return aIndex - bIndex
      })
  }, [getOrderedColumnIds, isColumnVisible])

  return {
    getOrderedHeaders,
    getOrderedCells
  }
}