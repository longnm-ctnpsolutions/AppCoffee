import { useState, useEffect, useRef, useCallback } from 'react'

// Enhanced column configuration interface
export interface ColumnConfig {
  id: string
  priority: number           // Thứ tự ưu tiên (1 = cao nhất)
  order: number             // Thứ tự xuất hiện (1 = đầu tiên)
  minWidth: number          // Min width để hiện cột
  maxWidth?: number         // Max width của cột
  flexGrow?: number         // Flex grow factor
  contentBased?: boolean    // Có sử dụng content-based responsive không
  alwaysVisible?: boolean   // Luôn hiện (dành cho các cột quan trọng)
  hideAt?: 'sm' | 'md' | 'lg' | 'xl' // Ẩn tại breakpoint nào
}

// Helper function để tạo column config
export function createEnhancedColumnConfig(
  id: string,
  priority: number,
  order: number,
  minWidth: number,
  maxWidth?: number,
  options?: {
    flexGrow?: number
    contentBased?: boolean
    alwaysVisible?: boolean
    hideAt?: 'sm' | 'md' | 'lg' | 'xl'
  }
): ColumnConfig {
  return {
    id,
    priority,
    order,
    minWidth,
    maxWidth,
    flexGrow: options?.flexGrow || 0,
    contentBased: options?.contentBased || false,
    alwaysVisible: options?.alwaysVisible || false,
    hideAt: options?.hideAt,
  }
}

// Content measurement utilities
export function measureContentWidth(element: HTMLElement): number {
  if (!element) return 0
  
  // Tạo clone element để đo content
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.position = 'absolute'
  clone.style.visibility = 'hidden'
  clone.style.width = 'auto'
  clone.style.whiteSpace = 'nowrap'
  
  document.body.appendChild(clone)
  const width = clone.offsetWidth
  document.body.removeChild(clone)
  
  return width
}

// Breakpoint constants
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

interface UseEnhancedResponsiveColumnsOptions {
  configs: ColumnConfig[]
  containerPadding?: number
  enableContentBased?: boolean
  enableOrdering?: boolean
  debugMode?: boolean
}

