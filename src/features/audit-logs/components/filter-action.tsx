"use client";

import * as React from "react";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AuditLog } from "../types/audit-log.types";

interface FilterActionsProps {
  table: Table<AuditLog>;
}

export const FilterActions: React.FC<FilterActionsProps> = ({ table }) => {
  const [fromDate, setFromDate] = React.useState<Date>();
  const [toDate, setToDate] = React.useState<Date>();

  const [selectedAction, setSelectedAction] = useState("All")
  const [selectedResult, setSelectedResult] = React.useState("All")
  const [open, setOpen] = useState(false)

  const [actor, setActor] = React.useState("")

  const handleSelect = (action: string) => {
    setSelectedAction(action)
    setOpen(false)
  }

  const handleApply = () => {
    const timestampFilter = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;
    table.getColumn("timestamp")?.setFilterValue(timestampFilter);

    table.getColumn("action")?.setFilterValue(selectedAction === "All" ? undefined : selectedAction);

    table.getColumn("actorName")?.setFilterValue(actor.trim() || undefined);

    if (selectedResult === "All") {
      table.getColumn("result")?.setFilterValue(undefined);
    } else {
      table.getColumn("result")?.setFilterValue(selectedResult);
    }
  };

  const handleReset = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedAction("All");
    setActor("");
    setSelectedResult("All");

    table.resetColumnFilters();
  };

  return (
    <div
      className="
    w-full flex flex-wrap items-center justify-between gap-4
    max-[1477px]:grid max-[1477px]:grid-cols-2 max-[1477px]:gap-4
    max-sm:grid-cols-1
  "
    >
      {/* Nhóm 4 input */}
      <div
        className="
      flex flex-wrap items-center gap-3 flex-1 min-w-0
      max-[1477px]:contents
    "
      >
        {/* Date */}
        <div className="flex items-center gap-2 max-[1477px]:col-span-1 max-sm:flex-col max-sm:items-start max-sm:w-full">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Date
          </label>
          <div className="max-[1477px]:w-full max-sm:w-full">
            <DateRangePicker
              onChange={(range) => {
                if (!range) return;

                // Lấy giờ local để hiển thị picker
                const displayRange = range;

                // Convert sang UTC để filter API
                const fromUtc = range.from
                  ? new Date(Date.UTC(
                      range.from.getFullYear(),
                      range.from.getMonth(),
                      range.from.getDate(),
                      0, 0, 0
                    ))
                  : undefined;

                const toUtc = range.to
                  ? new Date(Date.UTC(
                      range.to.getFullYear(),
                      range.to.getMonth(),
                      range.to.getDate(),
                      23, 59, 59
                    ))
                  : undefined;

                setFromDate(fromUtc); // dùng cho filter API
                setToDate(toUtc);
              }}
              initialRange={
                // Hiển thị giờ local nhưng không convert
                fromDate && toDate
                  ? { 
                      from: new Date(fromDate.getTime() + fromDate.getTimezoneOffset() * 60000), 
                      to: new Date(toDate.getTime() + toDate.getTimezoneOffset() * 60000) 
                    }
                  : undefined
              }
            />

          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2 max-[1477px]:col-span-1 max-sm:flex-col max-sm:items-start max-sm:w-full">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Action
          </label>
          <Select
            value={selectedAction}
            onValueChange={(value) => setSelectedAction(value)}
          >
            <SelectTrigger className="w-[160px] h-[36px] px-3 border rounded-md bg-white text-sm text-muted-foreground max-[1477px]:w-full">
              <SelectValue placeholder="Choose action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="LOGIN_SUCCESS">LOGIN_SUCCESS</SelectItem>
              <SelectItem value="LOGOUT">LOGOUT</SelectItem>
              <SelectItem value="PASSWORD_RESET_SELF">PASSWORD_RESET_SELF</SelectItem>
              <SelectItem value="PASSWORD_RESET_ADMIN">PASSWORD_RESET_ADMIN</SelectItem>
              <SelectItem value="MFA_VERIFIED">MFA_VERIFIED</SelectItem>
              <SelectItem value="MFA_FAILED">MFA_FAILED</SelectItem>
              <SelectItem value="CREATE_USER">CREATE_USER</SelectItem>
              <SelectItem value="PASSWORD_RESET_ADMIN">PASSWORD_RESET_ADMIN</SelectItem>
              <SelectItem value="UPDATE_USER_INFO">UPDATE_USER_INFO</SelectItem>
              <SelectItem value="DEACTIVATE_USER">DEACTIVATE_USER</SelectItem>
              <SelectItem value="ACTIVATE_USER">ACTIVATE_USER</SelectItem>
              <SelectItem value="DELETE_USER">DELETE_USER</SelectItem>
              <SelectItem value="ASSIGN_PERMISSIONS">ASSIGN_PERMISSIONS</SelectItem>
              <SelectItem value="UNASSIGN_PERMISSIONS">UNASSIGN_PERMISSIONS</SelectItem>
              <SelectItem value="ASSIGN_ROLE">ASSIGN_ROLE</SelectItem>
              <SelectItem value="UNASSIGN_ROLE">UNASSIGN_ROLE</SelectItem>
              <SelectItem value="CREATE_ROLE">CREATE_ROLE</SelectItem>
              <SelectItem value="UPDATE_ROLE">UPDATE_ROLE</SelectItem>
              <SelectItem value="DELETE_ROLE">DELETE_ROLE</SelectItem>
              <SelectItem value="ASSIGN_PERMISSION_TO_ROLE">ASSIGN_PERMISSION_TO_ROLE</SelectItem>
              <SelectItem value="UNASSIGN_PERMISSION_FROM_ROLE">UNASSIGN_PERMISSION_FROM_ROLE</SelectItem>
              <SelectItem value="CREATE_CLIENT">CREATE_CLIENT</SelectItem>
              <SelectItem value="UPDATE_CLIENT">UPDATE_CLIENT</SelectItem>
              <SelectItem value="DELETE_CLIENT">DELETE_CLIENT</SelectItem>
              <SelectItem value="CREATE_PERMISSION">CREATE_PERMISSION</SelectItem>
              <SelectItem value="UPDATE_PERMISSION">UPDATE_PERMISSION</SelectItem>
              <SelectItem value="DELETE_PERMISSION">DELETE_PERMISSION</SelectItem>
              <SelectItem value="IMPORT_PERMISSION">IMPORT_PERMISSION</SelectItem>
              <SelectItem value="SYSTEM_CONFIG_CHANGE">SYSTEM_CONFIG_CHANGE</SelectItem>
              <SelectItem value="SUSPICIOUS_ACTIVITY_DETECTED">SUSPICIOUS_ACTIVITY_DETECTED</SelectItem>
              <SelectItem value="EXPORT_AUDIT_LOGS">EXPORT_AUDIT_LOGS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actor */}
        <div className="flex items-center gap-2 max-[1477px]:col-span-1 max-sm:flex-col max-sm:items-start max-sm:w-full">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Actor
          </label>
          <Input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Username"
            className="w-[160px] h-[36px] px-3 border rounded-md bg-white text-sm text-muted-foreground max-[1477px]:w-full"
          />
        </div>

        {/* Result */}
        <div className="flex items-center gap-2 max-[1477px]:col-span-1 max-sm:flex-col max-sm:items-start max-sm:w-full">
          <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Result
          </label>
          <Select
            value={selectedResult}
            onValueChange={(value) => setSelectedResult(value)}
          >
            <SelectTrigger className="w-[160px] h-[36px] px-3 border rounded-md bg-white text-sm text-muted-foreground max-[1477px]:w-full">
              <SelectValue placeholder="Choose result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 shrink-0 max-[1477px]:col-span-2 mt-2 max-sm:col-span-1 max-sm:w-full">
        <Button variant="secondary" onClick={handleReset} className="flex-1 sm:flex-none sm:w-auto">
          Reset
        </Button>
        <Button onClick={handleApply} className="flex-1 sm:flex-none sm:w-auto">
          Apply
        </Button>
      </div>
    </div>



  );
};
