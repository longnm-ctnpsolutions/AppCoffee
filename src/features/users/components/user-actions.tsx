
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { 
  Trash2, 
  UserPlus, 
  Columns, 
  FileUp, 
  FileSpreadsheet, 
  FileText, 
  ChevronDown,
  MoreVertical,
  Search,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"

import type { User } from "@/features/users/types/user.types"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/shared/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { UserFilters } from "./user-filters"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"

const addUserFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
})

interface UserActionsProps {
  table: Table<User>
  isAddUserDialogOpen: boolean
  isSidebarExpanded: boolean
  setAddUserDialogOpen: (isOpen: boolean) => void
  addUserForm: UseFormReturn<z.infer<typeof addUserFormSchema>>
  onAddUser: (values: z.infer<typeof addUserFormSchema>) => void
  onDeleteSelected: () => void
}

export function UserActions({ 
  table,
  isAddUserDialogOpen,
  isSidebarExpanded,
  setAddUserDialogOpen,
  addUserForm,
  onAddUser,
  onDeleteSelected,
}: UserActionsProps) {
  
  const AddUserDialog = (
    <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new user to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...addUserForm}>
          <form onSubmit={addUserForm.handleSubmit(onAddUser)} className="space-y-4 py-4">
            <FormField
              control={addUserForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        {...field} 
                        error={!!fieldState.error}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  const DeleteDialog = (
     <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={table.getFilteredSelectedRowModel().rows.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected user(s).
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteSelected} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )

  const ExportMenu = (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10">
            <FileUp className="h-4 w-4" />
            <span>Export</span>
            <ChevronDown className="ml-2 h-4 w-4 hidden lg:inline-flex" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export all data to Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export selected rows to Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export all data to PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export selected rows to PDF</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  const ColumnChooser = (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
            <Columns className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-bold">Column Chooser</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
                return (
                <DropdownMenuItem key={column.id} onSelect={(e) => e.preventDefault()} className="gap-2">
                    <Checkbox
                    id={`col-toggle-${column.id}-lg`}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                    }
                    />
                    <Label htmlFor={`col-toggle-${column.id}-lg`} className="capitalize cursor-pointer w-full">{column.id}</Label>
                </DropdownMenuItem>
                )
            })}
        </DropdownMenuContent>
    </DropdownMenu>
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>UI for admins to manage identities.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="User Search"
                  value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("email")?.setFilterValue(event.target.value)
                  }
                  className="pl-9 w-full md:w-[150px] lg:w-[250px]"
                />
            </div>
            
            <div className="items-center gap-2 hidden sm:flex">
                 <UserFilters table={table} />
            </div>

            <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
            
            <div className={cn("hidden items-center gap-2 xl:flex", isSidebarExpanded && "xl:hidden")}>
                {AddUserDialog}
            </div>

            <div className={cn("hidden items-center gap-2 lg:flex", isSidebarExpanded && "lg:hidden")}>
              {DeleteDialog}
            </div>

            <div className={cn("hidden items-center gap-2 md-lg:flex", isSidebarExpanded && "md-lg:hidden")}>
              {ExportMenu}
              {ColumnChooser}
            </div>

            <div className={cn("flex xl:hidden", isSidebarExpanded && "flex")}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setAddUserDialogOpen(true)} className={cn(isSidebarExpanded ? 'flex' : 'hidden', 'xl:hidden')}>
                           <UserPlus className="mr-2 h-4 w-4" /> Add User
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={cn(isSidebarExpanded ? 'flex' : 'hidden', 'lg:hidden')}>
                          <div onClick={(e) => {
                            e.stopPropagation();
                            const trigger = document.getElementById('delete-dialog-trigger');
                            if(trigger) trigger.click();
                          }}>
                           <AlertDialog>
                              <AlertDialogTrigger asChild id="delete-dialog-trigger">
                                  <div className="flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </div>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the selected user(s).
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={onDeleteSelected} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSub className={cn(isSidebarExpanded ? 'flex' : 'hidden', 'md-lg:hidden')}>
                            <DropdownMenuSubTrigger>
                                <FileUp className="mr-2 h-4 w-4" />
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                <span>Export all data to Excel</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                <span>Export selected rows to Excel</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Export all data to PDF</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Export selected rows to PDF</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub className={cn(isSidebarExpanded ? 'flex' : 'hidden', 'md-lg:hidden')}>
                            <DropdownMenuSubTrigger>
                                <Columns className="mr-2 h-4 w-4" />
                                <span>Column Chooser</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                    <DropdownMenuItem key={column.id} onSelect={(e) => e.preventDefault()} className="gap-2">
                                        <Checkbox
                                        id={`col-toggle-${column.id}-sm`}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                        />
                                        <Label htmlFor={`col-toggle-${column.id}-sm`} className="capitalize cursor-pointer w-full">{column.id}</Label>
                                    </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <div className="flex sm:hidden">
                            <DropdownMenuSeparator />
                            <UserFilters table={table} />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>


          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

    