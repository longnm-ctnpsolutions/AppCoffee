"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
} from "react";
import {
    getMfaConfiguration,
    updateMfaConfiguration,
    getPasswordPolicy,
    updatePasswordPolicy,
    getLoginSecurity,
    updateLoginSecurityTern,
    getFailedAttemptTime,
    updateFailedAttemptTimeTern
} from "@/shared/api/services/system-settings/system-settings.service";
import { useToast } from "@/hooks/use-toast";
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

// State interface
interface SystemSettingsState {
    // mfa
    mfaConfig: MfaConfiguration | null;
    isMfaLoading: boolean;
    mfaError: string | null;

    // Login Security
    loginSecurity: LoginSecurity | null;
    isLoginSecurityLoading: boolean;
    loginSecurityError: string | null;

    // failed attempt time window
    attemptTime: FailedAttemptTime | null;
    isFailedAttemptTimeLoading: boolean;
    failedAttemptTimeError: string | null;

    // password policy
    passwordPolicy: PasswordPolicy | null;
    isPasswordPolicyLoading: boolean;
    passwordPolicyError: string | null;
    isActionLoading: boolean;
}

// Actions
type SystemSettingsAction =
    // mfa
    | { type: "FETCH_MFA_INIT"; }
    | { type: "FETCH_MFA_SUCCESS"; payload: MfaConfiguration; }
    | { type: "FETCH_MFA_FAILURE"; payload: string; }
    | { type: "UPDATE_MFA_SUCCESS"; payload: MfaConfiguration; }

    // Login Security
    | { type: "FETCH_LOGIN_SECURITY_INIT"; }
    | { type: "FETCH_LOGIN_SECURITY_SUCCESS"; payload: LoginSecurity; }
    | { type: "FETCH_LOGIN_SECURITY_FAILURE"; payload: string; }
    | { type: "UPDATE_LOGIN_SECURITY_SUCCESS"; payload: LoginSecurity; }

    // failed attempt time window
    | { type: "FETCH_FAILED_ATTEMPT_TIME_INIT"; }
    | { type: "FETCH_FAILED_ATTEMPT_TIME_SUCCESS"; payload: FailedAttemptTime; }
    | { type: "FETCH_FAILED_ATTEMPT_TIME_FAILURE"; payload: string; }
    | { type: "UPDATE_FAILED_ATTEMPT_TIME_SUCCESS"; payload: FailedAttemptTime; }

    // password policy
    | { type: "FETCH_PASSWORD_POLICY_INIT"; }
    | { type: "FETCH_PASSWORD_POLICY_SUCCESS"; payload: PasswordPolicy; }
    | { type: "FETCH_PASSWORD_POLICY_FAILURE"; payload: string; }
    | { type: "UPDATE_PASSWORD_POLICY_SUCCESS"; payload: PasswordPolicy; }
    | { type: "SET_ACTION_LOADING"; payload: boolean; }
    | {
        type: "SET_ERROR";
        payload: { type: "mfa" | "passwordPolicy" | "loginSecurity" | "failedAttemptTime"; message: string; };
    };

