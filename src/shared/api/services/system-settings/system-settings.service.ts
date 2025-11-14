import { apiCall } from "@/lib/response-handler";
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

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

// MFA Configuration APIs
export const getMfaConfiguration = async (): Promise<MfaConfiguration> => {
    return await apiCall<MfaConfiguration>(
        `${API_BASE_URL}/system-settings/mfa-configuration`,
        {
            method: "GET",
        }
    );
};

export const updateMfaConfiguration = async (
    data: UpdateMfaConfigurationRequest
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/system-settings/mfa-configuration`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

// Login Security APIs
export const getLoginSecurity = async (): Promise<LoginSecurity> => {
    return await apiCall<LoginSecurity>(
        `${API_BASE_URL}/system-settings/login-security`,
        {
            method: "GET",
        }
    );
};

export const updateLoginSecurityTern = async (
    data: UpdateLoginSecurity
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/system-settings/login-security`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

// failed attempt time window
export const getFailedAttemptTime = async (): Promise<FailedAttemptTime> => {
    return await apiCall<FailedAttemptTime>(
        `${API_BASE_URL}/system-settings/failed-attempt-time`,
        {
            method: "GET",
        }
    );
};

export const updateFailedAttemptTimeTern = async (
    data: UpdateFailedAttemptTime
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/system-settings/failed-attempt-time`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};

// Password Policy APIs
export const getPasswordPolicy = async (): Promise<PasswordPolicy> => {
    return await apiCall<PasswordPolicy>(
        `${API_BASE_URL}/system-settings/password-policy`,
        {
            method: "GET",
        }
    );
};

export const updatePasswordPolicy = async (
    data: UpdatePasswordPolicyRequest
): Promise<void> => {
    await apiCall<void>(`${API_BASE_URL}/system-settings/password-policy`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
};