export function useEnhancedResponsiveColumns({
  configs,
  containerPadding = 0,
  enableContentBased = true,
  enableOrdering = true,
  debugMode = false
}: UseEnhancedResponsiveColumnsOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [contentWidths, setContentWidths] = useState<Record<string, number>>({})
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const contentRefs = useRef<Record<string, HTMLElement[]>>({})

  // Measure container width với buffer để tránh scroll ngang
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Trừ padding và thêm buffer nhỏ để tránh scroll ngang
        const availableWidth = rect.width - containerPadding - 2 // 2px buffer
        setContainerWidth(Math.max(0, availableWidth))
      }
    }

    updateContainerWidth()
    
    const resizeObserver = new ResizeObserver(() => {
      // Delay để đảm bảo DOM đã cập nhật
      setTimeout(updateContainerWidth, 10)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Thêm window resize listener để đảm bảo
    window.addEventListener('resize', updateContainerWidth)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateContainerWidth)
    }
  }, [containerPadding])

  // Measure content widths for content-based columns
  const measureContentWidths = useCallback(() => {
    if (!enableContentBased) return

    const newContentWidths: Record<string, number> = {}
    
    configs.forEach(config => {
      if (config.contentBased && contentRefs.current[config.id]) {
        const elements = contentRefs.current[config.id]
        let maxWidth = 0
        
        elements.forEach(element => {
          if (element) {
            const width = measureContentWidth(element)
            maxWidth = Math.max(maxWidth, width)
          }
        })
        
        newContentWidths[config.id] = maxWidth + 20 // Add padding
      }
    })
    
    setContentWidths(newContentWidths)
  }, [configs, enableContentBased])

  // Calculate which columns should be visible - IMPROVED
  useEffect(() => {
    if (containerWidth === 0) return

    // Sort columns by order if ordering is enabled
    let sortedConfigs = [...configs]
    if (enableOrdering) {
      sortedConfigs.sort((a, b) => a.order - b.order)
    }

    // Calculate required widths
    const newColumnWidths: Record<string, number> = {}
    const newVisibleColumns: string[] = []
    let usedWidth = 0

    // First pass: Always visible columns
    sortedConfigs.forEach(config => {
      if (config.alwaysVisible) {
        const width = config.contentBased && contentWidths[config.id] 
          ? Math.max(contentWidths[config.id], config.minWidth)
          : config.minWidth
        
        newColumnWidths[config.id] = width
        newVisibleColumns.push(config.id)
        usedWidth += width
      }
    })

    // Second pass: Priority-based columns với check chặt chẽ hơn
    const remainingConfigs = sortedConfigs.filter(config => !config.alwaysVisible)
    remainingConfigs.sort((a, b) => a.priority - b.priority)

    remainingConfigs.forEach(config => {
      // Check breakpoint hiding
      if (config.hideAt && containerWidth <= BREAKPOINTS[config.hideAt]) {
        return
      }

      const width = config.contentBased && contentWidths[config.id]
        ? Math.max(contentWidths[config.id], config.minWidth)
        : config.minWidth

      // Kiểm tra chặt chẽ hơn để tránh overflow
      if (usedWidth + width <= containerWidth - 1) { // -1 buffer
        newColumnWidths[config.id] = width
        newVisibleColumns.push(config.id)
        usedWidth += width
      }
    })

    // Third pass: Distribute remaining space to flex columns
    const remainingWidth = containerWidth - usedWidth
    if (remainingWidth > 5) { // Chỉ distribute nếu còn đủ space
      const flexColumns = newVisibleColumns.filter(id => {
        const config = configs.find(c => c.id === id)
        return config && config.flexGrow && config.flexGrow > 0
      })

      if (flexColumns.length > 0) {
        const totalFlexGrow = flexColumns.reduce((sum, id) => {
          const config = configs.find(c => c.id === id)
          return sum + (config?.flexGrow || 0)
        }, 0)

        flexColumns.forEach(id => {
          const config = configs.find(c => c.id === id)
          if (config && config.flexGrow) {
            const additionalWidth = ((remainingWidth - 2) * config.flexGrow) / totalFlexGrow // -2 buffer
            const maxWidth = config.maxWidth || Infinity
            newColumnWidths[id] = Math.min(newColumnWidths[id] + additionalWidth, maxWidth)
          }
        })
      }
    }

    // Final validation: Đảm bảo total không vượt container
    const finalTotalWidth = Object.values(newColumnWidths).reduce((sum, width) => sum + width, 0)
    if (finalTotalWidth > containerWidth) {
      // Scale down proportionally nếu vượt
      const scale = (containerWidth - 2) / finalTotalWidth // -2 buffer
      Object.keys(newColumnWidths).forEach(id => {
        newColumnWidths[id] = Math.floor(newColumnWidths[id] * scale)
      })
    }

    setColumnWidths(newColumnWidths)
    setVisibleColumns(newVisibleColumns)

    if (debugMode) {
      const finalTotal = Object.values(newColumnWidths).reduce((sum, width) => sum + width, 0)
      console.log('Enhanced Responsive Columns Debug:', {
        containerWidth,
        usedWidth,
        finalTotalWidth: finalTotal,
        remainingWidth: containerWidth - finalTotal,
        visibleColumns: newVisibleColumns,
        columnWidths: newColumnWidths,
        contentWidths,
        willOverflow: finalTotal > containerWidth
      })
    }
  }, [containerWidth, configs, contentWidths, enableOrdering, debugMode])

  // Register content element for measurement
  const registerContentElement = useCallback((columnId: string, element: HTMLElement | null) => {
    if (!element) return

    if (!contentRefs.current[columnId]) {
      contentRefs.current[columnId] = []
    }
    
    if (!contentRefs.current[columnId].includes(element)) {
      contentRefs.current[columnId].push(element)
    }
  }, [])

  // Get visibility class for a column
  const getColumnVisibilityClass = useCallback((columnId: string) => {
    return visibleColumns.includes(columnId) ? 'table-cell' : 'hidden'
  }, [visibleColumns])

  // Get width style for a column với box-sizing
  const getColumnWidthStyle = useCallback((columnId: string) => {
    const width = columnWidths[columnId]
    if (!width) return {}
    
    return {
      width: `${width}px`,
      minWidth: `${width}px`,
      maxWidth: `${width}px`,
      boxSizing: 'border-box' as const
    }
  }, [columnWidths])

  // Get ordered column IDs
  const getOrderedColumnIds = useCallback(() => {
    if (!enableOrdering) return configs.map(c => c.id)
    
    return [...configs]
      .sort((a, b) => a.order - b.order)
      .map(c => c.id)
  }, [configs, enableOrdering])

  // Check if column is visible
  const isColumnVisible = useCallback((columnId: string) => {
    return visibleColumns.includes(columnId)
  }, [visibleColumns])

  const getDebugInfo = useCallback(() => {
    const totalUsedWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0)
    return {
      containerWidth,
      visibleColumns,
      columnWidths,
      contentWidths,
      totalUsedWidth,
      remainingWidth: containerWidth - totalUsedWidth,
      willOverflow: totalUsedWidth > containerWidth
    }
  }, [containerWidth, visibleColumns, columnWidths, contentWidths])

  return {
    containerRef,
    containerWidth,
    visibleColumns,
    columnWidths,
    contentWidths,
    getColumnVisibilityClass,
    getColumnWidthStyle,
    getOrderedColumnIds,
    isColumnVisible,
    registerContentElement,
    measureContentWidths,
    getDebugInfo
  }
}