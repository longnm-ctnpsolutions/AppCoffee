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

import type { Client } from "@/features/clients/types/client.types";
import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

import { ClientFilters } from "./client-filters";
import AddClientDialog from '@/features/clients/components/add-client-dialog';
import ActionBar from '@/shared/components/custom-ui/actions-bar';
import { ActionItem } from '@/shared/hooks/use-responsive-actions';
import { ExportDialog } from "@/shared/components/custom-ui/export-dialog";
import { ColumnChooserDialog } from "@/shared/components/custom-ui/columns-chooser";

import { ClientPermissions } from "@/shared/types/permissions.types";

import { getClients } from "@/services/clients/clients.service";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";


interface ClientActionsProps {
    table: Table<Client>;
    isLoading?: boolean;
    isAddClientDialogOpen: boolean;
    isSidebarExpanded: boolean;
    setAddClientDialogOpen: (isOpen: boolean) => void;
    onDeleteSelected: () => void;
    onRefreshData?: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    exportData?: Client[];
    onAddClient: any;
    permissions: ClientPermissions;
}

/* ---------------- CLIENT ACTIONS ---------------- */
export const ClientActions = React.memo(function ClientActions({
    table,
    isLoading,
    isAddClientDialogOpen,
    isSidebarExpanded,
    setAddClientDialogOpen,
    onDeleteSelected,
    onRefreshData,
    searchTerm,
    setSearchTerm,
    exportData,
    permissions,
}: ClientActionsProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
    const [columnChooserOpen, setColumnChooserOpen] = React.useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const rowSelection = table.getState().rowSelection;

    const { canCreate, canDelete, canExport } = { canCreate: true, canDelete: true, canExport: true }; //permissions;

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
    }, [setSearchTerm]);

    const handleExportClick = React.useCallback(() => {
        if (canExport) {
            setExportDialogOpen(true);
        }
    }, [canExport]);

    const handleColumnChooserClick = React.useCallback(() => {
        setColumnChooserOpen(true);
    }, []);

    const handleAddClientClick = React.useCallback(() => {
        if (canCreate) {
            setAddClientDialogOpen(true);
        }
    }, [canCreate, setAddClientDialogOpen]);

    const selectedClients = table.getFilteredSelectedRowModel().rows.map(r => r.original);

    const handleDeleteClientClick = React.useCallback(() => {
        onDeleteSelected();
    }, [onDeleteSelected]);

    // Get hidden columns count for badge
    const hiddenColumnsCount = table.getAllColumns()
        .filter(col => col.getCanHide() && !col.getIsVisible()).length;

    const fetchAllData = async () => {
        try {
            const res = await getClients();
            return res;
        } catch (err) {
            console.error("Failed to fetch full data", err);
            return [];
        }
    };

    // Actions array with permission checks
    const actions: ActionItem[] = React.useMemo(() => {
        const actionsList: ActionItem[] = [];

        // Add Client action - only if user has create permission
        if (canCreate) {
            actionsList.push({
                id: 'add-client',
                label: 'Thêm máy khách',
                icon: UserPlus,
                type: 'button',
                priority: 5,
                variant: 'default',
                onClick: handleAddClientClick,
                hideAt: {
                    minWidth: 1150,
                    condition: ({ isSidebarExpanded, windowWidth }) => {
                        const threshold = isSidebarExpanded ? 1345 : 1150;
                        return windowWidth < threshold;
                    }
                }
            });
        }

        // Delete action - only if user has delete permission
        if (canDelete) {
            actionsList.push({
                id: 'delete',
                label: 'Xóa',
                icon: Trash2,
                type: 'button',
                variant: 'destructive',
                disabled: selectedClients.length === 0,
                onClick: () => setDeleteDialogOpen(true),
                priority: 4,
                hideAt: {
                    minWidth: 1024,
                    condition: ({ windowWidth }) => windowWidth < 1024
                },
                value: selectedClients
            });
        }

        // Refresh action - always available if onRefreshData is provided
        if (onRefreshData) {
            actionsList.push({
                id: 'refresh',
                label: 'Làm mới dữ liệu',
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

        // Column chooser - always available
        actionsList.push({
            id: 'column-chooser',
            label: 'Hiển thị cột',
            icon: Columns,
            type: 'button',
            variant: 'ghost',
            size: 'icon',
            onClick: handleColumnChooserClick,
            priority: 2,
            hideAt: {
                minWidth: 768,
                condition: ({ windowWidth }) => windowWidth < 768
            },
        });

        // Export action - only if user has export permission
        if (canExport) {
            actionsList.push({
                id: 'export-dropdown',
                label: 'Xuất dữ liệu',
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

        return actionsList;
    }, [
        table,
        onRefreshData,
        isSidebarExpanded,
        handleExportClick,
        handleColumnChooserClick,
        hiddenColumnsCount,
        handleAddClientClick,
        rowSelection,
        handleDeleteClientClick,
        canCreate,
        canDelete,
        canExport,
        selectedClients
    ]);

    if (!isMounted || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Clients</CardTitle>
                            <CardDescription>Quản lý các máy khách ứng dụng của bạn.</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 md:grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm máy khách..." value="" className="pl-9 w-full md:w-[150px] lg:w-[250px]" disabled />
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
                        <CardTitle>Clients</CardTitle>
                        <CardDescription>Quản lý các máy khách ứng dụng của bạn.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm máy khách..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-9 w-full md:w-[150px] lg:w-[250px]"
                            />
                        </div>
                        <div className="items-center gap-2 hidden sm:flex">
                            <ClientFilters table={table} />
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

            {canExport && (
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

            {canCreate && (
                <AddClientDialog
                    isOpen={isAddClientDialogOpen}
                    onOpenChange={setAddClientDialogOpen}
                />
            )}

            <ConfirmationDialog
                 trigger={null}
                 title="Xác nhận Xóa"
                 description={
                     selectedClients.length === 1 ? (
                     <>Bạn có chắc chắn muốn xóa <b>{selectedClients[0].name}</b>?</>
                     ) : (
                     <>
                         Bạn có chắc chắn muốn xóa:{" "}
                         <b>{selectedClients.map(r => r.name).join(", ")}</b>?
                     </>
                     )
                 }
                 actionLabel="Xóa"
                 variant="destructive"
                 onConfirm={handleDeleteClientClick}
                 open={deleteDialogOpen}
                 onOpenChange={setDeleteDialogOpen}
            />           
        </Card>
    );
});

ClientActions.displayName = 'ClientActions';
