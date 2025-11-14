// MFA Configuration Types
export type MfaConfiguration = {
    twoFactorEnabled: boolean;
    loginAlertEnabled: boolean;
};

export type LoginSecurity = {
    maxFailedLogin: number;
};

export type FailedAttemptTime = {
    failedAttemptTime: number;
};

export type UpdateFailedAttemptTime = {
    failedAttemptTime: number;
};

export type UpdateLoginSecurity = {
    maxFailedLogin: number;
};

export type UpdateMfaConfigurationRequest = {
    twoFactorEnabled: boolean;
    loginAlertEnabled: boolean;
};

// Password Policy Types
export type PasswordPolicy = {
    passwordHistoryCount: number;
    passwordExpiryDays: number;
};

export type UpdatePasswordPolicyRequest = {
    passwordHistoryCount: number;
    passwordExpiryDays: number;
};

// System Settings (if needed)
export type SystemSettings = {
    settingKey: string;
    settingValue: string;
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
};
