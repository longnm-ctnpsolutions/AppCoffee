"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import { Button } from "@/shared/components/ui/button";
import { SortableHeader } from "@/shared/components/custom-ui/table/sortable-header";
import {
    StatusBadge,
    StatusVariant,
} from "@/shared/components/custom-ui/table/status-badge";

import {
    useAuditLogsActions,
    useAuditLogsState,
} from "@/shared/context/audit-logs-context";
import { AuditLogDetailsDialog } from "@/features/audit-logs/components/audit-log-detail/audit-log-details-dialog";
import { getAuditLogById } from "@/shared/api/services/audit-logs/audit-logs.service";

interface AuditLogActionsProps {
    auditLog: AuditLog;
}

export function AuditLogActions({ auditLog }: AuditLogActionsProps) {
    const [open, setOpen] = React.useState(false);
    const [details, setDetails] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const { fetchAuditLogById } = useAuditLogsActions();

    const handleOpenDetails = async () => {
        setLoading(true);
        try {
            const result = await getAuditLogById(auditLog.id);
            setDetails(result);
            setOpen(true);
        } catch (error) {
            console.error("Failed to fetch audit log:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="text-right">
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={handleOpenDetails}
                    disabled={loading}
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>

            <AuditLogDetailsDialog
                details={details}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}

export function useAuditLogTableColumns(
    handleDeleteRow: (id: string) => Promise<void>,
    originalAuditLogsData?: AuditLog[]
): ColumnDef<AuditLog>[] {
    const { searchTerm } = useAuditLogsState();

    const [justClickedOk, setJustClickedOk] = React.useState(false);

    const handleFilterOk = (value: boolean) => {
        setJustClickedOk(value);
    };

    const getUniqueValues = (field: keyof AuditLog, table: any): string[] => {
        if (!originalAuditLogsData || originalAuditLogsData.length === 0)
            return [];

        const values = originalAuditLogsData
            .map((item) => item[field])
            .filter(
                (v): v is string =>
                    v !== undefined && v !== null && String(v).trim() !== ""
            )
            .map((v) => String(v));

        return Array.from(new Set(values)).sort();
    };

    return [
        {
            accessorKey: "id",
            header: "id",
            cell: ({ row }) => row.getValue("id"),
            enableHiding: true,
        },
        {
            accessorKey: "timestamp",
            header: ({ column, table }) => {
                React.useEffect(() => {
                    if (!column.getIsSorted()) {
                        column.toggleSorting(true);
                    }
                }, [column]);

                return (
                    <SortableHeader
                        column={column}
                        table={table}
                        enableSorting={true}
                        allValues={getUniqueValues("timestamp", table)}
                        searchTerm={searchTerm}
                        onFilterOk={handleFilterOk}
                        justClickedOk={justClickedOk}
                    >
                        Timestamp
                    </SortableHeader>
                );
            },
            cell: ({ row }) => {
                const value = row.getValue("timestamp");
                if (!value || typeof value !== "string") return null;

                const date = new Date(value);
                if (isNaN(date.getTime())) return null;

                const formatted = date
                    .toLocaleString(undefined, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                    })
                    .replace(",", "");

                return (
                    <div className="text-muted-foreground text-sm leading-relaxed truncate">
                        {formatted}
                    </div>
                );
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.includes(cellValue);
            },
        },
        {
            accessorKey: "action",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    enableSorting={true}
                    allValues={getUniqueValues("action", table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Action
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm leading-relaxed truncate">
                    {row.getValue("action")}
                </div>
            ),
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.some((filter) =>
                    cellValue.toLowerCase().includes(filter.toLowerCase())
                );
            },
        },
        {
            accessorKey: "actorName",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    enableSorting={true}
                    allValues={getUniqueValues("actorName", table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Actor
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm leading-relaxed truncate">
                    {row.getValue("actorName")}
                </div>
            ),
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.some((filter) =>
                    cellValue.toLowerCase().includes(filter.toLowerCase())
                );
            },
        },
        {
            accessorKey: "data1",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableFiltering={true}
                    enableSorting={true}
                    allValues={getUniqueValues("data1", table)}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Targeted Actor
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm leading-relaxed truncate">
                    {row.getValue("data1") || "-"}
                </div>
            ),
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const cellValue = String(row.getValue(columnId) ?? "");
                return filterValue.some((filter) =>
                    cellValue.toLowerCase().includes(filter.toLowerCase())
                );
            },
        },
        {
            accessorKey: "result",
            header: ({ column, table }) => (
                <SortableHeader
                    column={column}
                    table={table}
                    enableSorting={false}
                    allValues={getUniqueValues("result", table)}
                    enableFiltering={false}
                    searchTerm={searchTerm}
                    onFilterOk={handleFilterOk}
                    justClickedOk={justClickedOk}
                >
                    Status
                </SortableHeader>
            ),
            cell: ({ row }) => {
                const resultValue = String(
                    row.getValue("result")
                ).toLowerCase();
                const status: StatusVariant =
                    resultValue === "success" ? "success" : "failed";
                return <StatusBadge status={status} />;
            },
            filterFn: (row, columnId, filterValue: string[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const statusValue = String(
                    row.getValue(columnId)
                ).toLowerCase();
                return filterValue.includes(statusValue);
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <AuditLogActions auditLog={row.original} />,
        },
    ];
}
