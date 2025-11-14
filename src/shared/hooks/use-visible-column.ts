import { useState, useCallback, useEffect, useMemo } from 'react'
import { Table, VisibilityState } from '@tanstack/react-table'

interface UseColumnVisibilityOptions {
  /**
   * Unique key for storing visibility state (e.g., 'clients-table', 'users-table')
   */
  storageKey: string
  
  /**
   * Default visibility state for columns
   */
  defaultVisibility?: VisibilityState
  
  /**
   * Whether to persist state in sessionStorage (default: true)
   */
  enablePersistence?: boolean
  
  /**
   * Columns that should always be visible and cannot be hidden
   */
  lockedColumns?: string[]
}

interface UseColumnVisibilityReturn<T> {
  /**
   * Current visibility state
   */
  columnVisibility: VisibilityState
  
  /**
   * Set visibility state
   */
  setColumnVisibility: (state: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void
  
  /**
   * Toggle visibility of a specific column
   */
  toggleColumn: (columnId: string) => void
  
  /**
   * Show all columns
   */
  showAllColumns: (table: Table<T>) => void
  
  /**
   * Hide all columns (except locked ones)
   */
  hideAllColumns: (table: Table<T>) => void
  
  /**
   * Reset to default visibility
   */
  resetToDefault: () => void
  
  /**
   * Get visible columns count
   */
  visibleColumnsCount: number
  
  /**
   * Get hidden columns count
   */
  hiddenColumnsCount: number
  
  /**
   * Check if a column is visible
   */
  isColumnVisible: (columnId: string) => boolean
  
  /**
   * Get column visibility items for UI rendering
   */
  getColumnVisibilityItems: (table: Table<T>) => Array<{
    id: string
    label: string
    isVisible: boolean
    isLocked: boolean
    toggle: () => void
  }>
}

/**
 * Custom hook for managing table column visibility with persistence
 */
export function useColumnVisibility<T = any>({
  storageKey,
  defaultVisibility = {},
  enablePersistence = true,
  lockedColumns = []
}: UseColumnVisibilityOptions): UseColumnVisibilityReturn<T> {
  
  // Load initial state from storage or use default
  const getInitialState = useCallback((): VisibilityState => {
    if (!enablePersistence) return defaultVisibility
    
    try {
      const saved = sessionStorage.getItem(`column-visibility-${storageKey}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Merge with default to handle new columns
        return { ...defaultVisibility, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load column visibility from storage:', error)
    }
    
    return defaultVisibility
  }, [storageKey, defaultVisibility, enablePersistence])
  
  const [columnVisibility, setColumnVisibilityState] = useState<VisibilityState>(getInitialState)
  
  // Save to storage whenever visibility changes
  useEffect(() => {
    if (!enablePersistence) return
    
    try {
      sessionStorage.setItem(
        `column-visibility-${storageKey}`, 
        JSON.stringify(columnVisibility)
      )
    } catch (error) {
      console.warn('Failed to save column visibility to storage:', error)
    }
  }, [columnVisibility, storageKey, enablePersistence])
  
  // Wrapper for setColumnVisibility with locked columns protection
  const setColumnVisibility = useCallback((
    state: VisibilityState | ((prev: VisibilityState) => VisibilityState)
  ) => {
    setColumnVisibilityState(prevState => {
      const newState = typeof state === 'function' ? state(prevState) : state
      
      // Ensure locked columns are always visible
      const protectedState = { ...newState }
      lockedColumns.forEach(columnId => {
        protectedState[columnId] = true
      })
      
      return protectedState
    })
  }, [lockedColumns])
  
  // Toggle specific column
  const toggleColumn = useCallback((columnId: string) => {
    if (lockedColumns.includes(columnId)) {
      console.warn(`Cannot toggle column "${columnId}" because it is locked`)
      return
    }
    
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }, [lockedColumns, setColumnVisibility])
  
  // Show all columns
  const showAllColumns = useCallback((table: Table<T>) => {
    const newVisibility: VisibilityState = {}
    
    table.getAllColumns()
      .filter(column => column.getCanHide())
      .forEach(column => {
        newVisibility[column.id] = true
      })
    
    setColumnVisibility(newVisibility)
  }, [setColumnVisibility])
  
  // Hide all columns (except locked ones)
  const hideAllColumns = useCallback((table: Table<T>) => {
    const newVisibility: VisibilityState = {}
    
    table.getAllColumns()
      .filter(column => column.getCanHide())
      .forEach(column => {
        newVisibility[column.id] = lockedColumns.includes(column.id)
      })
    
    setColumnVisibility(newVisibility)
  }, [lockedColumns, setColumnVisibility])
  
  // Reset to default
  const resetToDefault = useCallback(() => {
    setColumnVisibility(defaultVisibility)
  }, [defaultVisibility, setColumnVisibility])
  
  // Check if column is visible
  const isColumnVisible = useCallback((columnId: string): boolean => {
    return columnVisibility[columnId] !== false
  }, [columnVisibility])
  
  // Computed values
  const { visibleColumnsCount, hiddenColumnsCount } = useMemo(() => {
    const entries = Object.entries(columnVisibility)
    const visible = entries.filter(([_, isVisible]) => isVisible !== false).length
    const hidden = entries.filter(([_, isVisible]) => isVisible === false).length
    
    return {
      visibleColumnsCount: visible,
      hiddenColumnsCount: hidden
    }
  }, [columnVisibility])
  
  // Get column visibility items for UI
  const getColumnVisibilityItems = useCallback((table: Table<T>) => {
    return table
      .getAllColumns()
      .filter(column => column.getCanHide())
      .map(column => ({
        id: column.id,
        label: column.columnDef.header?.toString() || column.id,
        isVisible: column.getIsVisible(),
        isLocked: lockedColumns.includes(column.id),
        toggle: () => toggleColumn(column.id)
      }))
  }, [lockedColumns, toggleColumn])
  
  return {
    columnVisibility,
    setColumnVisibility,
    toggleColumn,
    showAllColumns,
    hideAllColumns,
    resetToDefault,
    visibleColumnsCount,
    hiddenColumnsCount,
    isColumnVisible,
    getColumnVisibilityItems
  }
}