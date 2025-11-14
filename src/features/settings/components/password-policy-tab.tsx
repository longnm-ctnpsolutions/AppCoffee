"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { KeyRound, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import { usePasswordPolicy } from "@/context/system-settings-context";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface ValidationErrors {
    passwordHistoryCount?: string;
    passwordExpiryDays?: string;
}

interface ValidationStatus {
    passwordHistoryCount: {
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    };
    passwordExpiryDays: {
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    };
}

interface PasswordPolicyTabProps {
    passwordHistoryCount: number;
    passwordExpiryDays: number;
    onPasswordHistoryChange: (value: string) => void;
    onPasswordExpiryChange: (value: string) => void;
    validationErrors?: ValidationErrors;
    validationStatus?: ValidationStatus;
    activeTooltip?: "passwordHistoryCount" | "passwordExpiryDays" | null;
    onTooltipChange?: (
        field: "passwordHistoryCount" | "passwordExpiryDays" | null
    ) => void;
    disabled?: boolean;
}

export function PasswordPolicyTab({
    passwordHistoryCount,
    passwordExpiryDays,
    onPasswordHistoryChange,
    onPasswordExpiryChange,
    validationErrors = {},
    validationStatus = {
        passwordHistoryCount: { isValidating: false, isValid: null },
        passwordExpiryDays: { isValidating: false, isValid: null },
    },
    activeTooltip = null,
    onTooltipChange = () => { },
    disabled = false,
}: PasswordPolicyTabProps) {
    const { isPasswordPolicyLoading, passwordPolicyError } =
        usePasswordPolicy();

    const getFieldError = (
        field: "passwordHistoryCount" | "passwordExpiryDays"
    ) => {
        const error = validationErrors[field];
        const status = validationStatus[field];
        return error || status?.error;
    };

    const getFieldStatus = (
        field: "passwordHistoryCount" | "passwordExpiryDays"
    ) => {
        const status = validationStatus[field];
        return {
            hasError: !!validationErrors[field] || status?.isValid === false,
            isValidating: status?.isValidating,
            isValid: status?.isValid === true && !validationErrors[field],
        };
    };

    const handleFieldClick = (
        field: "passwordHistoryCount" | "passwordExpiryDays",
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        const status = getFieldStatus(field);
        if (status.hasError) {
            onTooltipChange(activeTooltip === field ? null : field);
        } else {
            onTooltipChange(null);
        }
    };

    const handleInputChange = (
        field: "passwordHistoryCount" | "passwordExpiryDays",
        value: string
    ) => {
        // Chỉ cho phép số và chuỗi rỗng
        // if (value === "" || /^\d+$/.test(value)) {
        //     const num = Number(value);

        //     if (field === "passwordHistoryCount") {

        //         if (value !== "" && (num < 1 || num > 10)) {
        //             getFieldError(field);
        //             return; // Không cập nhật nếu nằm ngoài khoảng
        //         } else {
        //             onPasswordHistoryChange(value);
        //         }
        //     } else {
        //         if (value !== "" && (num < 1 || num > 360)) {
        //             return;
        //         } else {
        //             onPasswordExpiryChange(value);
        //         }
        //     }
        // }

        if (value === "" || /^\d+$/.test(value)) {
            const num = Number(value);

            if (field === "passwordHistoryCount") {
                if (value !== "" && (num < 1 || num > 10)) {
                    validationErrors[field] = `${field === "passwordHistoryCount"
                        ? "Password history restriction"
                        : "Password expiry days"
                        } must be between 1 and 10`;
                    validationStatus[field] = {
                        isValid: false,
                        isValidating: false,
                    };
                    return;
                } else {
                    onPasswordHistoryChange(value);
                }
            } else if (field === "passwordExpiryDays") {
                if (value !== "" && (num < 1 || num > 360)) {
                    validationErrors[field] = "Password expiry days must be between 1 and 360";
                    validationStatus[field] = {
                        isValid: false,
                        isValidating: false,
                    };
                    return;
                } else {
                    onPasswordExpiryChange(value);
                }
            }
        }
    };

    if (isPasswordPolicyLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <KeyRound className="h-6 w-6" />
                    <CardTitle className="text-lg">Password Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (passwordPolicyError) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <KeyRound className="h-6 w-6" />
                    <CardTitle className="text-lg">Password Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive">
                        {passwordPolicyError}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const historyStatus = getFieldStatus("passwordHistoryCount");
    const expiryStatus = getFieldStatus("passwordExpiryDays");
    const historyError = getFieldError("passwordHistoryCount");
    const expiryError = getFieldError("passwordExpiryDays");

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <KeyRound className="h-6 w-6" />
                <CardTitle className="text-lg">Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label
                        htmlFor="password-history"
                        className={`font-semibold ${historyStatus.hasError ? "text-red-500" : ""
                            }`}
                    >
                        Password History Restriction
                    </Label>
                    <Tooltip open={activeTooltip === "passwordHistoryCount" || historyStatus.hasError}>
                        <TooltipTrigger asChild>
                            <div className="relative w-24">
                                <Input
                                    id="password-history"
                                    type="text"
                                    inputMode="numeric"
                                    value={passwordHistoryCount}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "passwordHistoryCount",
                                            e.target.value
                                        )
                                    }
                                    onClick={(e) =>
                                        handleFieldClick(
                                            "passwordHistoryCount",
                                            e
                                        )
                                    }
                                    className={`w-24 ${historyStatus.hasError
                                        ? "border-red-500"
                                        : ""
                                        } ${historyStatus.isValid
                                            ? "border-green-500"
                                            : ""
                                        } pr-10`}
                                    disabled={disabled}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    {historyStatus.isValidating && (
                                        <RefreshCcw className="w-4 h-4 animate-spin text-gray-400" />
                                    )}
                                    {historyStatus.isValid &&
                                        !historyStatus.isValidating && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                    {historyStatus.hasError &&
                                        !historyStatus.isValidating && (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                </div>
                            </div>
                        </TooltipTrigger>
                        {historyStatus.hasError && (
                            <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                                onPointerDownOutside={(e) => e.preventDefault()}
                            >
                                <p>{historyError}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <p className="text-sm text-muted-foreground">
                        User cannot reuse the last {passwordHistoryCount || 0}{" "}
                        passwords
                    </p>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label
                        htmlFor="password-expiry"
                        className={`font-semibold ${expiryStatus.hasError ? "text-red-500" : ""
                            }`}
                    >
                        Password Expiry (days)
                    </Label>
                    <Tooltip open={activeTooltip === "passwordExpiryDays" || expiryStatus.hasError}>
                        <TooltipTrigger asChild>
                            <div className="relative w-24">
                                <Input
                                    id="password-expiry"
                                    type="text"
                                    inputMode="numeric"
                                    value={passwordExpiryDays}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "passwordExpiryDays",
                                            e.target.value
                                        )
                                    }
                                    onClick={(e) =>
                                        handleFieldClick(
                                            "passwordExpiryDays",
                                            e
                                        )
                                    }
                                    className={`w-24 ${expiryStatus.hasError
                                        ? "border-red-500"
                                        : ""
                                        } ${expiryStatus.isValid
                                            ? "border-green-500"
                                            : ""
                                        } pr-10`}
                                    disabled={disabled}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                    {expiryStatus.isValidating && (
                                        <RefreshCcw className="w-4 h-4 animate-spin text-gray-400" />
                                    )}
                                    {expiryStatus.isValid &&
                                        !expiryStatus.isValidating && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        )}
                                    {expiryStatus.hasError &&
                                        !expiryStatus.isValidating && (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                </div>
                            </div>
                        </TooltipTrigger>
                        {expiryStatus.hasError && (
                            <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                                onPointerDownOutside={(e) => e.preventDefault()}
                            >
                                <p>{expiryError}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <p className="text-sm text-muted-foreground">
                        Force password change after {passwordExpiryDays || 0}{" "}
                        days (except AD accounts)
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
