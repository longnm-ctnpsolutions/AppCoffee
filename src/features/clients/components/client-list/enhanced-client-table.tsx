"use client"

import * as React from "react"
import { ColumnDef, Table as TableType } from "@tanstack/react-table"
import { Client } from "@/features/clients/types/client.types"
import { 
  EnhancedExpandableTable,
} from "@/shared/components/custom-ui/table/enhanced-expandable-table"
import { 
  createEnhancedColumnConfig,
  type ColumnConfig 
} from "@/hooks/use-responsive-columns"
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types"

interface ClientTableProps {
  table: TableType<Client>
  columns: ColumnDef<Client>[]
  isLoading: boolean,
  emptyState?: React.ReactNode
}

const CLIENT_TABLE_CONFIG: ColumnConfig[] = [
  createEnhancedColumnConfig('select', 1, 1, 50, 50, { alwaysVisible: true }),
  createEnhancedColumnConfig('logo', 2, 2, 60, 60, { alwaysVisible: true }),
  createEnhancedColumnConfig('name', 3, 3, 180, 120, { flexGrow: 1, contentBased: false, alwaysVisible: true }),
  createEnhancedColumnConfig('description', 4, 4, 300, 200, { flexGrow: 2, contentBased: false, hideAt: 'md' }),
  createEnhancedColumnConfig('status', 5, 5, 120, 80, { contentBased: false, hideAt: 'sm' }),
  createEnhancedColumnConfig('actions', 6, 6, 80, 80, { alwaysVisible: true }),
]

const CLIENT_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
  {
    key: 'id',
    label: 'Client ID',
    alwaysShow: true 
  },
  {
    key: 'description',
    label: 'Description',
    hideAt: 'md' 
  },
  {
    key: 'status',
    label: 'Status',
    hideAt: 'sm' 
  },
]

export function EnhancedClientTable({ table, columns, isLoading, emptyState }: ClientTableProps) {
  return (
    <EnhancedExpandableTable
      table={table}
      columns={columns}
      isLoading={isLoading}
      tableConfig={CLIENT_TABLE_CONFIG}
      expandableConfig={{
        getRowId: (client) => client.id,
        fields: CLIENT_EXPANDABLE_CONFIG
      }}
      emptyState={emptyState}
      debugMode={process.env.NODE_ENV === 'development'}
    />
  )
}