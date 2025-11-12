
"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  Table as TableType,
  Column
} from "@tanstack/react-table"
import { MoreVertical, ArrowUpDown, Filter } from "lucide-react"

import type { User } from "@/features/users/types/user.types"
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
import { cn } from "@/shared/lib/utils"
import { TableFilterDropdown } from "@/shared/components/custom-ui/table-filter-dropdown"

interface UserTableProps {
  table: TableType<User>;
  columns: ColumnDef<User>[];
}

export function UserTable({ table, columns }: UserTableProps) {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={cn({
                    'hidden md:table-cell': header.id === 'connection',
                    'hidden sm:table-cell': header.id === 'status'
                  })}>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cn({
                    'hidden md:table-cell': cell.column.id === 'connection',
                    'hidden sm:table-cell': cell.column.id === 'status'
                  })}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

UserTable.columns = (handleDeleteRow: (id: string) => void): ColumnDef<User>[] => [
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 h-auto"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <TableFilterDropdown column={column} />
        </div>
      )
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    getFacetedUniqueValues: (column, table) => {
        const map = new Map();
        table.getPreFilteredRowModel().rows.forEach(row => {
            const value = row.getValue(column.id);
            const count = map.get(value) || 0;
            map.set(value, count + 1);
        })
        return map;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status === 'active' || status === 1;
      return (
        <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
          isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        )}>
           <span className={cn("mr-1 h-2 w-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-400")} />
           <span className="capitalize">{isActive ? 'Active' : 'Inactive'}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "connection",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Connection
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("connection")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
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
            <DropdownMenuItem >Details</DropdownMenuItem>
              <DropdownMenuItem>Change Password</DropdownMenuItem>
              <DropdownMenuItem>Deactivate</DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50">Delete</DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this user account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteRow(user.id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
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

    

    