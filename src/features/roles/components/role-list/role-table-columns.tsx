"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

import type { Role } from "@/features/roles/types/role.types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SortableHeader } from "@/shared/components/custom-ui/table/sortable-header";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";
import { useRolesActions } from "@/shared/context/roles-context";
import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from '@/types/auth.types';
import { useRolesState } from "@/shared/context/roles-context";

interface RoleActionsProps {
    role: Role;
    onDelete: (id: string) => Promise<void>;
}

function RoleActions({ role, onDelete }: RoleActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { getRoleDetails } = useRolesActions();
    const { hasPermission } = usePermissions();
    const canDeleteRoles = hasPermission(CORE_PERMISSIONS.ROLES_DELETE);

    const handleDetailsClick = async () => {
        try {
            await getRoleDetails(role.id);
            router.push(`/vi/roles/${role.id}`);
        } catch (error) {
            console.error('Failed to fetch role details:', error);
            router.push(`/vi/roles/${role.id}`);
        }
    };

    const handleDeleteClick = async () => {
        setIsDeleting(true);
        try {
            await onDelete(role.id);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
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
                    {
                        canDeleteRoles && (
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
                                    <>Are you sure you want to delete this: <b>{role.name}</b>?</>
                                }
                                actionLabel="Continue"
                                variant="destructive"
                                isLoading={isDeleting}
                                onConfirm={handleDeleteClick}
                            />)
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function useRoleTableColumns(
    handleDeleteRow: (id: string) => Promise<void>,
    originalData?: Role[]
): ColumnDef<Role>[] {

    const { searchTerm } = useRolesState();

    const [justClickedOk, setJustClickedOk] = React.useState(false);

    const handleFilterOk = (value: boolean) => {
        setJustClickedOk(value);
    };

    const getUniqueValues = (field: keyof Role): string[] => {
        if (!originalData || originalData.length === 0) return [];
        const values = originalData
            .map(role => role[field])
            .filter((v): v is string => v !== undefined && v !== null && String(v).trim() !== "")
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
            accessorKey: "name",
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
            //             allValues={getUniqueValues('name')}
            //             searchTerm={searchTerm}
            //             onFilterOk={handleFilterOk}
            //             justClickedOk={justClickedOk}
            //         >
            //             Role Name
            //         </SortableHeader>
            //     );
            // },
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={true}
                    enableFiltering={true}
                    allValues={getUniqueValues('name')}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Role Name
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="font-medium truncate">
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    allValues={getUniqueValues('description')}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Description
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm leading-relaxed truncate">
                    {row.getValue("description")}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <RoleActions role={row.original} onDelete={handleDeleteRow} />
            ),
        }
    ];
}
