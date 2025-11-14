
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import type { User } from "@/features/users/types/user.types"
import { users as defaultUsers } from "@/features/users/lib/data"
import { useToast } from "@/shared/hooks/use-toast"
import { Card, CardContent } from "@/shared/components/ui/card"
import { UserTable } from "./user-table"
import { UserPagination } from "./user-pagination"

export function UserDashboard() {
  const { toast } = useToast()
  const [users, setUsers] = React.useState<User[]>(defaultUsers)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  
  const handleDeleteRow = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
     toast({
      title: "User deleted",
      description: `The user has been deleted.`,
      variant: "destructive"
    })
  }

  const table = useReactTable({
    data: users,
    columns: UserTable.columns(handleDeleteRow),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  React.useEffect(() => {
    if (table.getState().columnFilters.length > 0) {
      table.setPageIndex(0);
    }
  }, [table, columnFilters]);


  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-0">
            <UserTable table={table} columns={UserTable.columns(handleDeleteRow)} />
        </CardContent>
      </Card>

      <UserPagination table={table} />
    </div>
  )
}
