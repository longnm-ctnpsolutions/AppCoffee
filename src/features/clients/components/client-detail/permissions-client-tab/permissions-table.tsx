import * as React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Download, Search, Trash, Upload } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { TablePagination } from "@/shared/components/custom-ui/pagination";
import {
    ColumnDef,
    SortingState,
    getCoreRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";
import type { Permission } from "@/types/permissions.types";
import type { TableState } from "@/types/odata.types";
import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";
import {
    EnhancedExpandableTable,
} from "@/shared/components/custom-ui/table/enhanced-expandable-table";
import {
    createEnhancedColumnConfig,
    type ColumnConfig
} from "@/hooks/use-responsive-columns";
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types";
import { SortableHeader } from "@/shared/components/custom-ui/table/sortable-header";
import { Input } from "@/shared/components/ui/input";
import * as XLSX from "xlsx";
import { ErrorDialog } from "@/shared/components/custom-ui/table/error-dialog";
import { useToast } from "@/shared/hooks/use-toast";

interface PermissionsTableProps {
    permissions: Permission[];
    totalCount: number;
    isLoading: boolean;
    onDeletePermission?: (permission: Permission) => void;
    onTableStateChange: (clientId: string, tableState: TableState) => void;
    clientId: string;
    initialPageSize?: number;
    canPermissionsDelete?: boolean;
    searchTerm?: string;
    setSearchTerm: (term: string) => void;
    onAddPermission?: (file: File) => Promise<void>;

    originalData?: Permission[]
}

const PERMISSIONS_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
    {
        key: 'description',
        label: 'Description',
        hideAt: 'sm'
    }
];

interface PermissionActionsProps {
    permission: Permission;
    onDelete?: (permission: Permission) => void;
    isLoading: boolean;
}

type PermissionExcel = {
    name: string;
    description: string;
};

function PermissionActions({ permission, onDelete, isLoading }: PermissionActionsProps) {
    return (
        <div className="text-right" data-no-expand>
            <ConfirmationDialog
                trigger={
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        disabled={isLoading}
                        data-no-expand
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                }
                title="Confirm"
                description={
                    <>Are you sure you want to delete this: <b>{permission.name}</b>?</>
                }
                actionLabel="Delete"
                variant="destructive"
                onConfirm={() => onDelete?.(permission)}
            />
        </div>
    );
}

const PermissionsTable: React.FC<PermissionsTableProps> = ({
    permissions,
    totalCount,
    isLoading,
    onDeletePermission,
    onTableStateChange,
    clientId,
    initialPageSize = 10,
    canPermissionsDelete = false,
    searchTerm,
    setSearchTerm,
    onAddPermission,
    originalData
}) => {
    // Server-side state management
    const [sorting, setSorting] = useState<SortingState>([
        { id: "name", desc: false }
    ]);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: initialPageSize,
    });

    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");

    // Track previous states to prevent unnecessary API calls
    const prevStateRef = React.useRef<TableState | null>(null);

    // Convert TanStack Table state to OData TableState
    const createTableState = useCallback((): TableState => {
        return {
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            },
            sorting: sorting.map(sort => ({
                id: sort.id,
                desc: sort.desc,
            })),
            columnFilters: columnFilters.map(filter => ({
                id: filter.id,
                value: filter.value,
            })),
            globalFilter: globalFilter,
        };
    }, [pagination, sorting, columnFilters, globalFilter]);

    // Handle table state changes and trigger API calls
    const handleTableStateChange = useCallback(() => {
        const newTableState = createTableState();

        // Compare with previous state to prevent duplicate calls
        const stateString = JSON.stringify(newTableState);
        const prevStateString = JSON.stringify(prevStateRef.current);

        if (stateString !== prevStateString) {
            prevStateRef.current = newTableState;
            onTableStateChange(clientId, newTableState);
        }
    }, [createTableState, onTableStateChange, clientId]);

    useEffect(() => {
        handleTableStateChange();
    }, [handleTableStateChange]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [permissionExcels, setPermissionExcels] = useState<PermissionExcel[]>([]);
    const [openError, setOpenError] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const { toast } = useToast();

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleExportClick = () => {
        const link = document.createElement("a");
        link.href = "/templates/permission_template.xlsx";
        link.download = "permission_template.xlsx";
        link.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        await handleAddMany(file);
        
    } catch (error: any) {
        setErrorTitle(error.message || "Unexpected error during import.");
        setOpenError(true);
    } finally {
        e.target.value = "";
    }
};

