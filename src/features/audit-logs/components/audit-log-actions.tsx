import * as React from "react";
import { Table } from "@tanstack/react-table";
import {
    Trash2,
    UserPlus,
    Columns,
    Search,
    RefreshCw,
    Download,
} from "lucide-react";

import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

import ActionBar from '@/shared/components/custom-ui/actions-bar';
import { ActionItem } from '@/shared/hooks/use-responsive-actions';
import { ExportDialog } from "@/shared/components/custom-ui/export-dialog";
import { ColumnChooserDialog } from "@/shared/components/custom-ui/columns-chooser";
import { getAuditLogs, getAuditLogsMe } from "@/shared/api/services/audit-logs/audit-logs.service";
import { useAuditLogsActions } from "@/shared/context/audit-logs-context"


interface AuditLogActionsProps {
    table: Table<AuditLog>;
    isLoading?: boolean;
    isAddAuditLogDialogOpen: boolean;
    isSidebarExpanded: boolean;
    setAddAuditLogDialogOpen: (isOpen: boolean) => void;
    onDeleteSelected: () => void;
    onRefreshData?: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    exportData?: AuditLog[];
    onAddAuditLog: any;
}

/* ---------------- AUDITLOG ACTIONS ---------------- */
export const AuditLogActions = React.memo(function AuditLogActions({
    table,
    isLoading,
    isAddAuditLogDialogOpen,
    isSidebarExpanded,
    setAddAuditLogDialogOpen,
    onDeleteSelected,
    onRefreshData,
    searchTerm,
    setSearchTerm,
    exportData,
}: AuditLogActionsProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
    const [columnChooserOpen, setColumnChooserOpen] = React.useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const rowSelection = table.getState().rowSelection;

    // const { canCreate, canDelete, canExport } = permissions;

    const { fetchAllAuditLogs } = useAuditLogsActions()

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
    }, [setSearchTerm]);

    const handleExportClick = React.useCallback(() => {
        if (true) {
            setExportDialogOpen(true);
        }
    }, []);

    const handleColumnChooserClick = React.useCallback(() => {
        setColumnChooserOpen(true);
    }, []);

    const selectedAuditLogs = table.getFilteredSelectedRowModel().rows.map(r => r.original);

    const handleDeleteClientClick = React.useCallback(() => {
        onDeleteSelected();
    }, []);

    // Get hidden columns count for badge
    const hiddenColumnsCount = table.getAllColumns()
        .filter(col => col.getCanHide() && !col.getIsVisible()).length;

   const fetchAllData = async (): Promise<AuditLog[]> => {
        try {
            const res = await fetchAllAuditLogs();
            return res ?? [];
        } catch (err) {
            console.error("Failed to fetch full data", err);
            return [];
        }
    };

    // Actions array with permission checks
    const actions: ActionItem[] = React.useMemo(() => {
        const actionsList: ActionItem[] = [];

        // Export action - only if user has export permission
        if (true) {
            actionsList.push({
                id: 'export-dropdown',
                label: 'Export Data',
                icon: Download,
                type: 'button',
                onClick: handleExportClick,
                priority: 3,
                hideAt: {
                    minWidth: 900,
                    condition: ({ windowWidth }) => windowWidth < 900
                }
            });
        }

        if (onRefreshData) {
            actionsList.push({
                id: 'refresh',
                label: 'Refresh Data',
                icon: RefreshCw,
                type: 'button',
                variant: 'ghost',
                size: 'icon',
                onClick: onRefreshData,
                priority: 1,
                hideAt: {
                    minWidth: 640,
                    condition: ({ windowWidth }) => windowWidth < 640
                }
            });
        }

        return actionsList;
    }, [
        table,
        onRefreshData,
        isSidebarExpanded,
        handleExportClick,
        handleColumnChooserClick,
        hiddenColumnsCount,
        rowSelection,
        handleDeleteClientClick,
    ]);

    if (!isMounted || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>Manage your audit logs.</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 md:grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." value="" className="pl-9 w-full md:w-[150px] lg:w-[250px]" disabled />
                            </div>
                            <div className="items-center gap-2 hidden sm:flex">
                                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle>Audit Logs</CardTitle>
                        <CardDescription>Manage your audit logs.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-9 w-full md:w-[150px] lg:w-[250px]"
                            />
                        </div>
                        <ActionBar
                            actions={actions}
                            isSidebarExpanded={isSidebarExpanded}
                            enableDropdown={true}
                            dropdownThreshold={1}
                            spacing="md"
                        />
                    </div>
                </div>
            </CardHeader>

            {true && (
                <ExportDialog
                    table={table}
                    data={exportData}
                    open={exportDialogOpen}
                    onOpenChange={setExportDialogOpen}
                    fetchAllData={fetchAllData}
                />
            )}

            <ColumnChooserDialog
                table={table}
                open={columnChooserOpen}
                onOpenChange={setColumnChooserOpen}
            />
        </Card>
    );
});

AuditLogActions.displayName = 'AuditLogActions';
