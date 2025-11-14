"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";

interface ConfirmationDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    actionLabel?: string;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ConfirmationDialog({
    trigger,
    title,
    description,
    actionLabel = "Continue",
    isLoading = false,
    onConfirm,
    variant = 'default',
    open,
    onOpenChange
}: ConfirmationDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col">
                <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>

                    </AlertDialogHeader>
                </div>
                <div className="flex-1 overflow-y-auto max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </div>

                <AlertDialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4 pt-4">
                    <AlertDialogCancel className="w-full" disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={`w-full ${variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            actionLabel
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
}
