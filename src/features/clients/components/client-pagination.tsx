"use client"

import { useMemo, memo } from "react"
import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Client } from "@/features/clients/types/client.types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface ClientPaginationProps {
  table: Table<Client>;
  pageSizeOptions?: number[];
  totalCount?: number;
  isTableLoading?: boolean; // ✅ Nhận loading state nhưng không re-render based on it
}

// ✅ MEMOIZE PAGE SIZE CONTROLS - chỉ re-render khi pageSize hoặc handler thay đổi
const PageSizeControls = memo(({ 
  pageSize, 
  pageSizeOptions, 
  onPageSizeChange 
}: {
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
}) => {
  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      {pageSizeOptions.map((pageSizeOption) => (
        <Button
          key={pageSizeOption}
          variant={pageSize === pageSizeOption ? "default" : "ghost"}
          onClick={() => onPageSizeChange(pageSizeOption)}
          className={cn(
            "h-8 w-8 p-0",
            pageSize === pageSizeOption ? "rounded-full" : ""
          )}
          aria-label={`Show ${pageSizeOption} items per page`}
        >
          {pageSizeOption}
        </Button>
      ))}
    </div>
  )
})
PageSizeControls.displayName = "PageSizeControls"

// ✅ MEMOIZE PAGE INFO - chỉ re-render khi pagination data thay đổi
const PaginationInfo = memo(({ 
  currentPage, 
  totalPages, 
  totalCount 
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) => {
  if (totalCount === 0) {
    return <span className="text-muted-foreground hidden sm:block">No items</span>
  }
  
  return (
    <div className="text-muted-foreground hidden sm:block">
      Page {currentPage + 1} of {totalPages} ({totalCount} items)
    </div>
  )
})
PaginationInfo.displayName = "PaginationInfo"

// ✅ MEMOIZE PAGE NUMBERS - chỉ re-render khi currentPage hoặc totalPages thay đổi
const PageNumbers = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}) => {
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

  return (
    <>
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
            onClick={() => onPageChange(pageIndex)}
            aria-label={`Go to page ${pageIndex + 1}`}
          >
            {pageIndex + 1}
          </Button>
        )
      })}
    </>
  )
})
PageNumbers.displayName = "PageNumbers"

// ✅ MEMOIZE NAVIGATION CONTROLS - chỉ re-render khi navigation state thay đổi
const NavigationControls = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}) => {
  const canPreviousPage = currentPage > 0
  const canNextPage = currentPage < totalPages - 1

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canPreviousPage}
        aria-label="Go to previous page"
        title="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <PageNumbers 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNextPage}
        aria-label="Go to next page"
        title="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  )
})
NavigationControls.displayName = "NavigationControls"

export function ClientPagination({ 
  table, 
  pageSizeOptions = [5, 10, 20],
  totalCount,
  isTableLoading = false // ✅ Nhận loading state
}: ClientPaginationProps) {
  const currentPage = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  
  // ✅ STABLE VALUES - chỉ tính toán khi cần thiết
  const actualTotalCount = totalCount ?? table.getFilteredRowModel().rows.length
  const totalPages = Math.ceil(actualTotalCount / pageSize)

  // ✅ STABLE HANDLERS - useCallback để tránh re-render components con
  const handlePageSizeChange = useMemo(() => (newPageSize: number) => {
    if ('setPageSize' in table && typeof table.setPageSize === 'function') {
      (table as any).setPageSize(newPageSize)
    } else {
      table.setPageSize(newPageSize)
    }
  }, [table])

  const handlePageChange = useMemo(() => (pageIndex: number) => {
    if ('setPageIndex' in table && typeof table.setPageIndex === 'function') {
      (table as any).setPageIndex(pageIndex)
    } else {
      table.setPageIndex(pageIndex)
    }
  }, [table])

  // ✅ EARLY RETURN cho empty state
  if (totalPages === 0) {
    return (
      <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between p-2 text-sm transition-opacity duration-200 ${
      isTableLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
    }`}>
      {/* ✅ PAGE SIZE CONTROLS - chỉ re-render khi pageSize thay đổi */}
      <PageSizeControls 
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* ✅ PAGINATION INFO & CONTROLS - tách riêng để tối ưu re-render */}
      <div className="flex items-center gap-4">
        <PaginationInfo 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={actualTotalCount}
        />

        <div className="flex items-center gap-1">
          <NavigationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}