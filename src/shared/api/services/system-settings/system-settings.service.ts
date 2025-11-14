
import {
    MfaConfiguration,
    UpdateMfaConfigurationRequest,
    PasswordPolicy,
    UpdatePasswordPolicyRequest,
    LoginSecurity,
    UpdateLoginSecurity,
    FailedAttemptTime,
    UpdateFailedAttemptTime,
} from "@/types/system-setting.types";

let mockMfaConfig: MfaConfiguration = { twoFactorEnabled: true, loginAlertEnabled: false };
let mockLoginSecurity: LoginSecurity = { maxFailedLogin: 5 };
let mockFailedAttemptTime: FailedAttemptTime = { failedAttemptTime: 10 };
let mockPasswordPolicy: PasswordPolicy = { passwordHistoryCount: 3, passwordExpiryDays: 90 };

// MFA Configuration APIs
export const getMfaConfiguration = async (): Promise<MfaConfiguration> => {
    console.log("Mocking getMfaConfiguration");
    return new Promise(resolve => setTimeout(() => resolve(mockMfaConfig), 300));
};

export const updateMfaConfiguration = async (
    data: UpdateMfaConfigurationRequest
): Promise<void> => {
    console.log("Mocking updateMfaConfiguration", data);
    return new Promise(resolve => {
        setTimeout(() => {
            mockMfaConfig = { ...mockMfaConfig, ...data };
            resolve();
        }, 500);
    });
};

// Login Security APIs
export const getLoginSecurity = async (): Promise<LoginSecurity> => {
     console.log("Mocking getLoginSecurity");
    return new Promise(resolve => setTimeout(() => resolve(mockLoginSecurity), 300));
};

export const updateLoginSecurityTern = async (
    data: UpdateLoginSecurity
): Promise<void> => {
     console.log("Mocking updateLoginSecurityTern", data);
     return new Promise(resolve => {
        setTimeout(() => {
            mockLoginSecurity = { ...mockLoginSecurity, ...data };
            resolve();
        }, 500);
    });
};

// failed attempt time window
export const getFailedAttemptTime = async (): Promise<FailedAttemptTime> => {
    console.log("Mocking getFailedAttemptTime");
    return new Promise(resolve => setTimeout(() => resolve(mockFailedAttemptTime), 300));
};

export const updateFailedAttemptTimeTern = async (
    data: UpdateFailedAttemptTime
): Promise<void> => {
     console.log("Mocking updateFailedAttemptTimeTern", data);
     return new Promise(resolve => {
        setTimeout(() => {
            mockFailedAttemptTime = { ...mockFailedAttemptTime, ...data };
            resolve();
        }, 500);
    });
};

// Password Policy APIs
export const getPasswordPolicy = async (): Promise<PasswordPolicy> => {
    console.log("Mocking getPasswordPolicy");
    return new Promise(resolve => setTimeout(() => resolve(mockPasswordPolicy), 300));
};

export const updatePasswordPolicy = async (
    data: UpdatePasswordPolicyRequest
): Promise<void> => {
    console.log("Mocking updatePasswordPolicy", data);
     return new Promise(resolve => {
        setTimeout(() => {
            mockPasswordPolicy = { ...mockPasswordPolicy, ...data };
            resolve();
        }, 500);
    });
};