// Reducer
const systemSettingsReducer = (
    state: SystemSettingsState,
    action: SystemSettingsAction
): SystemSettingsState => {
    switch (action.type) {
        case "FETCH_MFA_INIT":
            return { ...state, isMfaLoading: true, mfaError: null };

        case "FETCH_MFA_SUCCESS":
            return {
                ...state,
                isMfaLoading: false,
                mfaConfig: action.payload,
                mfaError: null,
            };

        case "FETCH_MFA_FAILURE":
            return {
                ...state,
                isMfaLoading: false,
                mfaError: action.payload,
            };

        case "UPDATE_MFA_SUCCESS":
            return {
                ...state,
                mfaConfig: action.payload,
                isActionLoading: false,
            };

        // Login Security
        case "FETCH_LOGIN_SECURITY_INIT":
            return { ...state, isLoginSecurityLoading: true, loginSecurityError: null };

        case "FETCH_LOGIN_SECURITY_SUCCESS":
            return {
                ...state,
                isLoginSecurityLoading: false,
                loginSecurity: action.payload,
                loginSecurityError: null,
            };

        case "FETCH_LOGIN_SECURITY_FAILURE":
            return {
                ...state,
                isLoginSecurityLoading: false,
                loginSecurityError: action.payload,
            };

        case "UPDATE_LOGIN_SECURITY_SUCCESS":
            return {
                ...state,
                loginSecurity: action.payload,
                isActionLoading: false,
            };

        // failed attempt time window
        case "FETCH_FAILED_ATTEMPT_TIME_INIT":
            return { ...state, isFailedAttemptTimeLoading: true, failedAttemptTimeError: null };

        case "FETCH_FAILED_ATTEMPT_TIME_SUCCESS":
            return {
                ...state,
                isFailedAttemptTimeLoading: false,
                attemptTime: action.payload,
                failedAttemptTimeError: null,
            };

        case "FETCH_FAILED_ATTEMPT_TIME_FAILURE":
            return {
                ...state,
                isFailedAttemptTimeLoading: false,
                failedAttemptTimeError: action.payload,
            };

        case "UPDATE_FAILED_ATTEMPT_TIME_SUCCESS":
            return {
                ...state,
                attemptTime: action.payload,
                isActionLoading: false,
            };


        // password policy

        case "FETCH_PASSWORD_POLICY_INIT":
            return {
                ...state,
                isPasswordPolicyLoading: true,
                passwordPolicyError: null,
            };

        case "FETCH_PASSWORD_POLICY_SUCCESS":
            return {
                ...state,
                isPasswordPolicyLoading: false,
                passwordPolicy: action.payload,
                passwordPolicyError: null,
            };

        case "FETCH_PASSWORD_POLICY_FAILURE":
            return {
                ...state,
                isPasswordPolicyLoading: false,
                passwordPolicyError: action.payload,
            };

        case "UPDATE_PASSWORD_POLICY_SUCCESS":
            return {
                ...state,
                passwordPolicy: action.payload,
                isActionLoading: false,
            };

        case "SET_ACTION_LOADING":
            return { ...state, isActionLoading: action.payload };

        case "SET_ERROR":
            if (action.payload.type === "mfa") {
                return {
                    ...state,
                    mfaError: action.payload.message,
                    isActionLoading: false,
                };

            } else if (action.payload.type === "loginSecurity") {
                return {
                    ...state,
                    loginSecurityError: action.payload.message,
                    isActionLoading: false,
                };
            } else {
                return {
                    ...state,
                    passwordPolicyError: action.payload.message,
                    isActionLoading: false,
                };
            }

        default:
            return state;
    }
};

// Initial state
const initialState: SystemSettingsState = {
    mfaConfig: null,
    isMfaLoading: false,
    mfaError: null,
    loginSecurity: null,
    isLoginSecurityLoading: false,
    loginSecurityError: null,
    attemptTime: null,
    isFailedAttemptTimeLoading: false,
    failedAttemptTimeError: null,
    passwordPolicy: null,
    isPasswordPolicyLoading: false,
    passwordPolicyError: null,
    isActionLoading: false,
};

// TÁCH RIÊNG STATE VÀ DISPATCH CONTEXTS
const SystemSettingsStateContext = createContext<
    SystemSettingsState | undefined
>(undefined);
const SystemSettingsDispatchContext = createContext<
    React.Dispatch<SystemSettingsAction> | undefined
>(undefined);

// Provider props
interface SystemSettingsProviderProps {
    children: React.ReactNode;
}

export const SystemSettingsProvider: React.FC<SystemSettingsProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(systemSettingsReducer, initialState);

    return (
        <SystemSettingsStateContext.Provider value={state}>
            <SystemSettingsDispatchContext.Provider value={dispatch}>
                {children}
            </SystemSettingsDispatchContext.Provider>
        </SystemSettingsStateContext.Provider>
    );
};

// HOOKS
export const useSystemSettingsState = (): SystemSettingsState => {
    const context = useContext(SystemSettingsStateContext);
    if (context === undefined) {
        throw new Error(
            "useSystemSettingsState must be used within a SystemSettingsProvider"
        );
    }
    return context;
};

