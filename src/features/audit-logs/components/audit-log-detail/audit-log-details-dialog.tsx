"use client";

import * as React from "react";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";

interface AuditLogDetailsDialogProps {
  details: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailsDialog({
  details,
  open,
  onOpenChange,
}: AuditLogDetailsDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col">
        <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
          <DialogHeader>
            <DialogTitle className="max-sm:text-left">Audit Log Detail</DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-3 text-sm p-1 max-sm:p-4 max-sm:overflow-y-auto">
          {/* Common row */}
          {[
            { label: "Action", value: details?.action },
            { label: "Timestamp", value: details?.timestamp },
            { label: "Actor", value: details?.actorName },
            { label: "Target", value: details?.targetType },
          ].map(
            (item) =>
              item.value && (
                <div
                  key={item.label}
                  className="flex items-center gap-3 max-sm:gap-2"
                >
                  <Label className="w-28 text-left max-sm:w-24">{item.label}</Label>
                  <Input
                    value={item.value}
                    readOnly
                    className="bg-gray-100 border-gray-300 text-gray-700 flex-1 max-sm:text-xs"
                  />
                </div>
              )
          )}

          {/* Result */}
          <div className="flex items-center gap-3 max-sm:gap-2">
            <Label className="w-28 text-left max-sm:w-24">Result</Label>
            <div className="relative flex-1">
              <Input
                readOnly
                className="bg-gray-100 border-gray-300 text-gray-700 w-full"
                value=" "
              />
              {details?.result && (
                <Badge
                  variant="secondary"
                  className={`
            absolute left-2 top-1/2 -translate-y-1/2
            px-3 text-sm font-medium
            max-sm:px-2 max-sm:py-0.5 max-sm:text-[12px] max-sm:font-normal
                ${details.result.toLowerCase() === "success"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : details.result.toLowerCase() === "failed"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }
              `}
                >
                  {details.result}
                </Badge>
              )}
            </div>
          </div>

          {/* IP */}
          <div className="flex items-center gap-3 max-sm:gap-2">
            <Label className="w-28 text-left max-sm:w-24">IP</Label>
            <Input
              value={details?.ipAddress ?? ""}
              readOnly
              className="bg-gray-100 border-gray-300 text-gray-700 flex-1 max-sm:text-xs"
            />
          </div>

          <div className="flex items-start gap-3 max-sm:gap-2">
            <Label className="w-28 text-left max-sm:w-24 mt-2">Browser</Label>
            <div
              className="
      bg-gray-100 border border-gray-300 text-gray-700 flex-1
      max-sm:text-xs min-h-[48px] py-2 px-3 rounded-md
      leading-snug whitespace-pre-wrap break-words
    "
            >
              {details?.browserAgent ?? ""}
            </div>
          </div>

          {/* Detail JSON */}
          {details?.details && (
            <div className="flex items-start gap-3 max-sm:gap-2">
              <Label className="w-28 text-left max-sm:w-24 mt-2">Detail JSON</Label>
              <Textarea
                value={JSON.stringify(details.details, null, 2)}
                readOnly
                className="bg-gray-100 border-gray-300 text-gray-700 font-mono text-xs flex-1 min-h-[200px]"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

  );
}