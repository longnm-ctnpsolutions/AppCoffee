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
import { Client } from "../types/client.types";

interface ClientFiltersProps {
  table: Table<Client>;
}

export function ClientFilters({ table }: ClientFiltersProps) {
  return (
    <Select
      onValueChange={(value) => {
        if (value === "all") {
          table.getColumn("status")?.setFilterValue(undefined);
        } else {
          // Map 'Active' to 1 and 'Inactive' to 0
          const statusValue = value === "Active" ? "1" : "0";
          table.getColumn("status")?.setFilterValue(statusValue);
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