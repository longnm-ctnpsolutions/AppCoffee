import { useState, useCallback } from 'react'
import { UseExpandableTableConfig } from '@/types/dashboard.types'

export function useExpandableTable<T extends Record<string, any>>({
  data,
  getRowId,
  expandableFields,
  visibleColumns
}: UseExpandableTableConfig<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = useCallback((rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])

  const getExpandableFields = useCallback((item: T) => {
    return expandableFields
      .filter(field => {
        // Always show fields marked as alwaysShow
        if (field.alwaysShow) return item[field.key] != null
        
        // Show fields that are hidden due to responsive behavior
        if (field.hideAt && !visibleColumns.includes(field.key)) {
          return item[field.key] != null
        }
        
        return false
      })
      .map(field => ({
        ...field,
        value: item[field.key]
      }))
  }, [expandableFields, visibleColumns])

  const shouldShowExpand = useCallback((item: T) => {
    return getExpandableFields(item).length > 0
  }, [getExpandableFields])

  const handleRowClick = useCallback((
    event: React.MouseEvent,
    item: T
  ) => {
    // Don't expand if clicking on interactive elements
    const target = event.target as HTMLElement
    const isInteractive = target.closest('button, a, input, select, [role="button"], [data-no-expand]')
    
    if (isInteractive) return
    
    if (shouldShowExpand(item)) {
      toggleRowExpansion(getRowId(item))
    }
  }, [shouldShowExpand, toggleRowExpansion, getRowId])

  const isRowExpanded = useCallback((item: T) => {
    return expandedRows.has(getRowId(item))
  }, [expandedRows, getRowId])

  return {
    expandedRows,
    toggleRowExpansion,
    getExpandableFields,
    shouldShowExpand,
    handleRowClick,
    isRowExpanded
  }
}
