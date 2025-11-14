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
import type { UserRole } from '@/features/users/types/user.types';
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

interface RolesTableProps {
  userRoles: UserRole[];
  totalCount: number;
  isLoading: boolean;
  onDeleteRole?: (userRole: UserRole) => void;
  onTableStateChange: (userId: string, tableState: TableState) => void;
  userId: string;
  initialPageSize?: number;
  canUserRolesDelete?: boolean;
  originalData?: UserRole[]
}

const ROLE_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
  {
    key: 'description',
    label: 'Description',
    hideAt: 'sm'
  }
];

interface RoleActionsProps {
  userRole: UserRole;
  onDelete?: (userRole: UserRole) => void;
  isLoading: boolean;
}

function RoleActions({ userRole, onDelete, isLoading }: RoleActionsProps) {
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
          <>Are you sure you want to delete this: <b>{userRole.name}</b>?</>
        }
        actionLabel="Delete"
        variant="destructive"
        onConfirm={() => onDelete?.(userRole)}
      />
    </div>
  );
}

const RolesTable: React.FC<RolesTableProps> = ({
  userRoles,
  totalCount,
  isLoading,
  onDeleteRole,
  onTableStateChange,
  userId,
  initialPageSize = 20,
  canUserRolesDelete,
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
    const stateString = JSON.stringify(newTableState);
    const prevStateString = JSON.stringify(prevStateRef.current);

    if (stateString !== prevStateString) {
      prevStateRef.current = newTableState;
      onTableStateChange(userId, newTableState);
    }
  }, [createTableState, onTableStateChange, userId]);

  // Effect to handle state changes
  useEffect(() => {
    handleTableStateChange();
  }, [handleTableStateChange]);


  const tableConfig: ColumnConfig[] = React.useMemo(() => {
    const baseConfig: ColumnConfig[] = [
      createEnhancedColumnConfig('name', 1, 1, 200, 150, {
        flexGrow: 1,
        contentBased: false,
        alwaysVisible: true
      }),
      createEnhancedColumnConfig('description', 3, 3, 400, 350, {
        flexGrow: 2,
        contentBased: false,
        hideAt: 'sm'
      }),
    ];
    if (canUserRolesDelete) {
      baseConfig.push(
        createEnhancedColumnConfig('actions', 4, 4, 80, 80, {
          alwaysVisible: true
        })
      );
    }

    return baseConfig;
  }, [canUserRolesDelete]);

  const getUniqueValues = (field: keyof UserRole, table: any): string[] => {
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

  const columns: ColumnDef<UserRole>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<UserRole>[] = [
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
            Role
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
            allValues={getUniqueValues('name', table)}
          >
            Description
          </SortableHeader>
        ),
        cell: ({ getValue }) => (
          <div className="text-muted-foreground text-sm">{getValue() as string || '-'}</div>
        ),
      }
    ];

    if (canUserRolesDelete) {
      baseColumns.push({
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <RoleActions
            userRole={row.original}
            onDelete={onDeleteRole}
            isLoading={isLoading}
          />
        ),
      });
    }

    return baseColumns;
  }, [canUserRolesDelete, onDeleteRole, isLoading]);



  // Calculate total pages for server-side pagination
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data: userRoles,
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
      <div className="flex items-center justify-items-start">
        <div className="text-lg font-semibold flex-shrink-0">
          List of Permissions
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
              getRowId: (role) => role.id?.toString() || role.name || '',
              fields: ROLE_EXPANDABLE_CONFIG
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


export default RolesTable;
