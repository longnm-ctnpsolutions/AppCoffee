"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import authService from "../api/services/auth/auth.service";
import {
    ClientInfo,
    UserInfo,
    UserProfile,
    UpdateProfileRequest,
    normalizeUserInfo,
    isRawUserInfo,
    mergeUserWithProfile,
    extractClientInfo,
    hasPermission as checkPermission,
    hasAnyPermission as checkAnyPermission,
    hasRole as checkRole,
    hasAnyRole as checkAnyRole,
    isAdmin,
    CORE_PERMISSIONS,
    TokenResponseBase,
    MfaStatusResponse,
    SetupMfaResponse,
} from "../types/auth.types";

import {
    setTokenProvider,
    setRefreshTokenProvider,
    setTokenRefreshFunction,
    setClearAuthFunction,
    setLogoutFunction,
    getReturnUrl,
    cleanTokensFromUrl,
} from "@/lib/response-handler";

// Auth State Interface
interface AuthState {
    user: UserInfo | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isActionLoading: boolean;
    isProfileLoading: boolean;
    error: string | null;
    permissions: string[]; // Only core permissions for authorization
    roles: string[];
    clients: ClientInfo[]; // All clients for display
    currentClient: ClientInfo | null;
    tokens: TokenResponseBase | null;
    authType: "cookie" | "token" | null;
    isInitialized: boolean;
    twoFactorEnabled: MfaStatusResponse | null;
    mfaSetup: SetupMfaResponse | null;
}

// Auth Actions
type AuthAction =
    | { type: "AUTH_INIT" }
    | {
          type: "LOGIN_SUCCESS_COOKIE";
          payload: {
              user?: UserInfo;
              permissions?: string[];
              roles?: string[];
              clients?: ClientInfo[];
          };
      }
    | { type: "LOGIN_SUCCESS_TOKEN"; payload: TokenResponseBase }
    | { type: "LOGIN_FAILURE"; payload: string }
    | { type: "LOGOUT_SUCCESS" }
    | { type: "LOGOUT_FAILURE"; payload: string }
    | { type: "SET_ACTION_LOADING"; payload: boolean }
    | { type: "SET_PROFILE_LOADING"; payload: boolean }
    | { type: "SET_TWO_FACTOR"; payload: MfaStatusResponse }
    | { type: "SET_MFA_SETUP"; payload: SetupMfaResponse }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_USER"; payload: { user: UserInfo; clients?: ClientInfo[] } }
    | { type: "SET_PROFILE"; payload: UserProfile }
    | { type: "UPDATE_PROFILE_SUCCESS"; payload: UserProfile }
    | { type: "SET_CURRENT_CLIENT"; payload: ClientInfo }
    | {
          type: "AUTH_INITIALIZATION_SUCCESS";
          payload: {
              user: UserInfo;
              profile?: UserProfile;
              clients?: ClientInfo[];
          };
      }
    | { type: "AUTH_INITIALIZATION_FAILURE" }
    | {
          type: "TOKEN_REFRESHED";
          payload: {
              accessToken: string;
              refreshToken: string;
              expiresIn: number;
          };
      }
    | { type: "CLEAR_AUTH" }
    | { type: "HANDLE_AUTH_REDIRECT" };

// Helper function to check if localStorage has tokens
const hasValidTokensInStorage = (): boolean => {
    if (typeof window === "undefined") return false;

    const accessToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

    return !!accessToken;
};

// Helper function to check if error indicates auth service already handled redirect
const isAuthRedirectHandled = (error: any): boolean => {
    return error?.status === 401 && error?.shouldRetry === true;
};

// Helper function to normalize user data from API
const normalizeUserDataFromAPI = (
    userData: any
): { user: UserInfo; clients: ClientInfo[] } => {
    console.log(
        "🔍 normalizeUserDataFromAPI input type:",
        typeof userData,
        userData
    );

    if (!userData) {
        console.log("❌ userData is null/undefined");
        throw new Error("No user data provided");
    }

    // Check if response has success format like {success: true, data: {...}}
    if (typeof userData === "object" && "success" in userData) {
        console.log("⚠️ API returned success wrapper format:", userData);

        if ("data" in userData && userData.data) {
            console.log("✅ Found user data in response.data:", userData.data);
            return normalizeUserDataFromAPI(userData.data);
        }

        if (userData.success === true && !("data" in userData)) {
            console.log(
                "❌ API returned success=true but no user data - user not authenticated"
            );
            throw new Error("User not authenticated");
        }
    }

    let normalizedUser: UserInfo;
    let clients: ClientInfo[] = [];

    if (isRawUserInfo(userData)) {
        normalizedUser = normalizeUserInfo(userData);
        clients = extractClientInfo(userData.scope);
        console.log(
            "✅ Normalized user data from raw JWT format:",
            normalizedUser
        );
        console.log("📋 Extracted client info:", clients);
        console.log("🔑 Core permissions only:", normalizedUser.permissions);
    } else {
        normalizedUser = userData;
        console.log("✅ User data already in correct format:", normalizedUser);
    }

    return { user: normalizedUser, clients };
};

