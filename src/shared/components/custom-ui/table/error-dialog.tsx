"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { X } from "lucide-react"

interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
}

export function ErrorDialog({
  open,
  onOpenChange,
  title,
  description,
}: ErrorDialogProps) {

  const handleClose = () => onOpenChange(false)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#ffe5e0] max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col">
        <div className="border-b-2 pb-2 max-sm:p-4 max-sm:border-b-2">
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>{title}</AlertDialogTitle>

              {/* Nút X */}
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </AlertDialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
