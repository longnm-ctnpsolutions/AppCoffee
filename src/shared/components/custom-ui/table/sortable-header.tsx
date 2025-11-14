"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

interface SortableHeaderProps<T> {
  column: Column<T, unknown>
  table?: any
  children: React.ReactNode
  className?: string
  enableSorting?: boolean
  enableFiltering?: boolean
  /**
   * Optional: nếu có, dùng danh sách này làm nguồn giá trị (cached, không thay đổi khi sort/filter)
   */
  allValues?: string[]
  searchTerm?: string,
  onFilterOk?: (value: boolean) => void;
  justClickedOk?: boolean
}

export function SortableHeader<T>({
  column,
  table,
  children,
  className = "h-auto p-0 font-semibold justify-start",
  enableSorting = false,
  enableFiltering = false,
  allValues,
  searchTerm,
  onFilterOk,
  justClickedOk
}: SortableHeaderProps<T>) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    (Array.isArray(column.getFilterValue()) ? column.getFilterValue() as string[] :
      column.getFilterValue() ? [String(column.getFilterValue())] : []) || []
  )
  const [isOpen, setIsOpen] = React.useState(false)

  const [filteredValues, setFilteredValues] = React.useState<string[]>([]);

  const [cachedValues, setCachedValues] = React.useState<string[]>(() => {
    if (searchTerm && allValues && allValues.length > 0) {
      const result = Array.from(
        new Set(allValues.map(v => String(v)))
      )
        .filter(Boolean)
        .filter(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort();
      return result;
    }

    if (allValues && allValues.length > 0) {
      return Array.from(new Set(allValues.map(v => String(v))))
        .filter(Boolean)
        .sort();
    }

    return [];
  });

  const [loadingValues, setLoadingValues] = React.useState(false)

  // helper to extract unique values from rows
  const extractFromRows = React.useCallback((rows: any[], colId: string) => {
    if (!rows || rows.length === 0) return [] as string[]
    const vals = rows
      .map((row: any) => {
        const value = row.getValue(colId)
        if (colId === "status") {
          // keep same representation as UI uses earlier
          return value === 1 || value === "1" ? "active" : "inactive"
        }
        else if (colId === "lockoutEnabled") {
          // keep same representation as UI uses earlier
          return value === false || value === "false" ? "active" : "inactive"
        }
        return value
      })
      .filter((v: any) => v !== undefined && v !== null && String(v).trim() !== "")
      .map((v: any) => String(v))
    return Array.from(new Set(vals)).sort()
  }, [])

  React.useEffect(() => {
    if (!searchTerm) return
    if (justClickedOk) return

    const tableInstance = table || (column as any).table
    const preFiltered = tableInstance?.getPreFilteredRowModel?.()
    const rows = preFiltered?.flatRows?.length ? preFiltered.flatRows : preFiltered?.rows || []

    const vals = extractFromRows(rows, column.id)

    if (vals.length > 0) {
      setCachedValues(vals)
    }
  }, [searchTerm])

  React.useEffect(() => {
    // if (enableFiltering) return
    // if (searchTerm) return;
    if (cachedValues.length > 0) return
    if (allValues && allValues.length > 0) return

    const tableInstance = table || (column as any).table
    const preFiltered = tableInstance?.getPreFilteredRowModel?.()
    const rows = preFiltered?.flatRows?.length ? preFiltered.flatRows : preFiltered?.rows || []

    const vals = extractFromRows(rows, column.id)

    if (vals.length > 0) {
      setCachedValues(vals)
    }
  }, [table, column.id, enableFiltering, cachedValues.length, allValues, extractFromRows])

  const handleSortClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const currentSort = column.getIsSorted()
    console.log('Sort clicked, current sort:', currentSort)

    if (currentSort === false || currentSort === undefined) {
      // First click - sort descending để thấy thay đổi rõ ràng
      console.log('Setting to desc (first click)')
      column.toggleSorting(true) // desc first
    } else if (currentSort === "desc") {
      // Second click - sort ascending  
      console.log('Setting to asc')
      column.toggleSorting(false) // asc
    } else {
      // Third click - clear sorting bằng cách set sort về undefined
      console.log('Clearing sort')
      column.toggleSorting(undefined, false) // clear sorting
    }
  }, [column])

  const handleSelectAll = (checked: boolean) => {
    setSelectedValues(checked ? cachedValues : [])
  }

  const handleValueChange = (value: string, checked: boolean) => {
    setSelectedValues(prev => {
      if (checked) {
        return Array.from(new Set([...prev, value]))
      } else {
        return prev.filter(v => v !== value)
      }
    })
  }

  const handleOk = () => {
    if (selectedValues.length === 0 || selectedValues.length === cachedValues.length) {
      column.setFilterValue(undefined)
    } else {
      column.setFilterValue(selectedValues)
    }
    setIsOpen(false)
    if (onFilterOk) onFilterOk(true);
  }

  const handleCancel = () => {
    const cv = column.getFilterValue()
    if (Array.isArray(cv)) setSelectedValues(cv as string[])
    else if (cv !== undefined && cv !== null && String(cv) !== "") setSelectedValues([String(cv)])
    else setSelectedValues([])
    setIsOpen(false)
  }

  const handleClearFilter = () => {
    setSelectedValues([])
    column.setFilterValue(undefined)
    setIsOpen(false)
    // if (onFilterOk) onFilterOk(false);
  }

  const isAllSelected = cachedValues.length > 0 && selectedValues.length === cachedValues.length
  const isFiltered = column.getFilterValue() !== undefined

  // Get current sort state and render appropriate icon
  const currentSort = column.getIsSorted()
  const getSortIcon = () => {
    if (currentSort === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />
    } else if (currentSort === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4" />
    } else {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center">
      {enableSorting ? (
        <Button
          variant="ghost"
          onClick={handleSortClick}
          className={className}
          type="button"
        >
          {children}
          {getSortIcon()}
        </Button>
      ) : (
        <div className="py-2 font-semibold">{children}</div>
      )}

      {enableFiltering && (
        <div className={enableSorting ? "ml-2" : "ml-1"}>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${isFiltered ? "text-blue-600" : ""}`}
                title={`Filter ${column.id} (${cachedValues.length} unique values)`}
                type="button"
              >
                <ListFilter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="min-w-60 p-0" align="start">
              {loadingValues ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : cachedValues.length > 0 ? (
                <>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 px-2 py-1">
                        <Checkbox
                          id={`select-all-${column.id}`}
                          checked={isAllSelected}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                        <Label htmlFor={`select-all-${column.id}`} className="font-medium">Select All</Label>
                      </div>
                      {isFiltered && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <Separator className="my-2" />
                  </div>

                  <ScrollArea className="h-48">
                    <div className="space-y-1 p-2">
                      {cachedValues.map((value) => {
                        const safeId = `${String(column.id)}-${btoa(unescape(encodeURIComponent(value))).slice(0, 8)}`
                        return (
                          <div key={value} className="flex items-center space-x-2 px-2 py-1">
                            <Checkbox
                              id={safeId}
                              checked={selectedValues.includes(value)}
                              onCheckedChange={(checked) => handleValueChange(value, !!checked)}
                            />
                            <Label htmlFor={safeId} className="font-normal text-sm truncate">
                              {value}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>

                  <Separator className="my-2" />
                  <div className="flex justify-end gap-2 p-2">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleOk}>
                      OK
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No data available for filtering
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}