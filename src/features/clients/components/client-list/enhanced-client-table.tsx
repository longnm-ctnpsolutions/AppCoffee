"use client"

import * as React from "react"
import Image from "next/image"
import {
  ColumnDef,
  flexRender,
  Table as TableType,
} from "@tanstack/react-table"
import { MoreVertical, ArrowUpDown, Loader2 } from "lucide-react"

import type { Client } from "@/features/clients/types/client.types"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"
import { 
  useEnhancedResponsiveColumns, 
  createEnhancedColumnConfig,
  type ColumnConfig 
} from "@/features/clients/hooks/use-responsive-columns"
import { useRouter } from 'next/navigation'

// Skeleton component
const TableSkeleton = ({ columns }: { columns: ColumnDef<Client>[] }) => {
  return (
    <>
      {Array(10)
        .fill(0)
        .map((_, rowIndex) => (
          <TableRow key={`skeleton-row-${rowIndex}`}>
            {columns.map((column, colIndex) => (
              <TableCell key={`skeleton-cell-${rowIndex}-${column.id || colIndex}`}>
                <Skeleton className="h-5 w-full rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
    </>
  );
};

interface ClientTableProps {
  table: TableType<Client>;
  columns: ColumnDef<Client>[];
  isLoading: boolean;
}

const CLIENT_TABLE_CONFIG: ColumnConfig[] = [
  createEnhancedColumnConfig('select', 1, 1, 50, 50, { alwaysVisible: true }),
  createEnhancedColumnConfig('logo', 2, 2, 60, 60, { alwaysVisible: true }),
  createEnhancedColumnConfig('name', 3, 3, 180, 120, { flexGrow: 1, contentBased: false, alwaysVisible: true }),
  createEnhancedColumnConfig('description', 4, 4, 300, 200, { flexGrow: 2, contentBased: false, hideAt: 'md' }),
  createEnhancedColumnConfig('status', 5, 5, 120, 80, { contentBased: false, hideAt: 'sm' }),
  createEnhancedColumnConfig('actions', 6, 6, 80, 80, { alwaysVisible: true }),
]

export function EnhancedClientTable({ table, columns, isLoading }: ClientTableProps) {
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
    configs: CLIENT_TABLE_CONFIG,
    containerPadding: 24,
    enableContentBased: true,
    enableOrdering: true,
    debugMode: process.env.NODE_ENV === 'development'
  })

  const debugInfo = getDebugInfo()

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

  const getOrderedHeaders = (headerGroup: any) => {
    const orderedColumnIds = getOrderedColumnIds()
    return headerGroup.headers.sort((a: any, b: any) => {
      const aIndex = orderedColumnIds.indexOf(a.id)
      const bIndex = orderedColumnIds.indexOf(b.id)
      return aIndex - bIndex
    })
  }

  const getOrderedCells = (row: any) => {
    const orderedColumnIds = getOrderedColumnIds()
    return row.getVisibleCells().sort((a: any, b: any) => {
      const aIndex = orderedColumnIds.indexOf(a.column.id)
      const bIndex = orderedColumnIds.indexOf(b.column.id)
      return aIndex - bIndex
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" ref={containerRef}>
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 border-b shrink-0">
          Container: {debugInfo.containerWidth}px | 
          Visible: {debugInfo.visibleColumns.join(', ')} | 
          Used: {debugInfo.totalUsedWidth}px
        </div>
      )}

      {/* ✅ STICKY HEADER - FIXED POSITION */}
      <div className="shrink-0 overflow-hidden bg-background border-b">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {getOrderedHeaders(headerGroup).map((header: any) => {
                  const visibilityClass = getColumnVisibilityClass(header.id)
                  const widthStyle = getColumnWidthStyle(header.id)
                  
                  if (!isColumnVisible(header.id)) return null
                  
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

      {/* ✅ SCROLLABLE BODY với SCROLLAREA - THIN SCROLLBAR */}
      <ScrollArea className="flex-1 w-full">
        <Table>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columns={columns} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {getOrderedCells(row).map((cell: any) => {
                    const visibilityClass = getColumnVisibilityClass(cell.column.id)
                    const widthStyle = getColumnWidthStyle(cell.column.id)
                    
                    if (!isColumnVisible(cell.column.id)) return null
                    
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={debugInfo.visibleColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

// Columns definition remains the same
EnhancedClientTable.columns = (handleDeleteRow: (id: string) => void): ColumnDef<Client>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "logo",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.original.logo ? (
          <Image 
            src={row.original.logo} 
            alt={`${row.getValue("name")} logo`}
            width={32}
            height={32}
            className="rounded-md"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-xs text-gray-400 font-medium">
              {String(row.getValue("name")).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold justify-start"
      >
        Client Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium truncate">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold justify-start"
      >
        Description
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm leading-relaxed truncate">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusValue = row.getValue("status") 
      const status = (statusValue === 1 || statusValue === "1") ? 'active' : 'inactive'
      const isActive = status === 'active'
      
      return (
        <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        )}>
          <span className={cn("mr-1.5 h-2 w-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-400")} />
          <span className="capitalize">{status}</span>
        </div>
      )
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original
      const router = useRouter()
      
      const handleDetailsClick = () => {
        router.push(`/en/clients/${client.id}`)
      }
      
      const handleDeleteClick = async () => {
        await handleDeleteRow(client.id)
      }
      
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleDetailsClick}>
                Details
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()} 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                  >
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this client.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteClick}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]