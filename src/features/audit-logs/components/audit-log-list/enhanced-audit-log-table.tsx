"use client";

import * as React from "react";
import { ColumnDef, Table as TableType } from "@tanstack/react-table";
import { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import { EnhancedExpandableTable } from "@/shared/components/custom-ui/table/enhanced-expandable-table";
import {
    createEnhancedColumnConfig,
    type ColumnConfig,
} from "@/hooks/use-responsive-columns";
import { ExpandableFieldConfig } from "@/shared/types/dashboard.types";

interface AuditLogTableProps {
    table: TableType<AuditLog>;
    columns: ColumnDef<AuditLog>[];
    isLoading: boolean;
    emptyState?: React.ReactNode;
}

const AUDITLOG_TABLE_CONFIG: ColumnConfig[] = [
    // ⏱️ Thời gian thực hiện
    createEnhancedColumnConfig("timestamp", 2, 2, 120, 100, {
        flexGrow: 0,
        contentBased: false,
        hideAt: "sm",
    }),

    // ⚙️ Hành động thực hiện (Create / Update / Delete / etc.)
    createEnhancedColumnConfig("action", 3, 3, 160, 120, {
        flexGrow: 1,
        contentBased: false,
        alwaysVisible: true,
    }),

    // 👤 Người thực hiện hành động
    createEnhancedColumnConfig("actorName", 4, 4, 180, 120, {
        flexGrow: 2,
        contentBased: false,
        hideAt: "sm",
    }),

    // 🎯 Đối tượng bị tác động (targeted actor)
    createEnhancedColumnConfig("data1", 5, 5, 180, 120, {
        flexGrow: 2,
        contentBased: false,
        hideAt: "md",
    }),

    // ✅ Kết quả hành động (success / failed)
    createEnhancedColumnConfig("result", 6, 6, 120, 80, {
        contentBased: false,
        hideAt: "lg",
    }),

    createEnhancedColumnConfig("actions", 7, 7, 80, 80, {
        alwaysVisible: true,
    }),
];

const AUDITLOG_EXPANDABLE_CONFIG: ExpandableFieldConfig[] = [
    {
        key: "id",
        label: "Audit Log ID",
        alwaysShow: true,
    },
    {
        key: "actorName",
        label: "Actor",
        hideAt: "md",
    },
    {
        key: "data1",
        label: "Targeted Actor",
        hideAt: "lg",
    },
    {
        key: "action",
        label: "Action",
        hideAt: "sm",
    },
    {
        key: "result",
        label: "Result",
        hideAt: "sm",
    },
    {
        key: "timestamp",
        label: "Timestamp",
        hideAt: "md",
    },
];

export function EnhancedAuditLogTable({
    table,
    columns,
    isLoading,
    emptyState,
}: AuditLogTableProps) {
    return (
        <EnhancedExpandableTable
            table={table}
            columns={columns}
            isLoading={isLoading}
            tableConfig={AUDITLOG_TABLE_CONFIG}
            expandableConfig={{
                getRowId: (auditLog) => auditLog.id,
                fields: AUDITLOG_EXPANDABLE_CONFIG,
            }}
            emptyState={emptyState}
            debugMode={process.env.NODE_ENV === "development"}
        />
    );
}
