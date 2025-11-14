"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/shared/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Eye, EyeOff } from "lucide-react";


interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChangePassword: (confirmPassword: string) => Promise<boolean> | boolean;
}

// ✅ Schema validate với zod
const formSchema = z
    .object({
        newPassword: z
            .string()
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function ChangePasswordDialog({ open, onOpenChange, onChangePassword }: ChangePasswordDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });


    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const newPassword = form.watch("newPassword");
    const confirmPassword = form.watch("confirmPassword");

    const isAllFilled = !!newPassword && !!confirmPassword;

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!open) {
            form.reset();
        }
    }, [open, form]);

    const onSubmit = async () => {
        const confirmPassword = form.getValues("confirmPassword")
        const success = await onChangePassword(confirmPassword);

        if (success) {
            form.reset();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[400px] max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
                    <DialogHeader>
                        <DialogTitle className="max-sm:text-left">Change Your Password</DialogTitle>
                    </DialogHeader>
                </div>

                {/* ✅ Form */}
                <div className="flex-1 overflow-y-auto max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>New password</FormLabel>
                                            <FormControl>
                                                <TooltipProvider>
                                                    <Tooltip
                                                        open={
                                                            activeTooltip === "newPassword" &&
                                                            !!form.formState.errors.newPassword
                                                        }
                                                    >
                                                        <TooltipTrigger asChild>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showNewPassword ? "text" : "password"}
                                                                    placeholder="New password"
                                                                    className={
                                                                        form.formState.errors.newPassword
                                                                            ? "mt-1 border-destructive pr-10"
                                                                            : "mt-1 pr-10"
                                                                    }
                                                                    {...field}
                                                                    onFocus={() => setActiveTooltip("newPassword")}
                                                                    onBlur={() => setActiveTooltip(null)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                                                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                                                    tabIndex={-1}
                                                                >
                                                                    {showNewPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs"
                                                        >
                                                            {form.formState.errors.newPassword?.message}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormControl>
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel>Confirm password</FormLabel>
                                            <FormControl>
                                                <TooltipProvider>
                                                    <Tooltip
                                                        open={
                                                            activeTooltip === "confirmPassword" &&
                                                            !!form.formState.errors.confirmPassword
                                                        }
                                                    >
                                                        <TooltipTrigger asChild>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirm password"
                                                                    className={
                                                                        form.formState.errors.confirmPassword
                                                                            ? "mt-1 border-destructive pr-10"
                                                                            : "mt-1 pr-10"
                                                                    }
                                                                    {...field}
                                                                    onFocus={() => setActiveTooltip("confirmPassword")}
                                                                    onBlur={() => setActiveTooltip(null)}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                                                                    onClick={() =>
                                                                        setShowConfirmPassword((prev) => !prev)
                                                                    }
                                                                    tabIndex={-1}
                                                                >
                                                                    {showConfirmPassword ? (
                                                                        <EyeOff className="h-4 w-4" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs"
                                                        >
                                                            {form.formState.errors.confirmPassword?.message}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormControl>
                                        </FormItem>
                                    );
                                }}
                            />

                        </form>
                    </Form>
                </div>

                <DialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="w-full"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={!isAllFilled}
                    >
                        Save
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
