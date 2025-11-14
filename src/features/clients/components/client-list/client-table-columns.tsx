"use client";

import * as React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

import type { Client } from "@/features/clients/types/client.types";
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
import { useClientsActions } from "@/context/clients-context";
import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from '@/types/auth.types';
import { useMemo } from "react";
import { useClientsState } from "@/shared/context/clients-context";

interface ClientActionsProps {
    client: Client;
    onDelete: (id: string) => Promise<void>;
}

function ClientActions({ client, onDelete }: ClientActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { getClientDetails } = useClientsActions();
    const { hasPermission } = usePermissions();
    const canDeleteClients = hasPermission(CORE_PERMISSIONS.CLIENTS_DELETE);
    const handleDetailsClick = async () => {
        try {
            await getClientDetails(client.id);
            router.push(`/en/clients/${client.id}`);
        } catch (error) {
            console.error('Failed to fetch client details:', error);
            router.push(`/en/clients/${client.id}`);
        }
    };

    const handleDeleteClick = async () => {
        setIsDeleting(true);
        try {
            await onDelete(client.id);
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
                        canDeleteClients && (
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
                                    <>Are you sure you want to delete this: <b>{client.name}</b>?</>
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
        </div>
    );
}

// Trong file client-columns.tsx

export function useClientTableColumns(
    handleDeleteRow: (id: string) => Promise<void>,
    originalData?: Client[]
): ColumnDef<Client>[] {

    const { searchTerm } = useClientsState();

    const [justClickedOk, setJustClickedOk] = React.useState(false);

    const handleFilterOk = (value: boolean) => {
        setJustClickedOk(value);
    };

    const getUniqueValues = (field: keyof Client, table: any): string[] => {
        if (!originalData || originalData.length === 0) return [];

        const currentFilter = table.getColumn("status")?.getFilterValue();

        // ✅ Nếu có filter status thì lọc trước
        let filteredData = originalData;
        if (currentFilter !== undefined && currentFilter !== null) {
            filteredData = originalData.filter(client => {
                return String(client.status) === String(currentFilter); // "0" hoặc "1"
            });
        }

        const values = filteredData
            .map(client => {
                const value = client[field];

                if (field === "status") {
                    return value === 1 || value === "1" ? "active" : "inactive";
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
            id: "logo",
            header: "",
            cell: ({ row }) => {
                const logoUrl = row.original.logoUrl;

                const LogoImage = useMemo(() => {
                    return (
                        <Image
                            src={row.original.logoUrl || "/images/ctnp-logo.png"}
                            alt={row.original.logoUrl ? `${row.getValue("name")} logo` : "Default logo"}
                            width={48}
                            height={48}
                            className="rounded-md"
                            unoptimized
                        />
                    );
                }, [logoUrl, row]);
                return <div className="flex items-center justify-center">{LogoImage}</div>;
            },
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
            //             allValues={getUniqueValues('name', table)}
            //             searchTerm={searchTerm}
            //             onFilterOk={handleFilterOk}
            //             justClickedOk={justClickedOk}
            //         >
            //             Client Name
            //         </SortableHeader>
            //     );
            // },
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={true}
                    enableFiltering={true}
                    allValues={getUniqueValues('name', table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Client Name
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="font-medium truncate">{row.getValue("name")}</div>
            ),
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.includes(cellValue);
            }
        },
        {
            accessorKey: "description",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    allValues={getUniqueValues('description', table)}
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
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.some(filter =>
                    cellValue.toLowerCase().includes(filter.toLowerCase())
                );
            }
        },
        {
            accessorKey: "status",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={false}
                    allValues={getUniqueValues('status', table)}
                    enableFiltering={false}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Status
                </SortableHeader>
            ),
            cell: ({ row }) => {
                const statusValue = row.getValue("status");
                const status: StatusVariant = (statusValue === 1 || statusValue === "1") ? 'active' : 'inactive';
                return <StatusBadge status={status} />;
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const statusValue = row.getValue(columnId);
                const displayStatus = (statusValue === 1 || statusValue === "1") ? "active" : "inactive";
                return filterValue.includes(displayStatus);
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <ClientActions client={row.original} onDelete={handleDeleteRow} />
            ),
        }
    ];
}
