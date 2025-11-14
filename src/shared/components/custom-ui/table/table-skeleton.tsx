"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { TableRow, TableCell } from "@/shared/components/ui/table"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface TableSkeletonProps<T> {
  columns: ColumnDef<T>[]
  rowCount?: number
}

export function TableSkeleton<T>({ columns, rowCount = 10 }: TableSkeletonProps<T>) {
  return (
    <>
      {Array(rowCount)
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
  )
}