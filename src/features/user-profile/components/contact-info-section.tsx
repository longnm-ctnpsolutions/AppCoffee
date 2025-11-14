"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { AtSign, Copy, AlertCircle } from "lucide-react";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useToast } from "@/shared/hooks/use-toast";
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface ContactInfoSectionProps {
    form: UseFormReturn<UserProfileSchema>;
    isPending?: boolean;
    disabled?: boolean;
}

export function ContactInfoSection({
    form,
    isPending,
    disabled = false,
}: ContactInfoSectionProps) {
    const { toast } = useToast();
    const email = form.getValues("email");

    const [activeTooltip, setActiveTooltip] = React.useState<string | null>(
        null
    );
    const isDisabled = disabled || isPending;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copied to clipboard",
                description: "The email address has been copied.",
            });
        });
    };

    function validatePhone(value: string): string | null {
        const phoneRegex = /^[0-9]{8,15}$/;
        if (!value) return "Phone number is required";
        if (!phoneRegex.test(value)) return "Invalid phone number";
        return null; // hợp lệ
    }

    return (
        <Card className="bg-white dark:bg-card shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <AtSign className="h-5 w-5 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{email}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(email)}
                        >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={
                                        form.formState.errors.phone
                                            ? "text-destructive"
                                            : ""
                                    }
                                >
                                    Phone
                                </FormLabel>
                                <FormControl>
                                    <Tooltip open={activeTooltip === "phone"}>
                                        <TooltipTrigger asChild>
                                            <div className="relative w-full">
                                                <Input
                                                    {...field}
                                                    autoComplete="off"
                                                    value={field.value ?? ""}
                                                    placeholder="Enter phone number"
                                                    disabled={isDisabled}
                                                    className={
                                                        form.formState.errors
                                                            .phone
                                                            ? "pr-10 border-destructive"
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        field.onChange(value);

                                                        // gọi hàm validate
                                                        const error =
                                                            validatePhone(
                                                                value
                                                            );
                                                        if (error) {
                                                            form.setError(
                                                                "phone",
                                                                {
                                                                    message:
                                                                        error,
                                                                }
                                                            );
                                                            setActiveTooltip(
                                                                "phone"
                                                            );
                                                        } else {
                                                            form.clearErrors(
                                                                "phone"
                                                            );
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        // khi mất focus thì đóng tooltip
                                                        setActiveTooltip(null);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            form.formState
                                                                .errors.phone
                                                        ) {
                                                            setActiveTooltip(
                                                                "phone"
                                                            );
                                                        } else {
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                />
                                                {form.formState.errors
                                                    .phone && (
                                                    <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        {form.formState.errors.phone && (
                                            <TooltipContent
                                                side="bottom"
                                                align="start"
                                                sideOffset={0}
                                                className="bg-destructive text-white text-xs"
                                            >
                                                <p>
                                                    {
                                                        form.formState.errors
                                                            .phone.message
                                                    }
                                                </p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Email{" "}
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="your.email@example.com"
                                        {...field}
                                        disabled
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
