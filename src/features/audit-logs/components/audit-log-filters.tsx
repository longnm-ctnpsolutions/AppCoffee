"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { AuditLog } from "../types/audit-log.types";

interface AuditLogFiltersProps {
    table: Table<AuditLog>;
}

export function AuditLogFilters({ table }: AuditLogFiltersProps) {
    return (
        <Select
            onValueChange={(value) => {
                if (value === "all") {
                    table.getColumn("result")?.setFilterValue(undefined);
                } else {
                    // Map 'Active' to 1 and 'Inactive' to 0
                    const statusValue = value === "Success" ? "1" : "0";
                    table.getColumn("result")?.setFilterValue(statusValue);
                }
            }}
        >
            <SelectTrigger
                className="no-ring-select w-auto gap-1 border-none bg-transparent hover:bg-accent outline-none"
            >
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
        </Select>
    );
}