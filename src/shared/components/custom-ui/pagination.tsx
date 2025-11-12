"use client"

import { useMemo } from "react"
import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface TablePaginationProps<T> {
  table: Table<T>
  pageSizeOptions?: number[];
}

export function TablePagination<T>({ table,  pageSizeOptions = [5, 10, 20] }: TablePaginationProps<T>) {
 const currentPage = table.getState().pagination.pageIndex
  const totalPages = table.getPageCount()

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, 3, -1, totalPages - 1)
      } else if (currentPage >= totalPages - 3) {
        pages.push(0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1)
      } else {
        pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1)
      }
    }

    return pages
  }, [currentPage, totalPages])

  if (totalPages === 0) {
    return (
      <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-2 text-sm">
      <div className="flex items-center gap-4 text-muted-foreground">
        {pageSizeOptions.map((pageSize) => (
          <Button
            key={pageSize}
            variant={table.getState().pagination.pageSize === pageSize ? "default" : "ghost"}
            onClick={() => table.setPageSize(pageSize)}
            className={cn(
              "h-8 w-8 p-0",
              table.getState().pagination.pageSize === pageSize ? "rounded-full" : ""
            )}
            aria-label={`Show ${pageSize} items per page`}
          >
            {pageSize}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-muted-foreground hidden sm:block">
          Page {currentPage + 1} of {totalPages} ({table.getFilteredRowModel().rows.length} items)
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageIndex, index) => {
            if (pageIndex === -1) {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              )
            }

            return (
              <Button
                key={pageIndex}
                variant={currentPage === pageIndex ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 p-0",
                  currentPage === pageIndex ? "rounded-full" : ""
                )}
                onClick={() => table.setPageIndex(pageIndex)}
                aria-label={`Go to page ${pageIndex + 1}`}
              >
                {pageIndex + 1}
              </Button>
            )
          })}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
