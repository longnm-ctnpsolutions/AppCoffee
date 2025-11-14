"use client"

import * as React from "react"
import {
  ColumnDef,
  Table as TableType,
} from "@tanstack/react-table"
import type { Role } from "@/features/roles/types/role.types"
import { 
  createEnhancedColumnConfig,
  type ColumnConfig 
} from "@/features/roles/hooks/use-responsive-columns"
import { EnhancedExpandableTable } from "@/shared/components/custom-ui/table/enhanced-expandable-table"
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types"

interface RoleTableProps {
  table: TableType<Role>
  columns: ColumnDef<Role>[]
  isLoading: boolean
  emptyState?: React.ReactNode
}

const CLIENT_TABLE_CONFIG: ColumnConfig[] = [
  createEnhancedColumnConfig('select', 1, 1, 50, 50, { alwaysVisible: true }),
  createEnhancedColumnConfig('name', 2, 2, 180, 120, { flexGrow: 1, contentBased: false, alwaysVisible: true }),
  createEnhancedColumnConfig('description', 3, 3, 300, 200, { flexGrow: 2, contentBased: false, hideAt: 'sm' }),
  createEnhancedColumnConfig('actions', 4, 4, 80, 80, { alwaysVisible: true }),
]


const ROLE_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
  {
    key: 'id',
    label: 'Role ID',
    alwaysShow: true 
  },
  {
    key: 'description',
    label: 'Description',
    hideAt: 'sm' 
  },
]

export function EnhancedRoleTable({ 
  table, columns, isLoading ,emptyState
}: RoleTableProps) {
  return (
     <EnhancedExpandableTable
                  table={table}
                  columns={columns}
                  isLoading={isLoading}
                  tableConfig={CLIENT_TABLE_CONFIG}
                  expandableConfig={{
                    getRowId: (client) => client.id,
                    fields: ROLE_EXPANDABLE_CONFIG
                  }}
                  emptyState={emptyState}
                  debugMode={process.env.NODE_ENV === 'development'}
                />
  )
}