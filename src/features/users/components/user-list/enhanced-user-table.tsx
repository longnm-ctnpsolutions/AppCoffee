"use client";

import * as React from "react";
import {
    ColumnDef,
    Table as TableType,
} from "@tanstack/react-table";

import type { User } from "@/features/users/types/user.types";
import { 
  createEnhancedColumnConfig,
  type ColumnConfig 
} from "@/hooks/use-responsive-columns"
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types"
import { 
  EnhancedExpandableTable,
} from "@/shared/components/custom-ui/table/enhanced-expandable-table"
interface UserTableProps {
    table: TableType<User>;
    columns: ColumnDef<User>[];
    isLoading: boolean;
    emptyState?: React.ReactNode
}

const USER_TABLE_CONFIG: ColumnConfig[] = [
    createEnhancedColumnConfig("select", 1, 1, 50, 50, { alwaysVisible: true }),
    createEnhancedColumnConfig("email", 2, 2, 200, 250, {
        flexGrow: 1,
        contentBased: false,
        alwaysVisible: true,
    }),
    createEnhancedColumnConfig("lockoutEnabled", 3, 3, 200, 250, {
        contentBased: false,
        hideAt: "sm",
    }),
    createEnhancedColumnConfig("connection", 4, 4, 300, 200, {
        flexGrow: 2,
        contentBased: false,
        hideAt: "md",
    }),
    createEnhancedColumnConfig("actions", 5, 5, 80, 80, {
        alwaysVisible: true,
    }),
];

const USER_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
  {
    key: 'id',
    label: 'User ID',
    alwaysShow: true 
  },
  {
    key: 'connection',
    label: 'Connection',
    hideAt: 'md' 
  },
  {
    key: 'lockoutEnabled',
    label: 'Status',
    hideAt: 'sm' 
  },
]


export function EnhancedUserTable({
    table,
    columns,
    isLoading,
    emptyState
}: UserTableProps) {
    return (
        <EnhancedExpandableTable
              table={table}
              columns={columns}
              isLoading={isLoading}
              tableConfig={USER_TABLE_CONFIG}
              expandableConfig={{
                getRowId: (client) => client.id,
                fields: USER_EXPANDABLE_CONFIG
              }}
              emptyState={emptyState}
              debugMode={process.env.NODE_ENV === 'development'}
            />
    );
}