export const useSystemSettingsDispatch =
    (): React.Dispatch<SystemSettingsAction> => {
        const context = useContext(SystemSettingsDispatchContext);
        if (context === undefined) {
            throw new Error(
                "useSystemSettingsDispatch must be used within a SystemSettingsProvider"
            );
        }
        return context;
    };

export const useSystemSettingsActions = () => {
    const dispatch = useSystemSettingsDispatch();
    const { toast } = useToast();

    const fetchMfaConfiguration = useCallback(async () => {
        dispatch({ type: "FETCH_MFA_INIT" });
        try {
            const config = await getMfaConfiguration();
            dispatch({ type: "FETCH_MFA_SUCCESS", payload: config });
            return config;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch MFA configuration";
            dispatch({ type: "FETCH_MFA_FAILURE", payload: message });
            throw error;
        }
    }, [dispatch]);

    const updateMfaConfig = useCallback(
        async (data: UpdateMfaConfigurationRequest) => {
            const optimisticConfig: MfaConfiguration = {
                twoFactorEnabled: data.twoFactorEnabled,
                loginAlertEnabled: data.loginAlertEnabled,
            };

            dispatch({ type: "UPDATE_MFA_SUCCESS", payload: optimisticConfig });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await updateMfaConfiguration(data);
                dispatch({ type: "SET_ACTION_LOADING", payload: false });

                toast({
                    title: "Success",
                    description: "MFA configuration updated successfully!",
                    variant: "default",
                });

                return true;
            } catch (error) {
                try {
                    await fetchMfaConfiguration();
                } catch (fetchError) {
                    console.error("Failed to refetch MFA config:", fetchError);
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update MFA configuration";

                dispatch({
                    type: "SET_ERROR",
                    payload: { type: "mfa", message },
                });

                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });

                return false;
            }
        },
        [dispatch, toast, fetchMfaConfiguration]
    );

    // ==================== LOGIN SECURITY =============================

    const fetchLoginSecurity = React.useCallback(async () => {
        dispatch({ type: "FETCH_LOGIN_SECURITY_INIT" });
        try {
            const config = await getLoginSecurity();
            dispatch({ type: "FETCH_LOGIN_SECURITY_SUCCESS", payload: config });
            return config;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch Login Security";
            dispatch({ type: "FETCH_LOGIN_SECURITY_FAILURE", payload: message });
            throw error;
        }
    }, [dispatch]);

    const updateLoginSecurity = React.useCallback(
        async (data: UpdateLoginSecurity) => {
            // Optimistic update
            const optimisticConfig: UpdateLoginSecurity = {
                maxFailedLogin: data.maxFailedLogin,
            };

            dispatch({ type: "UPDATE_LOGIN_SECURITY_SUCCESS", payload: optimisticConfig });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await updateLoginSecurityTern(data);
                dispatch({ type: "SET_ACTION_LOADING", payload: false });

                toast({
                    title: "Success",
                    description: "Login Security updated successfully!",
                    variant: "default",
                });

                return true;
            } catch (error) {
                try {
                    await fetchLoginSecurity();
                } catch (fetchError) {
                    console.error("Failed to refetch Login Security:", fetchError);
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update Login Security";

                dispatch({
                    type: "SET_ERROR",
                    payload: { type: "loginSecurity", message },
                });

                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });

                return false;
            }
        },
        [dispatch, toast, fetchLoginSecurity]
    );

    // failed attempt time window
    const fetchFailedAttemptTime = React.useCallback(async () => {
        dispatch({ type: "FETCH_FAILED_ATTEMPT_TIME_INIT" });
        try {
            const config = await getFailedAttemptTime();
            dispatch({ type: "FETCH_FAILED_ATTEMPT_TIME_SUCCESS", payload: config });
            return config;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch Failed Attempt Time";
            dispatch({ type: "FETCH_FAILED_ATTEMPT_TIME_FAILURE", payload: message });
            throw error;
        }
    }, [dispatch]);

    const updateFailedAttemptTime = React.useCallback(
        async (data: UpdateFailedAttemptTime) => {
            // Optimistic update
            const optimisticConfig: UpdateFailedAttemptTime = {
                failedAttemptTime: data.failedAttemptTime,
            };

            dispatch({ type: "UPDATE_FAILED_ATTEMPT_TIME_SUCCESS", payload: optimisticConfig });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await updateFailedAttemptTimeTern(data);
                dispatch({ type: "SET_ACTION_LOADING", payload: false });

                toast({
                    title: "Success",
                    description: "Failed Attempt Time Window updated successfully!",
                    variant: "default",
                });

                return true;
            } catch (error) {
                try {
                    await fetchFailedAttemptTime();
                } catch (fetchError) {
                    console.error("Failed to refetch Failed Attempt Time Window:", fetchError);
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update Failed Attempt Time Window";

                dispatch({
                    type: "SET_ERROR",
                    payload: { type: "failedAttemptTime", message },
                });

                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });

                return false;
            }
        },
        [dispatch, toast, fetchFailedAttemptTime]
    );


    const fetchPasswordPolicy = useCallback(async () => {
        dispatch({ type: "FETCH_PASSWORD_POLICY_INIT" });
        try {
            const policy = await getPasswordPolicy();
            dispatch({
                type: "FETCH_PASSWORD_POLICY_SUCCESS",
                payload: policy,
            });
            return policy;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch password policy";
            dispatch({
                type: "FETCH_PASSWORD_POLICY_FAILURE",
                payload: message,
            });
            throw error;
        }
    }, [dispatch]);

    const updatePasswordPolicyData = useCallback(
        async (data: UpdatePasswordPolicyRequest) => {
            const optimisticPolicy: PasswordPolicy = {
                passwordHistoryCount: data.passwordHistoryCount,
                passwordExpiryDays: data.passwordExpiryDays,
            };

            dispatch({
                type: "UPDATE_PASSWORD_POLICY_SUCCESS",
                payload: optimisticPolicy,
            });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await updatePasswordPolicy(data);
                dispatch({ type: "SET_ACTION_LOADING", payload: false });

                toast({
                    title: "Success",
                    description: "Password policy updated successfully!",
                    variant: "default",
                });

                return true;
            } catch (error) {
                try {
                    await fetchPasswordPolicy();
                } catch (fetchError) {
                    console.error(
                        "Failed to refetch password policy:",
                        fetchError
                    );
                }

                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update password policy";

                dispatch({
                    type: "SET_ERROR",
                    payload: { type: "passwordPolicy", message },
                });

                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });

                return false;
            }
        },
        [dispatch, toast, fetchPasswordPolicy]
    );

    return {
        fetchMfaConfiguration,
        updateMfaConfig,
        fetchLoginSecurity,
        updateLoginSecurity,
        fetchFailedAttemptTime,
        updateFailedAttemptTime,
        fetchPasswordPolicy,
        updatePasswordPolicyData,
    };
};

export const useMfaConfiguration = () => {
    const state = useSystemSettingsState();

    return {
        mfaConfig: state.mfaConfig,
        isMfaLoading: state.isMfaLoading,
        mfaError: state.mfaError,
    };
};

export const usePasswordPolicy = () => {
    const state = useSystemSettingsState();

    return {
        passwordPolicy: state.passwordPolicy,
        isPasswordPolicyLoading: state.isPasswordPolicyLoading,
        passwordPolicyError: state.passwordPolicyError,
    };
};

export const useLoginSecurity = () => {
    const state = useSystemSettingsState();

    return {
        loginSecurity: state.loginSecurity,
        isLoginSecurityLoading: state.isLoginSecurityLoading,
        loginSecurityError: state.loginSecurityError
    };
};

export const useFailedAttemptTime = () => {
    const state = useSystemSettingsState();

    return {
        failedAttemptTime: state.attemptTime,
        isFailedAttemptTimeLoading: state.isFailedAttemptTimeLoading,
        failedAttemptTimeError: state.failedAttemptTimeError
    };
};
