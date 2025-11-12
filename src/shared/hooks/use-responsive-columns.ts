// "use client"

// import { useMemo, useEffect, useState, useRef } from "react"

// // Định nghĩa breakpoints
// export const BREAKPOINTS = {
//   xs: 0,    
//   sm: 640,  
//   md: 768,  
//   lg: 1024, 
//   xl: 1280, 
// } as const

// export type Breakpoint = keyof typeof BREAKPOINTS

// // Priority-based column config
// export interface ResponsiveColumnConfig {
//   id: string
//   displayOrder: number
//   priority: number          // 1 = highest priority (luôn hiện), 5 = lowest (ẩn đầu tiên)
//   minWidth: number         // Minimum width required for this column
//   width?: {
//     xs?: string
//     sm?: string  
//     md?: string
//     lg?: string
//     xl?: string
//   }
// }

// // Hook chính với container-based responsive
// export function useResponsiveColumns(columns: ResponsiveColumnConfig[]) {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [containerWidth, setContainerWidth] = useState<number>(0)
//   const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([])

//   // Monitor container width
//   useEffect(() => {
//     const container = containerRef.current
//     if (!container) return

//     const resizeObserver = new ResizeObserver((entries) => {
//       const width = entries[0].contentRect.width
//       setContainerWidth(width)
//     })

//     resizeObserver.observe(container)
    
//     // Initial width
//     setContainerWidth(container.offsetWidth)

//     return () => resizeObserver.disconnect()
//   }, [])

//   // Calculate visible columns based on available width
//   useEffect(() => {
//     if (containerWidth === 0) return

//     // Sort columns by priority (1 = highest priority)
//     const sortedByPriority = [...columns].sort((a, b) => a.priority - b.priority)
    
//     let usedWidth = 0
//     const visible: string[] = []

//     for (const column of sortedByPriority) {
//       const proposedWidth = usedWidth + column.minWidth
      
//       if (proposedWidth <= containerWidth) {
//         visible.push(column.id)
//         usedWidth = proposedWidth
//       } else {
//         // If we can't fit this column, check if it's high priority
//         if (column.priority <= 2) {
//           // Force include high priority columns even if tight
//           visible.push(column.id)
//         }
//         break
//       }
//     }

//     // Ensure we always have at least the most critical columns
//     const criticalColumns = columns
//       .filter(col => col.priority === 1)
//       .map(col => col.id)
    
//     criticalColumns.forEach(id => {
//       if (!visible.includes(id)) {
//         visible.push(id)
//       }
//     })

//     setVisibleColumnIds(visible)
//   }, [containerWidth, columns])
  
//   // Generate visibility classes
//   const getColumnVisibilityClass = useMemo(() => {
//     return (columnId: string) => {
//       const isVisible = visibleColumnIds.includes(columnId)
//       return isVisible ? 'table-cell' : 'hidden'
//     }
//   }, [visibleColumnIds])
  
//   // Generate width styles
//   const getColumnWidthStyle = useMemo(() => {
//     return (columnId: string) => {
//       const column = columns.find(col => col.id === columnId)
//       if (!column?.width) return {}
      
//       // Simple fallback to lg width or auto
//       const width = column.width.lg || column.width.md || column.width.sm || 'auto'
//       return { width }
//     }
//   }, [columns])

//   // Get hidden columns info for debugging
//   const getHiddenColumnsInfo = useMemo(() => {
//     const hiddenColumns = columns
//       .filter(col => !visibleColumnIds.includes(col.id))
//       .sort((a, b) => a.priority - b.priority)

//     return {
//       containerWidth,
//       visibleCount: visibleColumnIds.length,
//       hiddenCount: hiddenColumns.length,
//       hiddenColumns: hiddenColumns.map(col => ({
//         id: col.id,
//         priority: col.priority,
//         minWidth: col.minWidth
//       })),
//       totalColumns: columns.length
//     }
//   }, [columns, visibleColumnIds, containerWidth])
  
//   return {
//     containerRef,
//     containerWidth,
//     visibleColumnIds,
//     getColumnVisibilityClass,
//     getColumnWidthStyle,
//     getHiddenColumnsInfo,
//   }
// }

// // Helper để tạo config với priority
// export function createColumnConfig(
//   id: string, 
//   displayOrder: number,
//   priority: number,
//   minWidth: number,
//   options?: {
//     width?: ResponsiveColumnConfig['width']
//   }
// ): ResponsiveColumnConfig {
//   return {
//     id,
//     displayOrder,
//     priority,
//     minWidth,
//     ...options
//   }
// }

