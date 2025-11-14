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

import { Input } from "@/shared/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";

import ActionBar from '@/shared/components/custom-ui/actions-bar';
import { ActionItem } from '@/shared/hooks/use-responsive-actions';
import { ExportDialog } from "@/shared/components/custom-ui/export-dialog";
import { ColumnChooserDialog } from "@/shared/components/custom-ui/columns-chooser";
import { User } from "../types/user.types";
import { UserPermissions } from "@/shared/types/permissions.types";
import { useUsersActions } from "@/shared/context/users-context";
import { UserFilters } from "./user-filters";
import AddUserDialog from "./add-user-dialog";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";
import { getUsers } from "@/shared/api/services/users/users.service";




interface UserActionsProps {
    table: Table<User>;
    isLoading?: boolean;
    isAddUserDialogOpen: boolean;
    isSidebarExpanded: boolean;
    setAddUserDialogOpen: (isOpen: boolean) => void;
    onDeleteSelected: () => void;
    onRefreshData?: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    exportData?: User[];
    onAddUser: any;
    permissions: UserPermissions;
}

/* ---------------- user ACTIONS ---------------- */
export const UserActions = React.memo(function UserActions({
    table,
    isLoading,
    isAddUserDialogOpen,
    isSidebarExpanded,
    setAddUserDialogOpen,
    onDeleteSelected,
    onRefreshData,
    searchTerm,
    setSearchTerm,
    exportData,
    permissions,
}: UserActionsProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
    const [columnChooserOpen, setColumnChooserOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedUsers = selectedRows.map(r => r.original);

    const rowSelection = table.getState().rowSelection;

    const { canCreate, canDelete, canExport } = { canCreate: true, canDelete: true, canExport: true }; // permissions;

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

    const handleAddUserClick = React.useCallback(() => {
        setAddUserDialogOpen(true);
    }, [setAddUserDialogOpen]);

    const { removeMultipleUsers } = useUsersActions();

    const handleDeleteUserClick = React.useCallback(() => {
        const selectedIds = selectedRows.map((row) => row.original.id);
        if (selectedIds.length > 0) {
            onDeleteSelected();
        }
    }, [selectedRows, onDeleteSelected]);

    // Get hidden columns count for badge
    const hiddenColumnsCount = table.getAllColumns()
        .filter(col => col.getCanHide() && !col.getIsVisible()).length;

    const fetchAllData = async () => {
        try {
            const res = await getUsers();
            return res;
        } catch (err) {
            console.error("Failed to fetch full data", err);
            return [];
        }
    };

    // Actions array with permission checks
    const actions: ActionItem[] = React.useMemo(() => {
        const actionsList: ActionItem[] = [];

        // Add user action - always show
        actionsList.push({
            id: 'add-user',
            label: 'Thêm người dùng',
            icon: UserPlus,
            type: 'button',
            priority: 5,
            variant: 'default',
            onClick: handleAddUserClick,
            hideAt: {
                minWidth: 1150,
                condition: ({ isSidebarExpanded, windowWidth }) => {
                    const threshold = isSidebarExpanded ? 1345 : 1150;
                    return windowWidth < threshold;
                }
            }
        });

        // Delete action - always show
        actionsList.push({
            id: "delete",
            label: "Xóa",
            icon: Trash2,
            type: "button",
            variant: 'destructive',
            priority: 4,
            disabled: selectedUsers.length === 0,
            onClick: () => setDeleteDialogOpen(true),
            hideAt: {
                minWidth: 1024,
                condition: ({ windowWidth }) => windowWidth < 1024
            },
            value: selectedUsers
        });


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

        // Export action - always show
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

        return actionsList;
    }, [
        table,
        onRefreshData,
        isSidebarExpanded,
        handleExportClick,
        handleColumnChooserClick,
        hiddenColumnsCount,
        handleAddUserClick,
        rowSelection,
        handleDeleteUserClick,
        selectedUsers
    ]);

    if (!isMounted || isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Người dùng</CardTitle>
                            <CardDescription>Quản lý người dùng ứng dụng của bạn.</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 md:grow-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tìm người dùng..." value="" className="pl-9 w-full md:w-[150px] lg:w-[250px]" disabled />
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
                        <CardTitle>Người dùng</CardTitle>
                        <CardDescription>Quản lý người dùng ứng dụng của bạn.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:grow-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm người dùng..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="pl-9 w-full md:w-[150px] lg:w-[250px]"
                            />
                        </div>
                        <div className="items-center gap-2 hidden sm:flex">
                            <UserFilters table={table} />
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

            <ExportDialog
                table={table}
                data={exportData}
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                fetchAllData={fetchAllData}
            />

            <ColumnChooserDialog
                table={table}
                open={columnChooserOpen}
                onOpenChange={setColumnChooserOpen}
            />


            <AddUserDialog
                isOpen={isAddUserDialogOpen}
                onOpenChange={setAddUserDialogOpen}
            />

            <ConfirmationDialog
                trigger={null}
                title="Xác nhận Xóa"
                description={
                    selectedUsers.length === 1 ? (
                        <>Bạn có chắc chắn muốn xóa <b>{selectedUsers[0].email}</b>?</>
                    ) : (
                        <>
                            Bạn có chắc chắn muốn xóa:{" "}
                            <b>{selectedUsers.map(r => r.email).join(", ")}</b>?
                        </>
                    )
                }
                actionLabel="Xóa"
                variant="destructive"
                onConfirm={handleDeleteUserClick}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />

        </Card>
    );
});

UserActions.displayName = 'UserActions';