// Initial state
const initialState: AuthState = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    isActionLoading: false,
    isProfileLoading: false,
    error: null,
    permissions: [],
    roles: [],
    clients: [],
    currentClient: null,
    tokens: null,
    authType: null,
    isInitialized: false,
    twoFactorEnabled: null,
    mfaSetup: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "AUTH_INIT":
            return { ...state, isLoading: true, error: null };

        case "LOGIN_SUCCESS_COOKIE":
            return {
                ...state,
                isLoading: false,
                isActionLoading: false,
                isAuthenticated: true,
                authType: "cookie",
                user: action.payload.user || null,
                permissions: action.payload.permissions || [],
                roles: action.payload.roles || [],
                clients: action.payload.clients || [],
                currentClient: action.payload.clients?.[0] || null,
                tokens: null,
                error: null,
                isInitialized: true,
            };

        case "LOGIN_SUCCESS_TOKEN":
            return {
                ...state,
                isLoading: false,
                isActionLoading: false,
                isAuthenticated: true,
                authType: "token",
                tokens: action.payload,
                user: action.payload.user || null,
                permissions: action.payload.permissions || [],
                roles: action.payload.roles || [],
                clients: action.payload.clients || [],
                currentClient: action.payload.clients?.[0] || null,
                error: null,
                isInitialized: true,
            };

        case "LOGIN_FAILURE":
            return {
                ...state,
                isLoading: false,
                isActionLoading: false,
                isAuthenticated: false,
                authType: null,
                user: null,
                profile: null,
                permissions: [],
                roles: [],
                clients: [],
                currentClient: null,
                tokens: null,
                error: action.payload,
                isInitialized: true,
            };

        case "LOGOUT_SUCCESS":
            return {
                ...initialState,
                isLoading: false,
                isActionLoading: false,
                isInitialized: true,
            };

        case "LOGOUT_FAILURE":
            return {
                ...state,
                isActionLoading: false,
                error: action.payload,
            };

        case "SET_ACTION_LOADING":
            return { ...state, isActionLoading: action.payload };

        case "SET_PROFILE_LOADING":
            return { ...state, isProfileLoading: action.payload };

        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                isActionLoading: false,
            };

        case "SET_USER":
            return {
                ...state,
                user: action.payload.user,
                permissions: action.payload.user.permissions,
                roles: action.payload.user.roles,
                clients: action.payload.clients || state.clients,
                currentClient:
                    action.payload.clients?.[0] || state.currentClient,
            };

        case "SET_PROFILE":
            return {
                ...state,
                profile: action.payload,
                user: state.user
                    ? mergeUserWithProfile(state.user, action.payload)
                    : state.user,
                isProfileLoading: false,
            };

        case "UPDATE_PROFILE_SUCCESS":
            return {
                ...state,
                profile: action.payload,
                user: state.user
                    ? mergeUserWithProfile(state.user, action.payload)
                    : state.user,
                isProfileLoading: false,
                isActionLoading: false,
                error: null,
            };

        case "SET_CURRENT_CLIENT":
            return { ...state, currentClient: action.payload };

        case "AUTH_INITIALIZATION_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                authType: "cookie",
                user: action.payload.user,
                profile: action.payload.profile || null,
                permissions: action.payload.user.permissions || [],
                roles: action.payload.user.roles || [],
                clients: action.payload.clients || [],
                currentClient: action.payload.clients?.[0] || null,
                error: null,
                isInitialized: true,
            };

        case "AUTH_INITIALIZATION_FAILURE":
            return {
                ...initialState,
                isLoading: false,
                isInitialized: true,
            };

        case "TOKEN_REFRESHED":
            return {
                ...state,
                tokens: state.tokens
                    ? {
                          ...state.tokens,
                          accessToken: action.payload.accessToken,
                          refreshToken: action.payload.refreshToken,
                          expiresIn: action.payload.expiresIn,
                      }
                    : null,
            };

        case "CLEAR_AUTH":
            return {
                ...initialState,
                isLoading: false,
                isInitialized: true,
            };

        case "HANDLE_AUTH_REDIRECT":
            return {
                ...initialState,
                isLoading: false,
                isInitialized: true,
                error: "Session expired. Please login again.",
            };

        case "SET_TWO_FACTOR":
            return { ...state, twoFactorEnabled: action.payload };

        case "SET_MFA_SETUP":
            return { ...state, mfaSetup: action.payload };

        default:
            return state;
    }
};

// Separate contexts for State and Dispatch
const AuthStateContext = React.createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = React.createContext<
    React.Dispatch<AuthAction> | undefined
>(undefined);

