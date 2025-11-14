
import * as React from "react"
import {
  ColumnDef,
  flexRender,
  Table as TableType,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { TableSkeleton } from "@/shared/components/custom-ui/table/table-skeleton"
import { useEnhancedTable } from "@/shared/hooks/use-enhanced-table"
import { 
  useEnhancedResponsiveColumns,
  type ColumnConfig 
} from "@/hooks/use-responsive-columns"
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types"
import { useExpandableTable } from "@/shared/hooks/use-expandable-table"
import { cn } from "@/shared/lib/utils"
import { ExpandedRowContent } from "./expandable-content"

interface EnhancedExpandableTableProps<T extends Record<string, any>> {
  table: TableType<T>
  columns: ColumnDef<T>[]
  isLoading: boolean
  tableConfig: ColumnConfig[]
  expandableConfig: {
    getRowId: (item: T) => string
    fields: ExpandableFieldConfig[]
  }
  containerPadding?: number
  debugMode?: boolean
  className?: string
  emptyState?: React.ReactNode
}

export function EnhancedExpandableTable<T extends Record<string, any>>({
  table,
  columns,
  isLoading,
  tableConfig,
  expandableConfig,
  containerPadding = 24,
  debugMode = false,
  className,
  emptyState
}: EnhancedExpandableTableProps<T>) {
  const { 
    containerRef, 
    getColumnVisibilityClass, 
    getColumnWidthStyle,
    getOrderedColumnIds,
    isColumnVisible,
    registerContentElement,
    measureContentWidths,
    getDebugInfo 
  } = useEnhancedResponsiveColumns({
    configs: tableConfig,
    containerPadding,
    enableContentBased: true,
    enableOrdering: true,
    debugMode
  })

  const { getOrderedHeaders, getOrderedCells } = useEnhancedTable<T>({
    getOrderedColumnIds,
    isColumnVisible
  })

  const debugInfo = getDebugInfo()

  const {
    expandedRows,
    getExpandableFields,
    shouldShowExpand,
    handleRowClick,
    isRowExpanded
  } = useExpandableTable({
    data: table.getRowModel().rows.map(row => row.original),
    getRowId: expandableConfig.getRowId,
    expandableFields: expandableConfig.fields,
    visibleColumns: debugInfo.visibleColumns
  })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      measureContentWidths()
    }, 100)
    return () => clearTimeout(timer)
  }, [table.getRowModel().rows, measureContentWidths])

  const registerContentRef = React.useCallback((columnId: string, element: HTMLElement | null) => {
    if (element) {
      registerContentElement(columnId, element)
    }
  }, [registerContentElement])

  const tableRows = React.useMemo(() => {
    return table.getRowModel().rows
  }, [
    table.getRowModel().rows, 
    table.getState().rowSelection,
    table.getState().columnVisibility,
    table.getState().sorting,
    table.getState().columnFilters
  ])

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)} ref={containerRef}>
      {/* Debug info in development */}
      {debugMode && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 border-b shrink-0">
          Container: {debugInfo.containerWidth}px | 
          Visible: {debugInfo.visibleColumns.join(', ')} | 
          Used: {debugInfo.totalUsedWidth}px |
          Selected: {Object.keys(table.getState().rowSelection).length} |
          Expanded: {expandedRows.size}
        </div>
      )}

      {/* Sticky Header */}
      <div className="shrink-0 overflow-hidden bg-background border-b">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {getOrderedHeaders(headerGroup).map((header) => {
                  const visibilityClass = getColumnVisibilityClass(header.id)
                  const widthStyle = getColumnWidthStyle(header.id)
                  
                  return (
                    <TableHead 
                      key={header.id}
                      data-column-id={header.id}
                      className={cn("bg-background border-b px-3", visibilityClass)}
                      style={widthStyle}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="flex-1 w-full">
        <Table>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={columns} />
            ) : tableRows?.length ? (
              tableRows.map((row) => {
                const item = row.original
                const expanded = isRowExpanded(item)
                const canExpand = shouldShowExpand(item)
                const expandableFields = getExpandableFields(item)
                
                return (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      onClick={(e) => handleRowClick(e, item)}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        expanded && "bg-muted/20",
                        canExpand && "cursor-pointer"
                      )}
                    >
                      {getOrderedCells(row).map((cell) => {
                        const visibilityClass = getColumnVisibilityClass(cell.column.id)
                        const widthStyle = getColumnWidthStyle(cell.column.id)
                        
                        return (
                          <TableCell 
                            key={cell.id} 
                            ref={(el) => registerContentRef(cell.column.id, el)}
                            className={cn("px-3", visibilityClass)}
                            style={widthStyle}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                    
                    {/* Expanded row */}
                    {expanded && (
                      <TableRow>
                        <TableCell 
                          colSpan={table.getVisibleLeafColumns().length}
                          className="p-0 border-b-0"
                        >
                          <ExpandedRowContent fields={expandableFields} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center"
                >
                   {emptyState || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}