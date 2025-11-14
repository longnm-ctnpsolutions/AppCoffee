"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { LockKeyhole, ShieldCheck, Mail } from "lucide-react";
import { useMfaConfiguration } from "@/context/system-settings-context";
import { Skeleton } from "@/shared/components/ui/skeleton";
import React from "react";
import { useToast } from "@/shared/hooks/use-toast";

interface AuthenticationTabProps {
    twoFactorEnabled: boolean;
    onTwoFactorChange: (enabled: boolean) => void;
    maxFailedLoginChange: number;
    onMaxFailedLoginChange: (num: number) => void;
    failedAttemptTimeChange: number;
    onFailedAttemptTimeChange: (num: number) => void;
    loginAlertEnabled: boolean;
    onLoginAlertChange: (enabled: boolean) => void;
    disabled?: boolean;
}

export function AuthenticationTab({
    twoFactorEnabled,
    onTwoFactorChange,
    maxFailedLoginChange,
    onMaxFailedLoginChange,
    failedAttemptTimeChange,
    onFailedAttemptTimeChange,
    loginAlertEnabled,
    onLoginAlertChange,
    disabled = false,
}: AuthenticationTabProps) {
    const { isMfaLoading, mfaError } = useMfaConfiguration();
    // const [valueTimeWindow, setValueTimeWindow] = React.useState(10);

    const { toast } = useToast();

    // const handleChange = (e: any) => {
    //     const value = parseInt(e.target.value, 10);
    //     if (value > 60) {
    //         toast({
    //             title: "Error",
    //             description: "Max 60",
    //             variant: "destructive",
    //         });
    //     }
    //     setValueTimeWindow(value);
    // };

    const handleMfaChange = (checked: boolean) => {
        onTwoFactorChange(checked);
    };

    const handleLoginAlertChange = (checked: boolean) => {
        onLoginAlertChange(checked);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <ShieldCheck className="h-6 w-6" />
                    <CardTitle className="text-lg">MFA Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isMfaLoading ? (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-11" />
                        </div>
                    ) : mfaError ? (
                        <p className="text-sm text-destructive">{mfaError}</p>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label
                                    htmlFor="mfa-switch"
                                    className="font-semibold"
                                >
                                    Enable MFA
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    MFA Methods: Authenticator App (TOTP)
                                </p>
                            </div>
                            <Switch
                                id="mfa-switch"
                                checked={twoFactorEnabled}
                                onCheckedChange={handleMfaChange}
                                disabled={disabled}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Mail className="h-6 w-6" />
                    <CardTitle className="text-lg">
                        Login Alert Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isMfaLoading ? (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <Skeleton className="h-6 w-11" />
                        </div>
                    ) : mfaError ? (
                        <p className="text-sm text-destructive">{mfaError}</p>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label
                                    htmlFor="login-alert-switch"
                                    className="font-semibold"
                                >
                                    Enable Email Alert
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Send an email notification when a login is
                                    detected from a new IP address or device.
                                </p>
                            </div>
                            <Switch
                                id="login-alert-switch"
                                checked={loginAlertEnabled}
                                onCheckedChange={handleLoginAlertChange}
                                disabled={disabled}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <LockKeyhole className="h-6 w-6" />
                    <CardTitle className="text-lg">Login Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-sm space-y-2">
                        <Label htmlFor="login-attempts">
                            Max Failed Login Attempts
                        </Label>
                        <Input
                            id="login-attempts"
                            type="number"
                            className="w-24"
                            max={10}
                            value={maxFailedLoginChange}
                            min={3}
                            disabled={disabled}
                            onChange={(e => onMaxFailedLoginChange(parseInt(e.target.value)))}
                        />
                        <p className="text-sm text-muted-foreground">
                            Lock account after this number of failed logins
                        </p>
                    </div>

                    <hr className="my-6 border-t border-gray-300" />

                    <div className="max-w-sm space-y-2">
                        <Label htmlFor="failed-attempts">
                            Failed Attempt Time Window (minutes)
                        </Label>
                        <Input
                            id="failed-attempts"
                            type="number"
                            className="w-24"
                            max={60}
                            value={failedAttemptTimeChange}
                            min={1}
                            disabled={disabled}
                            onChange={(e => onFailedAttemptTimeChange(parseInt(e.target.value)))}
                        />
                        <p className="text-sm text-muted-foreground">
                            Count failed login attempts within this time window.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
