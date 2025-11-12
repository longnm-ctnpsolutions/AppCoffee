
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
  getFacetedUniqueValues,
} from "@tanstack/react-table"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import type { User } from "@/features/users/types/user.types"
import { users as defaultUsers } from "@/features/users/lib/data"
import { useToast } from "@/shared/hooks/use-toast"
import { Card, CardContent } from "@/shared/components/ui/card"
import { UserTable } from "./user-table"
import { UserPagination } from "./user-pagination"
import { UserActions } from "./user-actions"
import { useSidebar } from "@/shared/components/ui/sidebar"

const addUserFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
})

export function UserDashboard() {
  const { toast } = useToast()
  const { state: sidebarState } = useSidebar()
  const [users, setUsers] = React.useState<User[]>(defaultUsers)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isAddUserDialogOpen, setAddUserDialogOpen] = React.useState(false)

  const isSidebarExpanded = sidebarState === 'expanded';

  const addUserForm = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: { email: "" },
  })

  const handleAddUser = (values: z.infer<typeof addUserFormSchema>) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: values.email,
      status: "active",
      connection: "Database",
    }
    setUsers((prev) => [newUser, ...prev])
    setAddUserDialogOpen(false)
    addUserForm.reset()
    toast({
      title: "User added",
      description: `${values.email} has been added to the user list.`,
    })
  }
  
  const handleDeleteSelected = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
    setUsers(prev => prev.filter(user => !selectedIds.includes(user.id)));
    setRowSelection({});
    toast({
      title: "Users deleted",
      description: `${selectedIds.length} user(s) have been deleted.`,
      variant: "destructive"
    })
  }
  
  const handleDeleteRow = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
     toast({
      title: "User deleted",
      description: `The user has been deleted.`,
      variant: "destructive"
    })
  }

  const columns: ColumnDef<User>[] = [
    // Column definitions will be passed to UserTable
  ]

  const table = useReactTable({
    data: users,
    columns: UserTable.columns(handleDeleteRow),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
      <UserActions 
        table={table}
        isAddUserDialogOpen={isAddUserDialogOpen}
        setAddUserDialogOpen={setAddUserDialogOpen}
        addUserForm={addUserForm}
        onAddUser={handleAddUser}
        onDeleteSelected={handleDeleteSelected}
        isSidebarExpanded={isSidebarExpanded}
      />
      
      <Card>
        <CardContent className="p-0">
            <UserTable table={table} columns={UserTable.columns(handleDeleteRow)} />
        </CardContent>
      </Card>

      <UserPagination table={table} />
    </div>
  )
}
