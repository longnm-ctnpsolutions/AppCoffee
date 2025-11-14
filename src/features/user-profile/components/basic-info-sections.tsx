"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { CalendarIcon, KeyRound, Copy, AlertCircle } from "lucide-react";
import { format } from "date-fns";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/shared/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Calendar } from "@/shared/components/ui/calendar";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types";
import { useState } from "react";
import ChangePasswordDialog from "@/features/user-profile/components/change-password-dialog";
import { useAuthActions } from "@/shared/context/auth-context";
import { useFilesActions } from "@/shared/context/files-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface BasicInfoSectionProps {
    form: UseFormReturn<UserProfileSchema>;
    isPending?: boolean;
    disabled?: boolean;
}

export function BasicInfoSection({
    form,
    isPending,
    disabled = false,
}: BasicInfoSectionProps) {
    const { toast } = useToast();

    const { changePassword } = useAuthActions();
    const { addFile } = useFilesActions();

    const isDisabled = disabled || isPending;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Copied to clipboard",
                description: "The user ID has been copied.",
            });
        });
    };

    const handleChangePassword = async (
        currentPassword: string,
        newPassword: string
    ) => {
        const userId = form.getValues("userId");
        return await changePassword(userId, currentPassword, newPassword);
    };

    const [open, setOpen] = useState(false);

    const userId = form.getValues("userId");

    const imageUrl = form.getValues("image");

    const connection = form.getValues("connection");

    const inputRef = React.useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = React.useState<string>(
        "https://placehold.co/112x112.png"
    );

    const handleAvatarClick = () => {
        // Chỉ cho phép click khi không bị disabled
        if (!disabled) {
            inputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const API_BASE_URL = "https://api.identity.dev.ctnp.com";

        if (!file) return;

        const uploadedFile = await addFile({
            container: "",
            userId: "",
            file: file,
        });

        if (uploadedFile) {
            const fullUrl = `${API_BASE_URL}/files/${uploadedFile.name}`;
            form.setValue("image", fullUrl, { shouldDirty: true });
        }
    };

    const [activeTooltip, setActiveTooltip] = React.useState<string | null>(
        null
    );

    function validateRequired(value: string, label: string): string | null {
        if (!value || value.trim() === "") {
            return `${label} is required`;
        }
        return null;
    }

    return (
        <Card className="bg-white dark:bg-card shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Row 1: Avatar and ID Section */}
                <div className="flex items-center gap-4">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={inputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={disabled}
                        />
                        <Avatar
                            className={cn(
                                "h-24 w-24 border-2 border-muted transition-all duration-200",
                                !disabled &&
                                    "cursor-pointer hover:border-blue-500 hover:shadow-lg"
                            )}
                            onClick={handleAvatarClick}
                        >
                            <AvatarImage
                                src={imageUrl || imagePreview}
                                alt="User avatar"
                            />
                            <AvatarFallback>LN</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                ID: {userId}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(userId)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        {connection === "Database" && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full max-w-xs"
                                onClick={() => setOpen(true)}
                            >
                                <KeyRound className="mr-2 h-4 w-4 hidden sm:inline-block" />
                                Change your password
                            </Button>
                        )}
                        <ChangePasswordDialog
                            open={open}
                            onOpenChange={setOpen}
                            onChangePassword={handleChangePassword}
                        />
                    </div>
                </div>

                {/* Row 2: First Name and Last Name */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={
                                        form.formState.errors.firstName
                                            ? "text-destructive"
                                            : ""
                                    }
                                >
                                    First Name{" "}
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Tooltip
                                        open={activeTooltip === "firstName"}
                                    >
                                        <TooltipTrigger asChild>
                                            <div className="relative w-full">
                                                <Input
                                                    {...field}
                                                    autoComplete="off"
                                                    value={field.value ?? ""}
                                                    placeholder="Enter first name"
                                                    disabled={isDisabled}
                                                    className={
                                                        form.formState.errors
                                                            .firstName
                                                            ? "pr-10 border-destructive"
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        field.onChange(value);

                                                        const error =
                                                            validateRequired(
                                                                value,
                                                                "First Name"
                                                            );
                                                        if (error) {
                                                            form.setError(
                                                                "firstName",
                                                                {
                                                                    message:
                                                                        error,
                                                                }
                                                            );
                                                            setActiveTooltip(
                                                                "firstName"
                                                            );
                                                        } else {
                                                            form.clearErrors(
                                                                "firstName"
                                                            );
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setActiveTooltip(null);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            form.formState
                                                                .errors
                                                                .firstName
                                                        ) {
                                                            setActiveTooltip(
                                                                "firstName"
                                                            );
                                                        } else {
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                />
                                                {form.formState.errors
                                                    .firstName && (
                                                    <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        {form.formState.errors.firstName && (
                                            <TooltipContent
                                                side="bottom"
                                                align="start"
                                                sideOffset={0}
                                                className="bg-destructive text-white text-xs"
                                            >
                                                <p>
                                                    {
                                                        form.formState.errors
                                                            .firstName.message
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
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel
                                    className={
                                        form.formState.errors.lastName
                                            ? "text-destructive"
                                            : ""
                                    }
                                >
                                    Last Name{" "}
                                    <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Tooltip
                                        open={activeTooltip === "lastName"}
                                    >
                                        <TooltipTrigger asChild>
                                            <div className="relative w-full">
                                                <Input
                                                    {...field}
                                                    autoComplete="off"
                                                    value={field.value ?? ""}
                                                    placeholder="Enter last name"
                                                    disabled={isDisabled}
                                                    className={
                                                        form.formState.errors
                                                            .lastName
                                                            ? "pr-10 border-destructive"
                                                            : ""
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value;
                                                        field.onChange(v);

                                                        const err =
                                                            validateRequired(
                                                                v,
                                                                "Last Name"
                                                            );
                                                        if (err) {
                                                            form.setError(
                                                                "lastName",
                                                                {
                                                                    type: "manual",
                                                                    message:
                                                                        err,
                                                                }
                                                            );
                                                            setActiveTooltip(
                                                                "lastName"
                                                            );
                                                        } else {
                                                            form.clearErrors(
                                                                "lastName"
                                                            );
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                    onBlur={() =>
                                                        setActiveTooltip(null)
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            form.formState
                                                                .errors.lastName
                                                        ) {
                                                            setActiveTooltip(
                                                                "lastName"
                                                            );
                                                        } else {
                                                            setActiveTooltip(
                                                                null
                                                            );
                                                        }
                                                    }}
                                                />
                                                {form.formState.errors
                                                    .lastName && (
                                                    <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none" />
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        {form.formState.errors.lastName && (
                                            <TooltipContent
                                                side="bottom"
                                                align="start"
                                                sideOffset={0}
                                                className="bg-destructive text-white text-xs"
                                            >
                                                <p>
                                                    {
                                                        form.formState.errors
                                                            .lastName
                                                            .message as string
                                                    }
                                                </p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Row 3: Remaining Inputs */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:col-span-1">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select
                                        onValueChange={(val) =>
                                            field.onChange(Number(val))
                                        }
                                        value={field.value?.toString()}
                                        disabled={isDisabled}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="0">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="1">
                                                Female
                                            </SelectItem>
                                            <SelectItem value="2">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Birth Date{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground"
                                                    )}
                                                    disabled={isDisabled}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            "MM/dd/yyyy"
                                                        )
                                                    ) : (
                                                        <span>
                                                            Select birth date
                                                        </span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() ||
                                                    date <
                                                        new Date("1900-01-01")
                                                }
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
