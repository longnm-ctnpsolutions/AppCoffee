
"use client"

import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { User } from "@/features/users/types/user.types"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface UserPaginationProps {
  table: Table<User>
}

export function UserPagination({ table }: UserPaginationProps) {
  return (
    <div className="flex items-center justify-between p-2 text-sm">
      <div className="flex items-center gap-4 text-muted-foreground">
        {[5, 10, 20].map((pageSize) => (
            <Button
              key={pageSize}
              variant={table.getState().pagination.pageSize === pageSize ? "default" : "ghost"}
              onClick={() => table.setPageSize(pageSize)}
              className={cn(
                "h-8 w-8 p-0",
                 table.getState().pagination.pageSize === pageSize ? "rounded-full" : ""
              )}
            >
              {pageSize}
            </Button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground hidden sm:block">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({table.getFilteredRowModel().rows.length} items)
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              className="h-8 w-8 rounded-full p-0"
            >
              {table.getState().pagination.pageIndex + 1}
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </div>
    </div>
  )
}
