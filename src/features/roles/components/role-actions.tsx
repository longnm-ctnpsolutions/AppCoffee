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

import type { Role } from "@/features/roles/types/role.types";
import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import AddRoleDialog from '@/features/roles/components/add-role-dialog';
import ActionBar from '@/shared/components/custom-ui/actions-bar';
import { ActionItem } from '@/shared/hooks/use-responsive-actions';
import { ExportDialog } from "@/shared/components/custom-ui/export-dialog";
import { ColumnChooserDialog } from "@/shared/components/custom-ui/columns-chooser";
import { RolePermissions } from "@/types/permissions.types";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";
import { getRoles } from "@/services/roles/roles.service";



// Define CheckedState type explicitly
type CheckedState = boolean | string | "indeterminate";

interface RoleActionsProps {
    table: Table<Role>;
    isLoading?: boolean;
    isAddRoleDialogOpen: boolean;
    isSidebarExpanded: boolean;
    setAddRoleDialogOpen: (isOpen: boolean) => void;
    onDeleteSelected: () => void;
    onRefreshData?: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    exportData?: Role[];
    onAddRole: any;
    permissions: RolePermissions;
}

/* ---------------- ROLE ACTIONS ---------------- */
export const RoleActions = React.memo(function RoleActions({
    table,
    isLoading,
    isAddRoleDialogOpen,
    isSidebarExpanded,
    setAddRoleDialogOpen,
    onDeleteSelected,
    onRefreshData,
    searchTerm,
    setSearchTerm,
    exportData,
    permissions
}: RoleActionsProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
    const [columnChooserOpen, setColumnChooserOpen] = React.useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const rowSelection = table.getState().rowSelection;
    const { canExport, canCreate, canDelete } = permissions;
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
    }, [setSearchTerm]);

    const handleExportClick = React.useCallback(() => {
        setExportDialogOpen(true);
    }, []);

    const handleColumnChooserClick = React.useCallback(() => {
        setColumnChooserOpen(true);
    }, []);

    const handleAddRoleClick = React.useCallback(() => {
        setAddRoleDialogOpen(true);
    }, []);

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedRoles = selectedRows.map(r => r.original);

    const handleDeleteRoleClick = React.useCallback(() => {
        onDeleteSelected();
    }, []);

    // Get hidden columns count for badge
    const hiddenColumnsCount = table.getAllColumns()
        .filter(col => col.getCanHide() && !col.getIsVisible()).length;

    const fetchAllData = async () => {
        try {
            const res = await getRoles();
            return res;
        } catch (err) {
            console.error("Failed to fetch full data", err);
            return [];
        }
    };


    const actions: ActionItem[] = React.useMemo(() => {
        const actionsList: ActionItem[] = [];

        // Add Role action - chỉ hiển thị nếu có quyền
        if (canCreate) {
            actionsList.push({
                id: 'add-role',
                label: 'Add Role',
                icon: UserPlus,
                type: 'button',
                priority: 5,
                variant: 'default',
                onClick: handleAddRoleClick,
                hideAt: {
                    minWidth: 1150,
                    condition: ({ isSidebarExpanded, windowWidth }) => {
                        const threshold = isSidebarExpanded ? 1345 : 1150;
                        return windowWidth < threshold;
                    }
                }
            });
        }

        // Delete action - chỉ hiển thị nếu có quyền
        if (canDelete) {
            actionsList.push({
                id: "delete",
                label: "Delete",
                icon: Trash2,
                type: "button",
                variant: 'destructive',
                priority: 4,
                disabled: selectedRoles.length === 0,
                onClick: () => setDeleteDialogOpen(true),
                hideAt: {
                    minWidth: 1024,
                    condition: ({ windowWidth }) => windowWidth < 1024
                },
                value: selectedRoles
            });
        }

        // Refresh action - luôn hiển thị (không cần permission đặc biệt)
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

        // Column chooser - luôn hiển thị
        actionsList.push({
            id: 'column-chooser',
            label: 'Column Visibility',
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

        // Export action - chỉ hiển thị nếu có quyền
        if (canExport) {
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

        return actionsList;
    }, [
        canCreate,
        canDelete,
        canExport,
        table,
        onRefreshData,
        isSidebarExpanded,
        handleExportClick,
        handleColumnChooserClick,
        handleAddRoleClick,
        handleDeleteRoleClick,
        hiddenColumnsCount,
        rowSelection
    ]);

    if (!isMounted || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>Manage your application roles.</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 md:grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search roles..." value="" className="pl-9 w-full md:w-[150px] lg:w-[250px]" disabled />
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
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>Manage your application roles.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
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

            {/* Export Dialog */}
            <ExportDialog
                table={table}
                data={exportData}
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                fetchAllData={fetchAllData}
            />

            {/* Column Chooser Dialog */}
            <ColumnChooserDialog
                table={table}
                open={columnChooserOpen}
                onOpenChange={setColumnChooserOpen}
            />

            <AddRoleDialog
                isOpen={isAddRoleDialogOpen}
                onOpenChange={setAddRoleDialogOpen}
            />

            <ConfirmationDialog
                trigger={null}
                title="Confirm Delete"
                description={
                    selectedRoles.length === 1 ? (
                    <>Are you sure you want to delete <b>{selectedRoles[0].name}</b>?</>
                    ) : (
                    <>
                        Are you sure you want to delete this:{" "}
                        <b>{selectedRoles.map(r => r.name).join(", ")}</b>?
                    </>
                    )
                }
                actionLabel="Delete"
                variant="destructive"
                onConfirm={handleDeleteRoleClick}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />

        </Card>
    );
});

RoleActions.displayName = 'RoleActions';
