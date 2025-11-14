"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

import type { User } from "@/features/users/types/user.types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SortableHeader } from "@/shared/components/custom-ui/table/sortable-header";
import { StatusBadge, StatusVariant } from "@/shared/components/custom-ui/table/status-badge";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";
import { useState } from "react";
import ChangePasswordDialog from "../change-password-dialog";
import { updateUser } from "@/shared/api/services/users/users.service";
import { useToast } from "@/shared/hooks/use-toast";
import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from '@/types/auth.types';
import { useUsersActions, useUsersState } from "@/shared/context/users-context";

interface UserActionsProps {
    user: User;
    onDelete: (id: string) => Promise<void>;
}

function UserActions({ user, onDelete }: UserActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { fetchUserById, updateStatus, updatePassword } = useUsersActions();
    const { hasPermission } = usePermissions();
    const canDelete = hasPermission(CORE_PERMISSIONS.USERS_DELETE);
    const [open, setOpen] = useState(false);

    const handleDetailsClick = async () => {
        try {
            await fetchUserById(user.id);
            router.push(`/en/users/${user.id}`);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            router.push(`/en/users/${user.id}`);
        }
    };

    const handleDeleteClick = async () => {
        setIsDeleting(true);
        try {
            await onDelete(user.id);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeactivesClick = async () => {
        try {
            const newStatus = user.lockoutEnabled;
            await updateStatus(user, newStatus);
        } catch (error) {
            console.error('Update failed:', error);

        }
    };

    const handleChangePasswordsClick = async (password: string): Promise<boolean> => {
        return await updatePassword(user.id, password);
    };

    return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                        <span className="sr-only">Open menu</span>
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreVertical className="h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" data-no-expand>
                    <DropdownMenuItem onSelect={handleDetailsClick} data-no-expand>
                        Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleDeactivesClick} data-no-expand>
                        {user.lockoutEnabled ? "Active" : "Deactive"}
                    </DropdownMenuItem>

                    {user.connection === "Database" && (
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setOpen(true);
                            }}
                            data-no-expand
                        >
                            Change Password
                        </DropdownMenuItem>
                    )}

                    {
                        canDelete && (
                            <ConfirmationDialog
                                trigger={
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
                                        disabled={isDeleting}
                                        data-no-expand
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Delete"
                                        )}
                                    </DropdownMenuItem>
                                }
                                title="Confirm"
                                description={
                                    <>Are you sure you want to delete this: <b>{user.email}</b>?</>
                                }
                                actionLabel="Delete"
                                variant="destructive"
                                isLoading={isDeleting}
                                onConfirm={handleDeleteClick}
                            />
                        )
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <ChangePasswordDialog open={open} onOpenChange={setOpen} onChangePassword={handleChangePasswordsClick} />
        </div>
    );
}

export function useUserTableColumns(
    handleDeleteRow: (id: string) => Promise<void>,
    originalData?: User[]
): ColumnDef<User>[] {

    const { searchTerm } = useUsersState();

    const [justClickedOk, setJustClickedOk] = React.useState(false);

    const handleFilterOk = (value: boolean) => {
        setJustClickedOk(value);
    };

    const getUniqueValues = (field: keyof User, table: any): string[] => {
        if (!originalData || originalData.length === 0) return [];

        const currentFilter = table.getColumn("lockoutEnabled")?.getFilterValue();

        // ✅ Nếu có filter status thì lọc trước
        let filteredData = originalData;
        if (currentFilter !== undefined && currentFilter !== null) {
            filteredData = originalData.filter(user => {
                return String(user.lockoutEnabled) === String(currentFilter);
            });
        }

        const values = filteredData
            .map(user => {
                const value = user[field];

                if (field === "lockoutEnabled") {
                    return value === false || value === "false" ? "active" : "inactive";
                }

                return value;
            })
            .filter(
                (v): v is string =>
                    v !== undefined && v !== null && String(v).trim() !== ""
            )
            .map(v => String(v));

        return Array.from(new Set(values)).sort();
    };

    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        console.log('Header checkbox changed:', value);
                        table.toggleAllPageRowsSelected(!!value);
                    }}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        console.log('Row checkbox changed:', row.id, value);
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "id",
            cell: ({ row }) => row.getValue("id"),
            enableHiding: true,
        },
        {
            accessorKey: "email",
            // header: ({ column, table }) => {
            //     React.useEffect(() => {
            //         const sorting = table.getState().sorting;
            //         const alreadySorted = sorting.some((s) => s.id === column.id);
            //         if (!alreadySorted) {
            //             table.setSorting([{ id: column.id, desc: true }]);
            //         }
            //     }, [table, column.id]);

            //     return (
            //         <SortableHeader
            //             column={column}
            //             table={table}
            //             enableSorting={true}
            //             enableFiltering={true}
            //             allValues={getUniqueValues('email', table)}
            //             searchTerm={searchTerm}
            //             onFilterOk={handleFilterOk}
            //             justClickedOk={justClickedOk}
            //         >
            //             Email
            //         </SortableHeader>
            //     );
            // },
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={true}
                    enableFiltering={true}
                    allValues={getUniqueValues('email', table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Email
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="font-medium truncate">
                    {row.getValue("email")}
                </div>
            ),
        },
        {
            accessorKey: "lockoutEnabled",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={false}
                    allValues={getUniqueValues('lockoutEnabled', table)}
                    enableFiltering={false}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Status
                </SortableHeader>
            ),
            cell: ({ row }) => {
                const statusValue = row.getValue("lockoutEnabled");
                const status: StatusVariant = (statusValue === false || statusValue === "false") ? 'active' : 'inactive';
                return <StatusBadge status={status} />;
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const statusValue = row.getValue(columnId);
                const displayStatus = (statusValue === false || statusValue === "false") ? "active" : "inactive";
                return filterValue.includes(displayStatus);
            }
        },
        {
            accessorKey: "connection",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    allValues={getUniqueValues('connection', table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Connection
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm leading-relaxed truncate">
                    {row.getValue("connection")}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <UserActions user={row.original} onDelete={handleDeleteRow} />
            ),
        }
    ];
}