const handleAddMany = async (
    file: File
): Promise<void>=> {
        await onAddPermission?.(file);
};


    // Tạo responsive config động dựa trên canPermissionsDelete
    const tableConfig: ColumnConfig[] = React.useMemo(() => {
        const baseConfig: ColumnConfig[] = [
            createEnhancedColumnConfig('name', 1, 1, 350, 300, {
                flexGrow: 1,
                contentBased: false,
                alwaysVisible: true
            }),
            createEnhancedColumnConfig('description', 2, 2, 400, 300, {
                flexGrow: 2,
                contentBased: false,
                hideAt: 'md'
            })
        ];

        if (canPermissionsDelete) {
            baseConfig.push(
                createEnhancedColumnConfig('actions', 3, 3, 80, 80, {
                    alwaysVisible: true
                })
            );
        }

        return baseConfig;
    }, [canPermissionsDelete]);

    const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
    }, [setSearchTerm]);

    const getUniqueValues = (field: keyof Permission, table: any): string[] => {
        if (!originalData || originalData.length === 0) return []

        const values = originalData
            .map(item => item[field])
            .filter(
                (v): v is string =>
                    v !== undefined && v !== null && String(v).trim() !== ""
            )
            .map(v => String(v))

        return Array.from(new Set(values)).sort()
    }

    // Column definitions với responsive headers
    const columns: ColumnDef<Permission>[] = React.useMemo(() => {
        const baseColumns: ColumnDef<Permission>[] = [
            {
                accessorKey: "name",
                header: ({ column, table }) => (
                    <SortableHeader
                        column={column}
                        table={table}
                        enableFiltering={true}
                        enableSorting={true}
                        allValues={getUniqueValues('name', table)}
                    >
                        Permission
                    </SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <div className="font-medium">{getValue() as string || '-'}</div>
                ),
            },
            {
                accessorKey: "description",
                header: ({ column, table }) => (
                    <SortableHeader
                        column={column}
                        table={table}
                        enableFiltering={true}
                        allValues={getUniqueValues('description', table)}
                    >
                        Description
                    </SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <div className="text-muted-foreground text-sm">{getValue() as string || '-'}</div>
                ),
            }
        ];

        if (canPermissionsDelete) {
            baseColumns.push({
                id: "actions",
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => (
                    <PermissionActions
                        permission={row.original}
                        onDelete={onDeletePermission}
                        isLoading={isLoading}
                    />
                ),
            });
        }

        return baseColumns;
    }, [canPermissionsDelete, onDeletePermission, isLoading]);

    // Calculate total pages for server-side pagination
    const pageCount = Math.ceil(totalCount / pagination.pageSize);

    const table = useReactTable({
        data: permissions,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: pageCount,
        state: {
            sorting,
            pagination,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <Card className="flex flex-col flex-shrink-0 rounded-[8px] border pt-[20px] pb-[20px] px-[24px] space-y-4 shadow-lg border-gray-200">
            <div className="flex items-center justify-between w-full">
                <div className="text-lg font-semibold flex-shrink-0">
                    List of Permissions
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search permission..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-9 w-full md:w-[150px] lg:w-[250px]"
                        />
                    </div>

                    <Button variant="secondary" size="sm" onClick={handleExportClick} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Template
                    </Button>

                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        className="hidden"
                    />

                    <Button size="sm" onClick={handleImportClick} className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Import from Excel
                    </Button>

                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                </div>
            </div>

            <Card className="flex flex-col h-[350px] overflow-hidden shadow-md border-gray-100 mt-2">
                <CardContent className="flex-1 p-0 min-h-0 flex flex-col">
                    <EnhancedExpandableTable
                        table={table}
                        columns={columns}
                        isLoading={isLoading}
                        tableConfig={tableConfig}
                        expandableConfig={{
                            getRowId: (permission) => permission.id?.toString() || permission.name || '',
                            fields: PERMISSIONS_EXPANDABLE_CONFIG
                        }}
                        debugMode={process.env.NODE_ENV === 'development'}
                        className="border rounded-md flex flex-col h-full"
                    />
                </CardContent>
            </Card>

            {/* Pagination - Using existing TablePagination */}
            <div className="flex-shrink-0">
                <TablePagination
                    table={table as any}
                    totalCount={totalCount}
                    isTableLoading={isLoading}
                />
            </div>

            <ErrorDialog
                open={openError}
                onOpenChange={setOpenError}
                title="Error"
                description={[errorTitle]}
            />
        </Card>
    );
};

export default PermissionsTable;