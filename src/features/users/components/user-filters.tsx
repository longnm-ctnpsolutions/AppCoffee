
"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";

import type { User } from "@/features/users/types/user.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

interface UserFiltersProps {
    table: Table<User>;
}

export function UserFilters({ table }: UserFiltersProps) {
    return (
        <Select
            onValueChange={(value) => {
                if (value === "all") {
                    table.getColumn("lockoutEnabled")?.setFilterValue(undefined);
                } else {
                    const statusValue = value === "Active" ? false : true;
                    table.getColumn("lockoutEnabled")?.setFilterValue(statusValue);
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
        </Select>
    );
}