// // Updated CLIENT_TABLE_CONFIG với priority system
// export const CLIENT_TABLE_CONFIG_V2 = [
//   createColumnConfig('select', 1, 4, 50, { // Priority 4 - ẩn sớm
//     width: { md: '50px', lg: '50px' } 
//   }),
//   createColumnConfig('logo', 2, 1, 50, { // Priority 1 - luôn hiện
//     width: { xs: '50px', sm: '50px', md: '50px', lg: '50px' }
//   }),
//   createColumnConfig('name', 3, 1, 120, { // Priority 1 - luôn hiện  
//     width: { xs: '40%', sm: '30%', md: '20%', lg: '18%' }
//   }),
//   createColumnConfig('description', 4, 3, 200, { // Priority 3 - ẩn thứ 2
//     width: { md: '45%', lg: '50%' }
//   }),
//   createColumnConfig('status', 5, 5, 100, { // Priority 5 - ẩn đầu tiên
//     width: { sm: '25%', md: '12%', lg: '10%' }
//   }),
//   createColumnConfig('actions', 6, 2, 80, { // Priority 2 - ẩn muộn
//     width: { xs: '60%', sm: '45%', md: '13%', lg: '12%' }
//   })
// ]


"use client"

import { useMemo, useEffect, useState, useRef } from "react"

// Priority-based column config
export interface ResponsiveColumnConfig {
  id: string
  displayOrder: number
  priority: number          // 1 = highest (luôn hiện), 5 = lowest (ẩn đầu tiên)
  minWidth: number         // Minimum width cần thiết cho cột này (px)
  flexGrow?: number        // Độ co giãn khi có thêm không gian
}

// Hook content-based responsive
export function useResponsiveColumns(columns: ResponsiveColumnConfig[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(1200)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  
  // Theo dõi container width
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateWidth = () => {
      setContainerWidth(container.offsetWidth)
    }

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(container)
    updateWidth()

    return () => resizeObserver.disconnect()
  }, [])

  // Tính toán columns nào hiển thị dựa trên available space
  useEffect(() => {
    if (containerWidth === 0) return

    // Sort by priority (1 = highest priority)
    const sortedByPriority = [...columns].sort((a, b) => a.priority - b.priority)
    
    let totalUsedWidth = 0
    const visible: string[] = []

    // Luôn include các cột priority 1 (critical)
    const criticalColumns = sortedByPriority.filter(col => col.priority === 1)
    criticalColumns.forEach(col => {
      visible.push(col.id)
      totalUsedWidth += col.minWidth
    })

    // Thêm các cột khác theo priority nếu còn chỗ
    const remainingColumns = sortedByPriority.filter(col => col.priority > 1)
    
    for (const column of remainingColumns) {
      const wouldUseWidth = totalUsedWidth + column.minWidth
      
      // Có đủ chỗ thì thêm vào
      if (wouldUseWidth <= containerWidth) {
        visible.push(column.id)
        totalUsedWidth = wouldUseWidth
      }
    }

    setVisibleColumns(visible)
  }, [containerWidth, columns])
  
  // Class để ẩn/hiện column
  const getColumnVisibilityClass = useMemo(() => {
    return (columnId: string) => {
      return visibleColumns.includes(columnId) ? 'table-cell' : 'hidden'
    }
  }, [visibleColumns])
  
  // Style width cho column - tính toán dựa trên space available
  const getColumnWidthStyle = useMemo(() => {
    return (columnId: string) => {
      const column = columns.find(col => col.id === columnId)
      if (!column || !visibleColumns.includes(columnId)) return {}

      // Fixed width columns
      if (!column.flexGrow) {
        return { width: `${column.minWidth}px` }
      }

      // Flexible columns - tính toán space còn lại
      const fixedColumns = columns.filter(col => 
        visibleColumns.includes(col.id) && !col.flexGrow
      )
      const flexColumns = columns.filter(col => 
        visibleColumns.includes(col.id) && col.flexGrow
      )

      const fixedWidth = fixedColumns.reduce((sum, col) => sum + col.minWidth, 0)
      const remainingWidth = containerWidth - fixedWidth
      const totalFlexGrow = flexColumns.reduce((sum, col) => sum + (col.flexGrow || 1), 0)
      
      if (totalFlexGrow > 0) {
        const flexWidth = (remainingWidth * (column.flexGrow || 1)) / totalFlexGrow
        return { width: `${Math.max(flexWidth, column.minWidth)}px` }
      }

      return { width: `${column.minWidth}px` }
    }
  }, [columns, visibleColumns, containerWidth])

  // Debug info
  const getDebugInfo = useMemo(() => {
    const hiddenColumns = columns.filter(col => !visibleColumns.includes(col.id))
    const totalMinWidth = columns
      .filter(col => visibleColumns.includes(col.id))
      .reduce((sum, col) => sum + col.minWidth, 0)

    return {
      containerWidth,
      visibleCount: visibleColumns.length,
      totalColumns: columns.length,
      totalMinWidth,
      remainingSpace: containerWidth - totalMinWidth,
      hiddenColumns: hiddenColumns.map(col => ({ id: col.id, priority: col.priority }))
    }
  }, [columns, visibleColumns, containerWidth])
  
  return {
    containerRef,
    containerWidth,
    visibleColumns,
    getColumnVisibilityClass,
    getColumnWidthStyle,
    getDebugInfo,
  }
}

// Helper để tạo config
export function createColumnConfig(
  id: string, 
  displayOrder: number,
  priority: number,
  minWidth: number,
  flexGrow?: number
): ResponsiveColumnConfig {
  return {
    id,
    displayOrder,
    priority,
    minWidth,
    flexGrow
  }
}