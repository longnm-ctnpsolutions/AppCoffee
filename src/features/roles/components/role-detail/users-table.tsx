import * as React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Trash } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { TablePagination } from "@/shared/components/custom-ui/pagination";
import {
    ColumnDef,
    SortingState,
    getCoreRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";
import type { TableState } from "@/types/odata.types";
import type { RoleUser } from '@/features/roles/types/role.types';
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
import { StatusBadge, StatusVariant } from "@/shared/components/custom-ui/table/status-badge";

interface UsersTableProps {
    roleUsers: RoleUser[];
    totalCount: number;
    isLoading: boolean;
    onDeleteUser?: (roleUser: RoleUser) => void;
    onTableStateChange: (roleId: string, tableState: TableState) => void;
    roleId: string;
    initialPageSize?: number;
    canRoleUsersDelete?: boolean;
    originalData?: RoleUser[]
}

const USER_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
    {
        key: 'lockoutEnabled',
        label: 'Status',
        hideAt: 'md'
    },
    {
        key: 'connection',
        label: 'Connection',
        hideAt: 'sm'
    }
];

interface UserActionsProps {
    roleUser: RoleUser;
    onDelete?: (roleUser: RoleUser) => void;
    isLoading: boolean;
}

function UserActions({ roleUser, onDelete, isLoading }: UserActionsProps) {
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
                    <>Are you sure you want to delete this: <b>{roleUser.email}</b>?</>
                }
                actionLabel="Delete"
                variant="destructive"
                onConfirm={() => onDelete?.(roleUser)}
            />
        </div>
    );
}

const UsersTable: React.FC<UsersTableProps> = ({
    roleUsers,
    totalCount,
    isLoading,
    onDeleteUser,
    onTableStateChange,
    roleId,
    initialPageSize = 20,
    canRoleUsersDelete,
    originalData
}) => {
    // Server-side state management
    const [sorting, setSorting] = useState<SortingState>([
        { id: "email", desc: false }
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
        const stateString = JSON.stringify(newTableState);
        const prevStateString = JSON.stringify(prevStateRef.current);

        if (stateString !== prevStateString) {
            prevStateRef.current = newTableState;
            onTableStateChange(roleId, newTableState);
        }
    }, [createTableState, onTableStateChange, roleId]);

    // Effect to handle state changes
    useEffect(() => {
        handleTableStateChange();
    }, [handleTableStateChange]);


    const tableConfig: ColumnConfig[] = React.useMemo(() => {
        const baseConfig: ColumnConfig[] = [
            createEnhancedColumnConfig('email', 1, 1, 400, 350, {
                flexGrow: 1,
                contentBased: false,
                alwaysVisible: true
            }),
            createEnhancedColumnConfig('connection', 3, 3, 300, 200, {
                flexGrow: 2,
                contentBased: false,
                hideAt: 'sm'
            }),
            createEnhancedColumnConfig('lockoutEnabled', 2, 2, 300, 200, {
                contentBased: false,
                hideAt: 'md'
            })
        ];
        if (canRoleUsersDelete) {
            baseConfig.push(
                createEnhancedColumnConfig('actions', 4, 4, 80, 80, {
                    alwaysVisible: true
                })
            );
        }

        return baseConfig;
    }, [canRoleUsersDelete]);

     const getUniqueValues = (field: keyof RoleUser, table: any): string[] => {
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

    const columns: ColumnDef<RoleUser>[] = React.useMemo(() => {
        const baseColumns: ColumnDef<RoleUser>[] = [
            {
                accessorKey: "email",
                header: ({ column, table }) => (
                    <SortableHeader
                        column={column}
                        table={table}
                        enableFiltering={true}
                        enableSorting={true}
                        allValues={getUniqueValues('email', table)}
                    >
                        Email
                    </SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <div className="font-medium">{getValue() as string || '-'}</div>
                ),
            },
            {
                accessorKey: "lockoutEnabled",
                header: ({ column, table }) => (
                    <SortableHeader
                        column={column}
                        table={table}
                    >
                        Status
                    </SortableHeader>
                ),
                cell: ({ row }) => {
                    const statusValue = row.getValue("lockoutEnabled");
                    const status: StatusVariant = (statusValue === true || statusValue === "true") ? 'inactive' : 'active';
                    return <StatusBadge status={status} />;
                },
                filterFn: (row, columnId, filterValue: string[]) => {
                    if (!filterValue || filterValue.length === 0) return true
                    const statusValue = row.getValue(columnId)
                    const displayStatus = (statusValue === true || statusValue === "true") ? "inactive" : "active"
                    return filterValue.includes(displayStatus)
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
                    >
                        Connection
                    </SortableHeader>
                ),
                cell: ({ getValue }) => (
                    <div className="text-muted-foreground text-sm">{getValue() as string || '-'}</div>
                ),
            }
        ];

        if (canRoleUsersDelete) {
            baseColumns.push({
                id: "actions",
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => (
                    <UserActions
                        roleUser={row.original}
                        onDelete={onDeleteUser}
                        isLoading={isLoading}
                    />
                ),
            });
        }

        return baseColumns;
    }, [canRoleUsersDelete, onDeleteUser, isLoading]);



    // Calculate total pages for server-side pagination
    const pageCount = Math.ceil(totalCount / pagination.pageSize);

    const table = useReactTable({
        data: roleUsers,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, // Enable server-side pagination
        manualSorting: true,    // Enable server-side sorting
        manualFiltering: true,  // Enable server-side filtering
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
                    <div className="flex items-center justify-items-start">
                        <div className="text-lg font-semibold flex-shrink-0">
                            List of Users
                        </div>
                    </div>
        
                    <Card className="flex flex-col h-full overflow-hidden shadow-md border-gray-100 mt-2">
                        <CardContent className="flex-1 p-0 min-h-0 flex flex-col">
                            <EnhancedExpandableTable
                                table={table}
                                columns={columns}
                                isLoading={isLoading}
                                tableConfig={tableConfig}
                                expandableConfig={{
                                    getRowId: (user) => user.id?.toString() || user.email || '',
                                    fields: USER_EXPANDABLE_CONFIG
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
                </Card>
    );
};


export default UsersTable;
