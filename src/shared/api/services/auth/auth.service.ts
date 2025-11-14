import {
    TokenResponseBase,
    UserInfo,
    UserProfile,
    UpdateProfileRequest,
    MfaStatusResponse,
    SetupMfaResponse,
    VerifyFa,
} from "@/shared/types/auth.types";
import { apiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

class AuthService {
    private endpoint = `${API_BASE_URL}`;
    private isLoggingOut = false;
    /**
     * Check if current route is public/auth route
     */
    private isPublicRoute(): boolean {
        if (typeof window === "undefined") return false;

        const pathname = window.location.pathname;
        const publicRoutes = [
            "/en/auth/login",
            "/en/auth/register",
            "/en/auth/forgot-password",
            "/en/auth/reset-password",
            "/en/auth/verify-email",
            "/en/auth/create-new-password",
            "/en/signout",
            "/en/auth/authenticator",
        ];
        return publicRoutes.some((route) => pathname.startsWith(route));
    }

    private getAccessToken(): string | null {
        if (typeof window === "undefined") return null;

        // Try sessionStorage first, then localStorage
        return (
            sessionStorage.getItem("accessToken") ||
            localStorage.getItem("accessToken")
        );
    }

    private getRefreshToken(): string | null {
        if (typeof window === "undefined") return null;

        // Try sessionStorage first, then localStorage
        return (
            sessionStorage.getItem("refreshToken") ||
            localStorage.getItem("refreshToken")
        );
    }
    private storeTokens(
        tokens: TokenResponseBase,
        useSession: boolean = false
    ): void {
        if (typeof window === "undefined") {
            console.warn("storeTokens: Not running in browser environment");
            return;
        }

        const storage = useSession ? sessionStorage : localStorage;

        try {
            // Lưu accessToken
            storage.setItem("accessToken", tokens.accessToken);

            // Lưu refreshToken nếu có
            if (tokens.refreshToken) {
                storage.setItem("refreshToken", tokens.refreshToken);
            } else {
                storage.removeItem("refreshToken"); // Xóa refreshToken cũ nếu không có
                console.log("storeTokens: No refreshToken provided");
            }

            // Lưu tokenType nếu có
            if (tokens.tokenType) {
                storage.setItem("tokenType", tokens.tokenType);
            }

            // Lưu tokenExpiry nếu có
            if (tokens.expiresIn) {
                const expiryTime = Date.now() + tokens.expiresIn * 1000;
                storage.setItem("tokenExpiry", expiryTime.toString());
            }

            // Log để xác nhận
            console.log("storeTokens: Successfully stored tokens", {
                storageType: useSession ? "sessionStorage" : "localStorage",
                accessToken: tokens.accessToken.substring(0, 10) + "...",
                refreshToken: tokens.refreshToken
                    ? tokens.refreshToken.substring(0, 10) + "..."
                    : "N/A",
                tokenType: tokens.tokenType || "N/A",
                expiresIn: tokens.expiresIn || "N/A",
            });

            // Lưu thông tin bổ sung nếu có (tùy thuộc vào kiểu TokenResponseBase)
            if ((tokens as any).user) {
                storage.setItem(
                    "userInfo",
                    JSON.stringify((tokens as any).user)
                );
            }
            if ((tokens as any).username) {
                storage.setItem("username", (tokens as any).username);
            }
            if ((tokens as any).permissions) {
                storage.setItem(
                    "permissions",
                    JSON.stringify((tokens as any).permissions)
                );
            }
            if ((tokens as any).roles) {
                storage.setItem("roles", JSON.stringify((tokens as any).roles));
            }
            if ((tokens as any).clients) {
                storage.setItem(
                    "clients",
                    JSON.stringify((tokens as any).clients)
                );
            }
        } catch (error) {
            console.error("storeTokens: Failed to store tokens", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error; // Ném lỗi để handleOAuthCallback có thể xử lý
        }
    }
    /**
     * Clear authentication data
     */
    private clearAuthData(): void {
        if (typeof window !== "undefined") {
            // Clear from both storages
            const items = [
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

            items.forEach((item) => {
                localStorage.removeItem(item);
                sessionStorage.removeItem(item);
            });
        }
    }

    private redirectToLogin(): void {
        if (typeof window === "undefined") return;

        const currentPath = window.location.pathname;

        // ✅ Ngăn redirect nếu đã ở login
        if (this.isPublicRoute()) {
            console.log("⚠️ Already on public route, skip redirect");
            return;
        }

        this.clearAuthData();

        const returnUrl = encodeURIComponent(currentPath);

        // ✅ Sử dụng replace thay vì href để tránh history pollution
        window.location.replace(`/en/auth/login?returnUrl=${returnUrl}`);
    }

    /**
     * Handle network errors consistently
     */
    private handleNetworkError(error: unknown, operation: string): never {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            const networkError = new Error(
                `Unable to connect to the server. Please check your network connection.`
            ) as any;
            networkError.type = "network";
            networkError.originalError = error;
            throw networkError;
        }
        throw error;
    }

    // Simple response handler for non-authenticated endpoints
    private async handleSimpleResponse<T = any>(
        response: Response,
        operation: string = "operation"
    ): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: "An error occurred",
            }));

            const getErrorMessage = (
                status: number,
                serverMessage?: string
            ): string => {
                switch (status) {
                    case 400:
                        return "Invalid request data. Please check your input.";
                    case 401:
                        this.clearAuthData(); // Clear auth data on 401
                        this.redirectToLogin(); // Redirect to login
                        return "Invalid username or password";
                    case 403:
                        return "You do not have permission to perform this action.";
                    case 404:
                        return "The requested resource was not found.";
                    case 409:
                        return "A conflict occurred. The resource may already exist.";
                    case 422:
                        return "The provided data is invalid.";
                    case 429:
                        return "Too many requests. Please try again later.";
                    case 500:
                        return "Internal server error. Please try again later.";
                    case 502:
                    case 503:
                    case 504:
                        return "Service temporarily unavailable. Please try again later.";
                    default:
                        return (
                            serverMessage ||
                            `${operation} failed (${status}). Please try again.`
                        );
                }
            };

            const userFriendlyMessage = getErrorMessage(
                response.status,
                errorData.message
            );
            const error = new Error(userFriendlyMessage) as any;
            error.status = response.status;
            error.serverMessage = errorData.message;
            throw error;
        }

        // Handle successful response
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            try {
                const data = await response.json();
                console.log(`${operation} JSON response:`, data);
                return data.value ? data.value : data;
            } catch (jsonError) {
                console.warn(
                    `Failed to parse JSON for ${operation}:`,
                    jsonError
                );
                const textData = await response.text();
                return textData as T;
            }
        }

        try {
            const textData = await response.text();
            console.log(`${operation} text response:`, textData);

            if (!textData || textData.trim() === "") {
                const operationsWithoutData = [
                    "logout",
                    "delete",
                    "update",
                    "create",
                    "reset",
                    "change",
                    "forgot",
                ];
                const isDatalessOperation = operationsWithoutData.some((op) =>
                    operation.toLowerCase().includes(op)
                );

                if (isDatalessOperation) {
                    console.log(
                        `${operation} completed successfully (no data expected)`
                    );
                    return { success: true } as T;
                } else {
                    console.error(
                        `${operation} returned empty response but data was expected`
                    );
                    throw new Error(`${operation} returned empty response`);
                }
            }

            return textData as T;
        } catch (textError) {
            console.error(
                `Failed to read response for ${operation}:`,
                textError
            );
            throw new Error(`Failed to process response for ${operation}`);
        }
    }

    public login = async (
        email: string,
        password: string,
        clientId: string,
        useSessionStorage: boolean = false
    ): Promise<TokenResponseBase> => {
        const endpoint = `/login/v2?clientId=core&redirect=true`;

        try {
            const response = await fetch(`${this.endpoint}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            const tokenData =
                await this.handleSimpleResponse<TokenResponseBase>(
                    response,
                    "Login"
                );

            if (tokenData.requires2FA) {
                const params = new URLSearchParams(window.location.search);
                const redirect = params.get("redirect");
                const clientId = params.get("clientId");

                const returnUrl = params.get("returnUrl");

                let redirectUrl = `${window.location.origin}/en/auth/authenticator?token=${tokenData.twoFactorToken}`;

                if (redirect && clientId) {
                    redirectUrl += `&redirect=${redirect}&clientId=${clientId}`;
                }

                if (returnUrl) {
                    redirectUrl += `&returnUrl=${encodeURIComponent(returnUrl)}`;
                }

                window.location.href = redirectUrl;
                return tokenData;
            }

            this.storeTokens(tokenData, useSessionStorage);

            return tokenData;
        } catch (error: unknown) {
            this.handleNetworkError(error, "Login");
        }
    };

    public loginWithGoogle = (clientId: string, baseUrl?: string): void => {
        try {
            const currentBaseUrl = baseUrl || window.location.origin;
            const urlParams = new URLSearchParams(window.location.search);

            let finalReturnUrl = null;
            if (window.location.hash && window.location.hash.includes("?")) {
                const hashParams = new URLSearchParams(
                    window.location.hash.split("?")[1]
                );
                finalReturnUrl = hashParams.get("redirectUrl");
            }

            if (!finalReturnUrl) {
                finalReturnUrl =
                    urlParams.get("returnUrl") || window.location.pathname;
            }
            var redirect = urlParams.get("redirect");
            var redirectClientId = urlParams.get("clientId");
            if (redirect == "true" && redirectClientId) {
                finalReturnUrl =
                    finalReturnUrl +
                    "?redirect=true&clientId=" +
                    redirectClientId;
            }
            const oauthReturnUrl = `${currentBaseUrl}/en/auth/login?returnUrl=${encodeURIComponent(
                finalReturnUrl
            )}`;
            const googleOAuthUrl = `${
                this.endpoint
            }/google?returnUrl=${encodeURIComponent(
                oauthReturnUrl
            )}&clientId=${clientId}&useCookies=false`;
            window.location.href = googleOAuthUrl;
        } catch (error) {
            throw new Error("Failed to initiate Google OAuth login");
        }
    };

    public loginWithMicrosoft = (clientId: string, baseUrl?: string): void => {
        try {
            const currentBaseUrl = baseUrl || window.location.origin;
            const urlParams = new URLSearchParams(window.location.search);

            let finalReturnUrl = null;
            if (window.location.hash && window.location.hash.includes("?")) {
                const hashParams = new URLSearchParams(
                    window.location.hash.split("?")[1]
                );
                finalReturnUrl = hashParams.get("redirectUrl");
            }
            if (!finalReturnUrl) {
                finalReturnUrl =
                    urlParams.get("returnUrl") || window.location.pathname;
            }
            var redirect = urlParams.get("redirect");
            var redirectClientId = urlParams.get("clientId");
            if (redirect == "true" && redirectClientId) {
                finalReturnUrl =
                    finalReturnUrl +
                    "?redirect=true&clientId=" +
                    redirectClientId;
            }
            const oauthReturnUrl = `${currentBaseUrl}/en/auth/login?returnUrl=${encodeURIComponent(
                finalReturnUrl
            )}`;
            const microsoftOAuthUrl = `${
                this.endpoint
            }/microsoft?returnUrl=${encodeURIComponent(
                oauthReturnUrl
            )}&clientId=${clientId}&useCookies=false`;
            window.location.href = microsoftOAuthUrl;
        } catch (error) {
            throw new Error("Failed to initiate Microsoft OAuth login");
        }
    };

    public mfaStatus = async (
        twoFactorToken: string
    ): Promise<MfaStatusResponse> => {
        try {
            const response = await fetch(
                `${
                    this.endpoint
                }/mfa/status?twoFactorToken=${encodeURIComponent(
                    twoFactorToken
                )}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return await this.handleSimpleResponse<MfaStatusResponse>(
                response,
                "MFA Status"
            );
        } catch (error) {
            this.handleNetworkError(error, "MFA Status");
        }
    };

    public mfaSetup = async (
        twoFactorToken: string
    ): Promise<SetupMfaResponse> => {
        try {
            const response = await fetch(
                `${this.endpoint}/mfa/setup?twoFactorToken=${encodeURIComponent(
                    twoFactorToken
                )}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            return await this.handleSimpleResponse<SetupMfaResponse>(
                response,
                "MFA Setup"
            );
        } catch (error) {
            this.handleNetworkError(error, "MFA Setup");
        }
    };

    public verifyFa = async (
        twoFactorToken: string,
        useSessionStorage: boolean = false,
        twoFactorCode: string
    ): Promise<TokenResponseBase> => {
        try {
            const response = await fetch(
                `${
                    this.endpoint
                }/verify-2fa?clientId=core&twoFactorToken=${encodeURIComponent(
                    twoFactorToken
                )}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        twoFactorCode: twoFactorCode,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid verification code.");
                } else {
                    const errorData = await response.json();
                    throw errorData;
                }
            }

            const tokenData =
                await this.handleSimpleResponse<TokenResponseBase>(
                    response,
                    "VerifyFa"
                );

            this.storeTokens(tokenData, useSessionStorage);

            return tokenData;
        } catch (error: unknown) {
            this.handleNetworkError(error, "Login");
        }
    };

    public logout = async (): Promise<any> => {
        if (this.isLoggingOut) {
            return { success: true };
        }

        if (this.isPublicRoute()) {
            this.clearAuthData();
            return { success: true };
        }

        this.isLoggingOut = true; // ✅ Set flag

        try {
            const result = await apiCall(`${this.endpoint}/logout`, {
                method: "POST",
                body: JSON.stringify({}),
            });

            this.clearAuthData();
            this.redirectToLogin();
            return result;
        } catch (error) {
            console.error("Logout failed:", error);
            this.clearAuthData();
            this.redirectToLogin();
            throw error;
        } finally {
            this.isLoggingOut = false; // ✅ Reset flag
        }
    };
    public getCurrentUser = async (accessToken?: string): Promise<UserInfo> => {
        try {
            if (accessToken) {
                const response = await fetch(`${this.endpoint}/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                return await this.handleSimpleResponse<UserInfo>(
                    response,
                    "Get user info"
                );
            }

            return await apiCall<UserInfo>(`${this.endpoint}/me`, {
                method: "GET",
            });
        } catch (error: unknown) {
            this.handleNetworkError(error, "Get user info");
        }
    };

    public getUserProfile = async (
        accessToken?: string
    ): Promise<UserProfile> => {
        try {
            if (accessToken) {
                const response = await fetch(`${this.endpoint}/users/profile`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                return await this.handleSimpleResponse<UserProfile>(
                    response,
                    "Get user profile"
                );
            }

            return await apiCall<UserProfile>(
                `${this.endpoint}/users/profile`,
                {
                    method: "GET",
                }
            );
        } catch (error: unknown) {
            this.handleNetworkError(error, "Get user profile");
        }
    };

    public updateUserProfile = async (
        profileData: UpdateProfileRequest,
        accessToken?: string
    ): Promise<UserProfile> => {
        try {
            if (accessToken) {
                const response = await fetch(`${this.endpoint}/users/profile`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(profileData),
                });
                return await this.handleSimpleResponse<UserProfile>(
                    response,
                    "Update profile"
                );
            }

            return await apiCall<UserProfile>(
                `${this.endpoint}/users/profile`,
                {
                    method: "PUT",
                    body: JSON.stringify(profileData),
                }
            );
        } catch (error: unknown) {
            this.handleNetworkError(error, "Update profile");
        }
    };

    public verifyAuth = async (accessToken?: string): Promise<boolean> => {
        try {
            await this.getCurrentUser(accessToken);
            return true;
        } catch (error: unknown) {
            console.error("Auth verification failed:", error);
            return false;
        }
    };

    public refreshToken = async (
        refreshToken?: string
    ): Promise<TokenResponseBase> => {
        try {
            const token = refreshToken || this.getRefreshToken();
            if (!token) {
                throw new Error("No refresh token available");
            }

            const response = await fetch(`${this.endpoint}/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken: token }),
            });

            const result = await this.handleSimpleResponse<TokenResponseBase>(
                response,
                "Refresh token"
            );
            this.storeTokens(result);

            return result;
        } catch (error) {
            this.clearAuthData();
            this.handleNetworkError(error, "Refresh token");
        }
    };

    public forgotPassword = async (email: string): Promise<any> => {
        try {
            const response = await fetch(`${this.endpoint}/forgotPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            return await this.handleSimpleResponse(response, "Forgot password");
        } catch (error) {
            this.handleNetworkError(error, "Forgot password");
        }
    };

    public resetPassword = async (
        email: string,
        resetCode: string,
        newPassword: string
    ): Promise<any> => {
        try {
            const response = await fetch(`${this.endpoint}/resetPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    resetCode,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            return await this.handleSimpleResponse(response, "Reset password");
        } catch (error) {
            this.handleNetworkError(error, "Reset password");
        }
    };

    public changePassword = async (
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<any> => {
        return await apiCall<void>(`${API_BASE_URL}/users/change-password`, {
            method: "PUT",
            body: JSON.stringify({
                userId,
                currentPassword,
                newPassword,
            }),
        });
    };

    public getToken = (): string | null => {
        return this.getAccessToken();
    };

    public isExpired = (): boolean => {
        if (typeof window === "undefined") return true;

        const expiry =
            sessionStorage.getItem("tokenExpiry") ||
            localStorage.getItem("tokenExpiry");
        if (!expiry) return true;

        return Date.now() >= parseInt(expiry);
    };
    public handleOAuthCallback = async (): Promise<{
        success: boolean;
        user?: UserInfo;
        returnUrl?: string;
        refreshToken?: string;
        expiresIn?: number;
    }> => {
        if (typeof window === "undefined") {
            return { success: false };
        }
        const urlParams = new URLSearchParams(window.location.search);
        let accessToken =
            urlParams.get("accessToken") ||
            window.location.hash.split("access_token=")[1]?.split("&")[0];

        // Parse hash params
        let hashParams = new URLSearchParams();
        if (window.location.hash && window.location.hash.includes("?")) {
            const hashPart = window.location.hash.split("?")[1];
            hashParams = new URLSearchParams(hashPart);
        }

        let returnUrl =
            hashParams.get("redirectUrl") ||
            urlParams.get("state") ||
            urlParams.get("returnUrl") ||
            hashParams.get("returnUrl");

        // Kiểm tra accessToken trong returnUrl nếu cần
        if (!accessToken && returnUrl) {
            const decodedReturnUrl = decodeURIComponent(returnUrl);
            const returnUrlParams = new URLSearchParams(
                decodedReturnUrl.split("?")[1] || ""
            );
            accessToken = returnUrlParams.get("accessToken") || "";
        }

        if (!accessToken) {
            return { success: false };
        }
        const refreshToken =
            urlParams.get("refreshToken") ||
            hashParams.get("refreshToken") ||
            "";
        const expiresIn =
            urlParams.get("expiresIn") || hashParams.get("expiresIn");
        try {
            const userData = await this.getCurrentUser(accessToken);

            const tokenData: TokenResponseBase = {
                accessToken: accessToken,
                refreshToken,
                tokenType: "Bearer",
                expiresIn: expiresIn ? parseInt(expiresIn, 10) : 3600,
            };

            console.log("handleOAuthCallback: Calling storeTokens with", {
                accessToken: tokenData.accessToken.substring(0, 10) + "...",
                refreshToken: tokenData.refreshToken || "N/A",
                tokenType: tokenData.tokenType,
                expiresIn: tokenData.expiresIn,
            });

            this.storeTokens(tokenData, false);

            return {
                success: true,
                user: userData,
                returnUrl: returnUrl || undefined,
                refreshToken: tokenData.refreshToken,
                expiresIn: tokenData.expiresIn,
            };
        } catch (error) {
            console.error(
                "handleOAuthCallback: Failed to process OAuth callback",
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                    status:
                        error instanceof Error && "status" in error
                            ? error.status
                            : undefined,
                }
            );
            return { success: false };
        }
    };
}

export const authService = new AuthService();
export default authService;