// Provider props
interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = React.useReducer(authReducer, initialState);
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = (path: string): boolean => {
        const publicRoutes = [
            "/en/auth/login",
            "/en/auth/register",
            "/en/auth/forgot-password",
            "/en/auth/reset-password",
            "/en/auth/verify-email",
            "/en/auth/create-new-password",
            "/en/auth/authenticator",
        ];
        return publicRoutes.some((route) => path.startsWith(route));
    };

    // 🔧 FIX: Setup token providers NGAY LẬP TỨC khi component mount
    React.useEffect(() => {
        setTokenProvider(() => {
            // Ưu tiên state token nếu có
            if (state.tokens?.accessToken) {
                return state.tokens.accessToken;
            }

            // Fallback to storage
            if (typeof window !== "undefined") {
                return (
                    localStorage.getItem("accessToken") ||
                    sessionStorage.getItem("accessToken")
                );
            }

            return null;
        });

        setRefreshTokenProvider(() => {
            // Ưu tiên state refresh token nếu có
            if (state.tokens?.refreshToken) {
                return state.tokens.refreshToken;
            }

            // Fallback to storage
            if (typeof window !== "undefined") {
                return (
                    localStorage.getItem("refreshToken") ||
                    sessionStorage.getItem("refreshToken")
                );
            }

            return null;
        });

        // Set token refresh function
        setTokenRefreshFunction(async (refreshToken: string) => {
            try {
                const refreshResult = await authService.refreshToken(
                    refreshToken
                );

                // Update tokens in state
                dispatch({
                    type: "TOKEN_REFRESHED",
                    payload: {
                        accessToken: refreshResult.accessToken,
                        refreshToken: refreshResult.refreshToken,
                        expiresIn: refreshResult.expiresIn,
                    },
                });

                return {
                    accessToken: refreshResult.accessToken,
                    refreshToken: refreshResult.refreshToken,
                    expiresIn: refreshResult.expiresIn,
                };
            } catch (error) {
                console.error("Token refresh failed in auth context:", error);
                dispatch({ type: "CLEAR_AUTH" });
                throw error;
            }
        });

        setClearAuthFunction(() => {
            console.log("Clearing auth state due to token expiration...");

            dispatch({ type: "CLEAR_AUTH" });

            if (typeof window !== "undefined") {
                const authKeys = [
                    "accessToken",
                    "refreshToken",
                    "tokenType",
                    "tokenExpiry",
                    "userInfo",
                    "username",
                    "permissions",
                    "roles",
                    "clients",
                ];

                authKeys.forEach((key) => {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                });

                console.log("Cleared auth data from storage");
            }
        });

        setLogoutFunction(async () => {
            // ✅ Ngăn gọi logout nếu đang ở trang public
            if (typeof window !== "undefined") {
                const pathname = window.location.pathname;
                const publicRoutes = [
                    "/en/auth/login",
                    "/en/auth/register",
                    "/en/auth/forgot-password",
                    "/en/auth/reset-password",
                    "/en/auth/verify-email",
                    "/en/auth/create-new-password",
                    "/en/auth/authenticator",
                ];

                if (publicRoutes.some((route) => pathname.startsWith(route))) {
                    console.log("⚠️ Already on public route, skip logout");
                    dispatch({ type: "CLEAR_AUTH" });
                    return;
                }
            }

            console.log("Response handler initiated logout...");

            try {
                await authService.logout();
                dispatch({ type: "LOGOUT_SUCCESS" });
                console.log("Logout completed successfully");
            } catch (error) {
                console.error("Logout failed:", error);
                dispatch({ type: "CLEAR_AUTH" });

                if (typeof window !== "undefined") {
                    const currentUrl =
                        window.location.pathname +
                        window.location.search +
                        window.location.hash;
                    const encodedReturnUrl = encodeURIComponent(currentUrl);
                    window.location.href = `/en/auth/login?returnUrl=${encodedReturnUrl}`;
                }

                throw error;
            }
        });

        console.log("✅ Token providers setup complete");
    }, []); // 🔧 FIX: Chỉ chạy 1 lần khi mount, không phụ thuộc state

    // 🔧 FIX: Update token providers khi state thay đổi
    React.useEffect(() => {
        // Update token providers với state mới nếu có
        setTokenProvider(() => {
            if (state.tokens?.accessToken) {
                return state.tokens.accessToken;
            }

            if (typeof window !== "undefined") {
                return (
                    localStorage.getItem("accessToken") ||
                    sessionStorage.getItem("accessToken")
                );
            }

            return null;
        });

        setRefreshTokenProvider(() => {
            if (state.tokens?.refreshToken) {
                return state.tokens.refreshToken;
            }

            if (typeof window !== "undefined") {
                return (
                    localStorage.getItem("refreshToken") ||
                    sessionStorage.getItem("refreshToken")
                );
            }

            return null;
        });
    }, [state.tokens?.accessToken, state.tokens?.refreshToken]);

    React.useEffect(() => {
        if (state.isInitialized) {
            return;
        }
        if (typeof window !== "undefined" && (window as any).__oauthProcessed) {
            return;
        }
        const initializeAuth = async () => {
            dispatch({ type: "AUTH_INIT" });

            if (typeof window !== "undefined") {
                const urlParams = new URLSearchParams(window.location.search);
                let accessToken =
                    urlParams.get("accessToken") ||
                    window.location.hash
                        .split("access_token=")[1]
                        ?.split("&")[0];
                let returnUrl = urlParams.get("returnUrl");
                // Kiểm tra accessToken trong returnUrl
                if (!accessToken && returnUrl) {
                    const decodedReturnUrl = decodeURIComponent(returnUrl);
                    const returnUrlParams = new URLSearchParams(
                        decodedReturnUrl.split("?")[1] || ""
                    );
                    accessToken = returnUrlParams.get("accessToken") || "";
                    console.log(
                        "initializeAuth: Found accessToken in returnUrl",
                        accessToken?.substring(0, 10) + "..."
                    );
                }

                if (accessToken) {
                    (window as any).__oauthProcessed = true;
                    try {
                        // const cleanedUrl = cleanTokensFromUrl(window.location.href);
                        // const newUrl = new URL(cleanedUrl, window.location.origin);
                        // window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search + newUrl.hash);
                        // localStorage.setItem('accessToken', accessToken);

                        const oauthResult =
                            await authService.handleOAuthCallback();

                        if (oauthResult.success && oauthResult.user) {
                            const { user: normalizedUserData, clients } =
                                normalizeUserDataFromAPI(oauthResult.user);

                            // Lấy profile
                            let profileData: UserProfile | undefined;
                            try {
                                profileData = await authService.getUserProfile(
                                    accessToken
                                );
                            } catch (profileError) {
                                console.warn(
                                    "Failed to fetch profile during OAuth callback:",
                                    profileError
                                );
                            }
                            dispatch({
                                type: "LOGIN_SUCCESS_TOKEN",
                                payload: {
                                    accessToken: accessToken,
                                    refreshToken:
                                        oauthResult.refreshToken || "",
                                    tokenType: "Bearer",
                                    expiresIn: oauthResult.expiresIn || 3600,
                                    user: normalizedUserData,
                                    permissions: normalizedUserData.permissions,
                                    roles: normalizedUserData.roles,
                                    clients: clients,
                                },
                            });

                            if (profileData) {
                                dispatch({
                                    type: "SET_PROFILE",
                                    payload: profileData,
                                });
                            }
                            const cleanedOAuthReturnUrl = oauthResult.returnUrl
                                ? cleanTokensFromUrl(oauthResult.returnUrl)
                                : null;
                            const rawReturnUrl =
                                cleanedOAuthReturnUrl || "/en/applications";
                            const publicRoutes = [
                                "/en/auth/login",
                                "/en/auth/register",
                                "/en/auth/forgot-password",
                                "/en/auth/reset-password",
                                "/en/auth/verify-email",
                                "/en/auth/create-new-password",
                                "/en/auth/authenticator",
                            ];

                            const isPublicRoute = publicRoutes.some((route) =>
                                rawReturnUrl.startsWith(route)
                            );
                            const safeReturnUrl = isPublicRoute
                                ? "/en/applications"
                                : rawReturnUrl;
                            delete (window as any).__oauthRedirectInProgress;
                            const cleanedCurrentUrl = cleanTokensFromUrl(
                                window.location.href
                            );
                            const currentUrlObj = new URL(
                                cleanedCurrentUrl,
                                window.location.origin
                            );
                            const returnUrlParam =
                                currentUrlObj.searchParams.get("returnUrl");

                            if (returnUrlParam) {
                                const cleanedReturnUrlParam =
                                    cleanTokensFromUrl(
                                        decodeURIComponent(returnUrlParam)
                                    );
                                currentUrlObj.searchParams.set(
                                    "returnUrl",
                                    cleanedReturnUrlParam
                                );
                            }
                            window.history.replaceState(
                                {},
                                document.title,
                                currentUrlObj.pathname +
                                    currentUrlObj.search +
                                    currentUrlObj.hash
                            );
                            (window as any).__oauthProcessed = true;
                            await new Promise((resolve) =>
                                setTimeout(resolve, 100)
                            );

                            var redirectToOtherApp = false;
                            var redirectClientId = "";
                            if (returnUrl) {
                                const decodedReturnUrl =
                                    decodeURIComponent(returnUrl);
                                const returnUrlParams = new URLSearchParams(
                                    decodedReturnUrl.split("?")[1] || ""
                                );
                                var redirect = returnUrlParams.get("redirect");
                                redirectClientId =
                                    returnUrlParams.get("clientId") || "";
                                if (redirect == "true" && redirectClientId) {
                                    redirectToOtherApp = true;
                                }
                            }
                            if (
                                safeReturnUrl.startsWith("http://") ||
                                safeReturnUrl.startsWith("https://")
                            ) {
                                window.location.href = safeReturnUrl;
                            } else {
                                router.replace(safeReturnUrl);
                            }
                            return;
                        } else {
                            throw new Error(
                                "OAuth callback failed: No user data"
                            );
                        }
                    } catch (error) {
                        delete (window as any).__oauthProcessed;
                        dispatch({
                            type: "LOGIN_FAILURE",
                            payload: "OAuth authentication failed",
                        });
                        router.push("/en/auth/login?error=oauth_failed");
                        return;
                    }
                }
            }

            if (!hasValidTokensInStorage()) {
                dispatch({ type: "AUTH_INITIALIZATION_FAILURE" });
                return;
            }

            try {
                const userData = await authService.getCurrentUser();
                const { user: normalizedUserData, clients } =
                    normalizeUserDataFromAPI(userData);

                let profileData: UserProfile | undefined;
                try {
                    profileData = await authService.getUserProfile();
                } catch (profileError) {
                    if (isAuthRedirectHandled(profileError)) {
                        return;
                    }
                    console.warn(
                        "Failed to fetch profile during initialization:",
                        profileError
                    );
                }

                dispatch({
                    type: "AUTH_INITIALIZATION_SUCCESS",
                    payload: {
                        user: normalizedUserData,
                        profile: profileData,
                        clients: clients,
                    },
                });
            } catch (error) {
                if (
                    typeof window !== "undefined" &&
                    window.__authRedirectInProgress
                ) {
                    return;
                }

                if (isAuthRedirectHandled(error)) {
                    return;
                }
                dispatch({ type: "AUTH_INITIALIZATION_FAILURE" });
            }
        };

        initializeAuth();
    }, [state.isInitialized]);

    React.useEffect(() => {
        if (
            state.authType === "token" &&
            state.tokens &&
            state.tokens.refreshToken
        ) {
            const refreshInterval = setInterval(async () => {
                try {
                    const refreshResult = await authService.refreshToken(
                        state.tokens?.refreshToken
                    );
                    dispatch({
                        type: "TOKEN_REFRESHED",
                        payload: {
                            accessToken: refreshResult.accessToken,
                            refreshToken: refreshResult.refreshToken,
                            expiresIn: refreshResult.expiresIn,
                        },
                    });
                } catch (error) {
                    console.error("Auto token refresh failed:", error);
                    dispatch({ type: "CLEAR_AUTH" });
                }
            }, 15 * 60 * 1000); // 15 minutes

            return () => clearInterval(refreshInterval);
        }
    }, [state.authType, state.tokens]);

    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchContext.Provider value={dispatch}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    );
};

