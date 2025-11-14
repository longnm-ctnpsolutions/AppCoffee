"use client";

import { useEffect, useState, useRef } from "react";
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { AuthenticationTab } from "@/features/settings/components/authentication-tab";
import { PasswordPolicyTab } from "@/features/settings/components/password-policy-tab";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
    useSystemSettingsState,
    useSystemSettingsActions,
} from "@/context/system-settings-context";
import { useSystemSettingsValidation } from "@/features/settings/hooks/use-system-settings-validation";

export default function SettingsPage() {
    const { mfaConfig, passwordPolicy, loginSecurity, attemptTime } = useSystemSettingsState();
    const {
        fetchMfaConfiguration,
        fetchPasswordPolicy,
        fetchLoginSecurity,
        updateLoginSecurity,
        fetchFailedAttemptTime,
        updateFailedAttemptTime,
        updateMfaConfig,
        updatePasswordPolicyData,
    } = useSystemSettingsActions();

    const {
        validationErrors,
        validationStatus,
        validateField,
        validateForm,
        validateAllFieldsBeforeSave,
        clearValidationErrors,
        cleanup,
    } = useSystemSettingsValidation({
        onValidationChange: (hasErrors) => { },
    });

    // Local state for form
    const [isEditMode, setIsEditMode] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    // const [loginSecurityChange, setIsLoginSecurityChange] = useState(false);
    const [maxFailedLogin, setMaxFailedLogin] = useState(5);
    const [failedAttemptTime, setFailedAttemptTime] = useState(5);
    const [loginAlertEnabled, setLoginAlertEnabled] = useState(false);
    const [passwordHistoryCount, setPasswordHistoryCount] = useState("3");
    const [passwordExpiryDays, setPasswordExpiryDays] = useState("90");
    const [activeTooltip, setActiveTooltip] = useState<
        "passwordHistoryCount" | "passwordExpiryDays" | null
    >(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("authentication");
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchMfaConfiguration();
            fetchLoginSecurity();
            fetchFailedAttemptTime();
            fetchPasswordPolicy();
        }
    }, []);

    useEffect(() => {
        if (mfaConfig) {
            setTwoFactorEnabled(mfaConfig.twoFactorEnabled);
            setLoginAlertEnabled(mfaConfig.loginAlertEnabled);
        }
    }, [mfaConfig]);

    useEffect(() => {
        if (loginSecurity) {
            setMaxFailedLogin(loginSecurity.maxFailedLogin);
        }
    }, [loginSecurity]);

    useEffect(() => {
        if (attemptTime) {
            setFailedAttemptTime(attemptTime?.failedAttemptTime);
        }
    }, [attemptTime]);

    useEffect(() => {
        if (passwordPolicy) {
            setPasswordHistoryCount(
                String(passwordPolicy.passwordHistoryCount)
            );
            setPasswordExpiryDays(String(passwordPolicy.passwordExpiryDays));
        }
    }, [passwordPolicy]);

    const hasValidationErrors =
        Object.values(validationErrors).some(
            (error) => error !== undefined && error !== null
        ) ||
        validationStatus.passwordHistoryCount.isValid === false ||
        validationStatus.passwordExpiryDays.isValid === false;

    const historyNum = parseInt(passwordHistoryCount) || 0;
    const expiryNum = parseInt(passwordExpiryDays) || 0;

    const canSave =
        passwordHistoryCount !== "" &&
        passwordExpiryDays !== "" &&
        historyNum > 0 &&
        expiryNum > 0 &&
        !hasValidationErrors &&
        !validationStatus.passwordHistoryCount.isValidating &&
        !validationStatus.passwordExpiryDays.isValidating &&
        (twoFactorEnabled !== mfaConfig?.twoFactorEnabled ||
            loginAlertEnabled !== mfaConfig?.loginAlertEnabled ||
            historyNum !== passwordPolicy?.passwordHistoryCount ||
            expiryNum !== passwordPolicy?.passwordExpiryDays)

        || (maxFailedLogin !== loginSecurity?.maxFailedLogin) || (failedAttemptTime !== attemptTime?.failedAttemptTime);

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleInputChange = (
        field: "passwordHistoryCount" | "passwordExpiryDays",
        value: string
    ) => {
        if (field === "passwordHistoryCount") {
            setPasswordHistoryCount(value);
        } else {
            setPasswordExpiryDays(value);
        }

        if (validationErrors[field]) {
            clearValidationErrors(field);
            setActiveTooltip(null);
        }

        if (value !== "" && value !== "0") {
            validateField(field, value);
        }
    };

    const handleSave = async () => {
        const historyCount = parseInt(passwordHistoryCount) || 0;
        const expiryDays = parseInt(passwordExpiryDays) || 0;

        if (!validateForm(historyCount, expiryDays)) {
            return;
        }

        const isValid = await validateAllFieldsBeforeSave(
            historyCount,
            expiryDays
        );
        if (!isValid) {
            return;
        }

        setIsSaving(true);
        try {
            // Update MFA config if changed
            if (
                mfaConfig &&
                (mfaConfig.twoFactorEnabled !== twoFactorEnabled ||
                    mfaConfig.loginAlertEnabled !== loginAlertEnabled)
            ) {
                await updateMfaConfig({
                    twoFactorEnabled,
                    loginAlertEnabled,
                });
            }

            if (loginSecurity && loginSecurity.maxFailedLogin !== maxFailedLogin) {
                await updateLoginSecurity({ maxFailedLogin });
            }

            if (attemptTime && attemptTime.failedAttemptTime !== failedAttemptTime) {
                await updateFailedAttemptTime({ failedAttemptTime });
            }

            if (loginSecurity && loginSecurity.maxFailedLogin !== maxFailedLogin) {
                await updateLoginSecurity({ maxFailedLogin });
            }

            // Update Password Policy if changed
            if (
                passwordPolicy &&
                (passwordPolicy.passwordHistoryCount !== historyCount ||
                    passwordPolicy.passwordExpiryDays !== expiryDays)
            ) {
                await updatePasswordPolicyData({
                    passwordHistoryCount: historyCount,
                    passwordExpiryDays: expiryDays,
                });
            }

            clearValidationErrors();
            setActiveTooltip(null);
            setIsEditMode(false);
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (mfaConfig) {
            setTwoFactorEnabled(mfaConfig.twoFactorEnabled);
            setLoginAlertEnabled(mfaConfig.loginAlertEnabled);
        }
        if (loginSecurity) {
            setMaxFailedLogin(loginSecurity?.maxFailedLogin);
        }
        if (attemptTime) {
            setFailedAttemptTime(attemptTime?.failedAttemptTime);
        }
        if (passwordPolicy) {
            setPasswordHistoryCount(
                String(passwordPolicy.passwordHistoryCount)
            );
            setPasswordExpiryDays(String(passwordPolicy.passwordExpiryDays));
        }

        clearValidationErrors();
        setActiveTooltip(null);
        setIsEditMode(false);
    };

    const handleTabChange = (value: string) => {
        if (isEditMode) {
            handleCancel();
        }
        setActiveTab(value);
    };

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (
                !target.closest("[data-radix-popper-content-wrapper]") &&
                !target.closest("input") &&
                !target.closest('[data-state="open"]')
            ) {
                setActiveTooltip(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-background p-2 pb-0">
                <Card>
                    <CardContent className="p-6">
                        <SettingsHeader
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onEdit={handleEdit}
                            isEditMode={isEditMode}
                            canSave={canSave}
                            hasValidationErrors={hasValidationErrors}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 flex flex-col p-2 pt-4 overflow-hidden">
                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="flex flex-col h-full"
                >
                    <Card className="flex flex-col h-full">
                        <div className="p-6 pb-0">
                            <TabsList className="bg-transparent border-b rounded-none p-0 w-full justify-start">
                                <TabsTrigger
                                    value="authentication"
                                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none hover:text-foreground"
                                >
                                    Authentication
                                </TabsTrigger>
                                <TabsTrigger
                                    value="password"
                                    className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none hover:text-foreground"
                                >
                                    Password Policy
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <CardContent className="p-6">
                                <TabsContent
                                    value="authentication"
                                    className="mt-0"
                                >
                                    <AuthenticationTab
                                        twoFactorEnabled={twoFactorEnabled}
                                        onTwoFactorChange={setTwoFactorEnabled}
                                        loginAlertEnabled={loginAlertEnabled}
                                        onLoginAlertChange={
                                            setLoginAlertEnabled
                                        }
                                        maxFailedLoginChange={maxFailedLogin}
                                        onMaxFailedLoginChange={setMaxFailedLogin}
                                        failedAttemptTimeChange={failedAttemptTime}
                                        onFailedAttemptTimeChange={setFailedAttemptTime}
                                        disabled={!isEditMode}
                                    />
                                </TabsContent>
                                <TabsContent value="password" className="mt-0">
                                    <PasswordPolicyTab
                                        passwordHistoryCount={
                                            parseInt(passwordHistoryCount) || 0
                                        }
                                        passwordExpiryDays={
                                            parseInt(passwordExpiryDays) || 0
                                        }
                                        onPasswordHistoryChange={(value) =>
                                            handleInputChange(
                                                "passwordHistoryCount",
                                                value
                                            )
                                        }
                                        onPasswordExpiryChange={(value) =>
                                            handleInputChange(
                                                "passwordExpiryDays",
                                                value
                                            )
                                        }
                                        validationErrors={validationErrors}
                                        validationStatus={validationStatus}
                                        activeTooltip={activeTooltip}
                                        onTooltipChange={setActiveTooltip}
                                        disabled={!isEditMode}
                                    />
                                </TabsContent>
                            </CardContent>
                        </ScrollArea>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
}