// Hooks to access State and Dispatch separately
export const useAuthState = (): AuthState => {
    const context = React.useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error("useAuthState must be used within an AuthProvider");
    }
    return context;
};

export const useAuthDispatch = (): React.Dispatch<AuthAction> => {
    const context = React.useContext(AuthDispatchContext);
    if (context === undefined) {
        throw new Error("useAuthDispatch must be used within an AuthProvider");
    }
    return context;
};

export const useAuthActions = () => {
    const state = useAuthState();
    const dispatch = useAuthDispatch();
    const router = useRouter();
    const { toast } = useToast();

    const isValidReturnUrl = (url: string): boolean => {
        try {
            if (url.startsWith("/")) {
                return true;
            }
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const login = React.useCallback(
        async (
            email: string,
            password: string,
            clientId: string,
            useSessionStorage: boolean = false
        ) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });
            const queryParams = new URLSearchParams(window.location.search);
            const redirectStr: string | null = queryParams.get("redirect");
            const redirect: boolean = redirectStr === "true";
            const redirectClientId: string | null = queryParams.get("clientId");
            try {
                const finalClientId =
                    clientId || process.env.NEXT_PUBLIC_IDENTITY_CLIENT_ID || "core";
                if (!finalClientId) {
                    throw new Error("Configuration error: Client ID not found");
                }

                const response = await authService.login(
                    email,
                    password,
                    finalClientId,
                    useSessionStorage
                );

                // Handle token response - service now returns TokenResponseBase directly
                if (response.user) {
                    // Token response includes user data
                    dispatch({
                        type: "LOGIN_SUCCESS_TOKEN",
                        payload: response,
                    });
                } else {
                    // Token-only response - need to fetch user data
                    try {
                        const userData = await authService.getCurrentUser(
                            response.accessToken
                        );
                        const { user: normalizedUserData, clients } =
                            normalizeUserDataFromAPI(userData);

                        dispatch({
                            type: "LOGIN_SUCCESS_TOKEN",
                            payload: {
                                ...response,
                                user: normalizedUserData,
                                permissions: normalizedUserData.permissions,
                                roles: normalizedUserData.roles,
                                clients: clients,
                            },
                        });

                        // Try to fetch profile
                        try {
                            const profileData =
                                await authService.getUserProfile(
                                    response.accessToken
                                );
                            dispatch({
                                type: "SET_PROFILE",
                                payload: profileData,
                            });
                        } catch (profileError) {
                            console.warn(
                                "Failed to fetch user profile after login:",
                                profileError
                            );
                            if (isAuthRedirectHandled(profileError)) {
                                // Let the service handle this
                                return false;
                            }
                        }
                    } catch (error) {
                        if (isAuthRedirectHandled(error)) {
                            // Service is handling token refresh or redirect
                            return false;
                        }
                        throw new Error(
                            "Failed to get user information after login"
                        );
                    }
                }

                toast({
                    title: "Success",
                    description: "Login successful!",
                    variant: "default",
                });

                const returnUrl = getReturnUrl("/en/applications");
                router.push(returnUrl);
                return true;
            } catch (error: any) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Login failed. Please try again.";
                dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });

                const firstError = error.errors
                    ? Object.values(error.errors).flat()[0]
                    : error.title;

                if (firstError) {
                    toast({
                        title: "Error",
                        description: firstError,
                        variant: "destructive",
                    });
                }
                // toast({
                //     title: "Error",
                //     description: errorMessage,
                //     variant: "destructive",
                // });

                return false;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast, router]
    );

    const loginWithGoogle = React.useCallback(
        (clientId?: string, baseUrl?: string) => {
            try {
                const finalClientId =
                    clientId || process.env.NEXT_PUBLIC_IDENTITY_CLIENT_ID || "core";
                authService.loginWithGoogle(finalClientId, baseUrl);

                toast({
                    title: "Redirecting...",
                    description: "Redirecting to Google OAuth",
                    variant: "default",
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to initiate Google login";
                dispatch({ type: "SET_ERROR", payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        },
        [dispatch, toast]
    );

    const loginWithMicrosoft = React.useCallback(
        (clientId?: string, baseUrl?: string) => {
            try {
                const finalClientId =
                    clientId || process.env.NEXT_PUBLIC_IDENTITY_CLIENT_ID || "core";
                authService.loginWithMicrosoft(finalClientId, baseUrl);
                toast({
                    title: "Redirecting...",
                    description: "Redirecting to Microsoft OAuth",
                    variant: "default",
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to initiate Microsoft login";
                dispatch({ type: "SET_ERROR", payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        },
        [dispatch, toast]
    );

    const mfaStatus = React.useCallback(
        async (twoFactorToken: string) => {
            try {
                const twoFactor = await authService.mfaStatus(twoFactorToken);
                dispatch({ type: "SET_TWO_FACTOR", payload: twoFactor });
                return twoFactor;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Mfa Status failed";
                // dispatch({ type: 'LOGOUT_FAILURE', payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                // Service handles redirect on logout failure
                return null;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const mfaSetup = React.useCallback(
        async (twoFactorToken: string) => {
            try {
                const mfaSetup = await authService.mfaSetup(twoFactorToken);
                dispatch({ type: "SET_MFA_SETUP", payload: mfaSetup });
                return mfaSetup;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Mfa Setup failed";
                // dispatch({ type: 'LOGOUT_FAILURE', payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                // Service handles redirect on logout failure
                return null;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const verifyFa = React.useCallback(
        async (
            twoFactorToken: string,
            useSessionStorage: boolean = false,
            twoFactorCode: string
        ) => {
            const queryParams = new URLSearchParams(window.location.search);
            const redirectStr: string | null = queryParams.get("redirect");
            const redirect: boolean = redirectStr === "true";
            const redirectClientId: string | null = queryParams.get("clientId");

            try {
                const verifyFa = await authService.verifyFa(
                    twoFactorToken,
                    useSessionStorage,
                    twoFactorCode
                );

                try {
                    const userData = await authService.getCurrentUser(
                        verifyFa.accessToken
                    );
                    const { user: normalizedUserData, clients } =
                        normalizeUserDataFromAPI(userData);

                    dispatch({
                        type: "LOGIN_SUCCESS_TOKEN",
                        payload: {
                            ...verifyFa,
                            user: normalizedUserData,
                            permissions: normalizedUserData.permissions,
                            roles: normalizedUserData.roles,
                            clients: clients,
                        },
                    });

                    // Try to fetch profile
                    try {
                        const profileData = await authService.getUserProfile(
                            verifyFa.accessToken
                        );
                        dispatch({ type: "SET_PROFILE", payload: profileData });
                    } catch (profileError) {
                        console.warn(
                            "Failed to fetch user profile after login:",
                            profileError
                        );
                        if (isAuthRedirectHandled(profileError)) {
                            // Let the service handle this
                            return false;
                        }
                    }

                    toast({
                        title: "Success",
                        description: "Login successful!",
                        variant: "default",
                    });

                    const returnUrl = getReturnUrl("/en/applications");
                    router.push(returnUrl);
                    return true;
                } catch (error) {
                    if (isAuthRedirectHandled(error)) {
                        // Service is handling token refresh or redirect
                        return false;
                    }
                    throw new Error(
                        "Failed to get user information after login"
                    );
                }
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Verify failed";
                dispatch({ type: "LOGOUT_FAILURE", payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                // Service handles redirect on logout failure
                return null;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const logout = React.useCallback(async () => {
        dispatch({ type: "SET_ACTION_LOADING", payload: true });

        try {
            await authService.logout();
            dispatch({ type: "LOGOUT_SUCCESS" });
            toast({
                title: "Success",
                description: "Logged out successfully",
                variant: "default",
            });
            return true;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Logout failed";
            dispatch({ type: "LOGOUT_FAILURE", payload: errorMessage });
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            // Service handles redirect on logout failure
            return false;
        } finally {
            dispatch({ type: "SET_ACTION_LOADING", payload: false });
        }
    }, [dispatch, toast]);

    const getUserProfile = React.useCallback(async () => {
        dispatch({ type: "SET_PROFILE_LOADING", payload: true });

        try {
            const accessToken = state.tokens?.accessToken;
            const profileData = await authService.getUserProfile(accessToken);
            dispatch({ type: "SET_PROFILE", payload: profileData });
            return profileData;
        } catch (error) {
            if (isAuthRedirectHandled(error)) {
                return null;
            }

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch profile";
            dispatch({ type: "SET_ERROR", payload: errorMessage });
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            throw error;
        } finally {
            dispatch({ type: "SET_PROFILE_LOADING", payload: false });
        }
    }, [dispatch, state.tokens, toast]);

    const updateUserProfile = React.useCallback(
        async (profileData: UpdateProfileRequest) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                const accessToken = state.tokens?.accessToken;
                const updatedProfile = await authService.updateUserProfile(
                    profileData,
                    accessToken
                );

                dispatch({
                    type: "UPDATE_PROFILE_SUCCESS",
                    payload: updatedProfile,
                });

                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                    variant: "default",
                });

                return updatedProfile;
            } catch (error: any) {
                if (isAuthRedirectHandled(error)) {
                    // Service is handling token refresh, retry will happen automatically
                    return null;
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Profile update failed";

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                throw error;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, state.tokens, toast]
    );

    const forgotPassword = React.useCallback(
        async (email: string) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await authService.forgotPassword(email);
                toast({
                    title: "Success",
                    description: "Password reset link has been sent.",
                    variant: "default",
                });
                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to send reset email";
                dispatch({ type: "SET_ERROR", payload: errorMessage });
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                return false;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const resetPassword = React.useCallback(
        async (email: string, resetCode: string, newPassword: string) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await authService.resetPassword(email, resetCode, newPassword);
                toast({
                    title: "Success",
                    description: "Password reset successfully",
                    variant: "default",
                });
                return true;
            } catch (error: any) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Password reset failed";
                dispatch({ type: "SET_ERROR", payload: errorMessage });

                const firstError = error.errors
                    ? Object.values(error.errors).flat()[0]
                    : error.title;
                toast({
                    title: "Error",
                    description: firstError,
                    variant: "destructive",
                });
                return false;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const changePassword = React.useCallback(
        async (
            userId: string,
            currentPassword: string,
            newPassword: string
        ) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await authService.changePassword(
                    userId,
                    currentPassword,
                    newPassword
                );

                toast({
                    title: "Success",
                    description: "Password changed successfully",
                    variant: "default",
                });
                return true;
            } catch (error: any) {
                if (isAuthRedirectHandled(error)) {
                    // Service is handling token refresh, retry will happen automatically
                    return false;
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Password change failed";

                dispatch({ type: "SET_ERROR", payload: errorMessage });

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                return false;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [dispatch, toast]
    );

    const switchClient = React.useCallback(
        (client: ClientInfo) => {
            dispatch({ type: "SET_CURRENT_CLIENT", payload: client });
            toast({
                title: "Success",
                description: `Switched to ${client.name}`,
                variant: "default",
            });
        },
        [dispatch, toast]
    );

    const refreshUserData = React.useCallback(async () => {
        try {
            const accessToken = state.tokens?.accessToken;
            const userData = await authService.getCurrentUser(accessToken);
            const { user: normalizedUserData, clients } =
                normalizeUserDataFromAPI(userData);

            dispatch({
                type: "SET_USER",
                payload: {
                    user: normalizedUserData,
                    clients: clients,
                },
            });

            try {
                const profileData = await authService.getUserProfile(
                    accessToken
                );
                dispatch({ type: "SET_PROFILE", payload: profileData });
            } catch (profileError) {
                console.warn("Failed to refresh profile data:", profileError);
                if (isAuthRedirectHandled(profileError)) {
                    // Service is handling token refresh
                    return null;
                }
            }

            return normalizedUserData;
        } catch (error) {
            if (isAuthRedirectHandled(error)) {
                // Service is handling token refresh
                return null;
            }
            console.error("Failed to refresh user data:", error);
            throw error;
        }
    }, [dispatch, state.tokens]);

    const refreshTokens = React.useCallback(async () => {
        if (!state.tokens?.refreshToken) {
            throw new Error("No refresh token available");
        }

        try {
            const refreshResult = await authService.refreshToken(
                state.tokens.refreshToken
            );
            dispatch({
                type: "TOKEN_REFRESHED",
                payload: {
                    accessToken: refreshResult.accessToken,
                    refreshToken: refreshResult.refreshToken,
                    expiresIn: refreshResult.expiresIn,
                },
            });
            return refreshResult;
        } catch (error) {
            console.error("Manual token refresh failed:", error);
            dispatch({ type: "CLEAR_AUTH" });
            throw error;
        }
    }, [state.tokens, dispatch]);

    // Permission checking utilities
    const hasPermission = React.useCallback(
        (permission: string): boolean => {
            return checkPermission(state.user, permission);
        },
        [state.user]
    );

    const hasAnyPermission = React.useCallback(
        (permissions: string[]): boolean => {
            return checkAnyPermission(state.user, permissions);
        },
        [state.user]
    );

    const hasRole = React.useCallback(
        (role: string): boolean => {
            return checkRole(state.user, role);
        },
        [state.user]
    );

    const hasAnyRole = React.useCallback(
        (roles: string[]): boolean => {
            return checkAnyRole(state.user, roles);
        },
        [state.user]
    );

    const isUserAdmin = React.useCallback((): boolean => {
        return isAdmin(state.user);
    }, [state.user]);

    const getClientPermissions = React.useCallback(
        (clientName: string): string[] => {
            console.warn(
                "⚠️ getClientPermissions is for display only. Use hasPermission() for authorization checks."
            );
            return [];
        },
        []
    );

    return {
        // State (for easy access)
        ...state,

        // Auth actions
        login,
        loginWithGoogle,
        loginWithMicrosoft,
        logout,
        forgotPassword,
        resetPassword,
        switchClient,
        refreshUserData,
        refreshTokens,

        // Profile actions
        getUserProfile,
        updateUserProfile,
        changePassword,

        // Permission utilities
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        isUserAdmin,

        mfaStatus,
        mfaSetup,
        verifyFa,

        // Client utilities
        getClientPermissions,

        // Constants for easy access
        CORE_PERMISSIONS,
    };
};

// Convenience hooks for read-only access
export const useAuth = () => {
    const state = useAuthState();

    return {
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        isActionLoading: state.isActionLoading,
        isProfileLoading: state.isProfileLoading,
        error: state.error,
        currentClient: state.currentClient,
        authType: state.authType,
        tokens: state.tokens,
    };
};

export const useUserProfile = () => {
    const state = useAuthState();

    return {
        user: state.user,
        profile: state.profile,
        isProfileLoading: state.isProfileLoading,
        permissions: state.permissions,
        roles: state.roles,
        clients: state.clients,
        currentClient: state.currentClient,
    };
};

export const usePermissions = () => {
    const state = useAuthState();

    const hasPermission = React.useCallback(
        (permission: string): boolean => {
            return checkPermission(state.user, permission);
        },
        [state.user]
    );

    const hasAnyPermission = React.useCallback(
        (permissions: string[]): boolean => {
            return checkAnyPermission(state.user, permissions);
        },
        [state.user]
    );

    const hasRole = React.useCallback(
        (role: string): boolean => {
            return checkRole(state.user, role);
        },
        [state.user]
    );

    const hasAnyRole = React.useCallback(
        (roles: string[]): boolean => {
            return checkAnyRole(state.user, roles);
        },
        [state.user]
    );

    const isUserAdmin = React.useCallback((): boolean => {
        return isAdmin(state.user);
    }, [state.user]);

    return {
        permissions: state.permissions,
        roles: state.roles,
        hasPermission,
        hasAnyPermission,
        hasRole,
        hasAnyRole,
        isUserAdmin,
        CORE_PERMISSIONS,
    };
};

// OAuth-specific hooks
export const useOAuth = () => {
    const { loginWithGoogle, loginWithMicrosoft, isActionLoading, error } =
        useAuthActions();

    return {
        loginWithGoogle,
        loginWithMicrosoft,
        isLoading: isActionLoading,
        error,
    };
};

// Higher-order component for permission-based route protection
export const withPermission = <P extends object>(
    Component: React.ComponentType<P>,
    requiredPermission: string,
    fallbackComponent?: React.ComponentType
) => {
    const WrappedComponent = (props: P) => {
        const { hasPermission } = usePermissions();

        if (!hasPermission(requiredPermission)) {
            if (fallbackComponent) {
                const FallbackComponent = fallbackComponent;
                return <FallbackComponent />;
            }
            return <div>Access Denied</div>;
        }

        return <Component {...props} />;
    };

    WrappedComponent.displayName = `withPermission(${
        Component.displayName || Component.name
    })`;
    return WrappedComponent;
};

// Higher-order component for role-based route protection
export const withRole = <P extends object>(
    Component: React.ComponentType<P>,
    requiredRole: string,
    fallbackComponent?: React.ComponentType
) => {
    const WrappedComponent = (props: P) => {
        const { hasRole } = usePermissions();

        if (!hasRole(requiredRole)) {
            if (fallbackComponent) {
                const FallbackComponent = fallbackComponent;
                return <FallbackComponent />;
            }
            return <div>Access Denied</div>;
        }

        return <Component {...props} />;
    };

    WrappedComponent.displayName = `withRole(${
        Component.displayName || Component.name
    })`;
    return WrappedComponent;
};

// Hook for admin-only components
export const useAdminOnly = () => {
    const { isUserAdmin } = usePermissions();
    return isUserAdmin();
};
