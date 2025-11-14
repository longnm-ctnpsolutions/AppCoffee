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
            "/vi/auth/login",
            "/vi/auth/register",
            "/vi/auth/forgot-password",
            "/vi/auth/reset-password",
            "/vi/auth/verify-email",
            "/vi/auth/create-new-password",
            "/vi/signout",
            "/vi/auth/authenticator",
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
        window.location.replace(`/vi/auth/login?returnUrl=${returnUrl}`);
    }

    /**
     * Handle network errors consistently
     */
    private handleNetworkError(error: unknown, operation: string): never {
        if (error instanceof TypeError && error.message.includes("fetch")) {
            const networkError = new Error(
                `Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.`
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
                message: "Đã có lỗi xảy ra",
            }));

            const getErrorMessage = (
                status: number,
                serverMessage?: string
            ): string => {
                switch (status) {
                    case 400:
                        return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
                    case 401:
                        this.clearAuthData(); // Clear auth data on 401
                        this.redirectToLogin(); // Redirect to login
                        return "Tên đăng nhập hoặc mật khẩu không đúng";
                    case 403:
                        return "Bạn không có quyền thực hiện hành động này.";
                    case 404:
                        return "Không tìm thấy tài nguyên được yêu cầu.";
                    case 409:
                        return "Đã có xung đột xảy ra. Tài nguyên có thể đã tồn tại.";
                    case 422:
                        return "Dữ liệu được cung cấp không hợp lệ.";
                    case 429:
                        return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    case 500:
                        return "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
                    case 502:
                    case 503:
                    case 504:
                        return "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.";
                    default:
                        return (
                            serverMessage ||
                            `${operation} thất bại (${status}). Vui lòng thử lại.`
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
        console.log("MOCK LOGIN: Simulating login for", email);

        // Tạo dữ liệu giả
        const mockTokenData: TokenResponseBase = {
            accessToken: "mock-access-token-" + Date.now(),
            refreshToken: "mock-refresh-token-" + Date.now(),
            tokenType: "Bearer",
            expiresIn: 3600, // 1 giờ
            user: {
                id: "mock-user-id-123",
                email: email,
                name: "Người dùng Mock",
                firstName: "Người dùng",
                lastName: "Mock",
                roles: ["Admin", "User"], // Cung cấp vai trò Admin để có full quyền
                permissions: Object.values({ // Cung cấp tất cả quyền để truy cập mọi tính năng
                    // User management
                    USERS_READ: "users:read",
                    USERS_CREATE: "users:create",
                    USERS_EDIT: "users:edit",
                    USERS_DELETE: "users:delete",
                    USERS_EXPORT: "users:export",
                    USERS_CHANGE_STATUS: "users:status:change",
                    USERS_CHANGE_PASSWORD: "users:password:change",

                    // Role management
                    ROLES_READ: "roles:read",
                    ROLES_CREATE: "roles:create",
                    ROLES_EDIT: "roles:edit",
                    ROLES_DELETE: "roles:delete",
                    ROLES_EXPORT: "roles:export",

                    // Client management
                    CLIENTS_READ: "clients:read",
                    CLIENTS_CREATE: "clients:create",
                    CLIENTS_EDIT: "clients:edit",
                    CLIENTS_DELETE: "clients:delete",
                    CLIENTS_EXPORT: "clients:export",
                    CLIENTS_CHANGE_STATUS: "clients:status:change",

                    // Profile management
                    USER_PROFILE_VIEW: "user-profile:view",
                    USER_PROFILE_EDIT: "user-profile:edit",

                    // Permissions and roles assignment
                    USER_PERMISSIONS_READ: "user-permissions:read",
                    USER_PERMISSIONS_ASSIGN: "user-permissions:assign",
                    USER_PERMISSIONS_DELETE: "user-permissions:delete",
                    USER_ROLES_READ: "user-roles:read",
                    USER_ROLES_ASSIGN: "user-roles:assign",
                    USER_ROLES_DELETE: "user-roles:delete",

                    // Role permissions
                    ROLE_PERMISSIONS_READ: "role-permissions:read",
                    ROLE_PERMISSIONS_ASSIGN: "role-permissions:assign",
                    ROLE_PERMISSIONS_DELETE: "role-permissions:delete",

                    // Role users
                    ROLE_USERS_READ: "role-users:read",
                    ROLE_USERS_ASSIGN: "role-users:assign",
                    ROLE_USERS_DELETE: "role-users:delete",

                    // Client permissions
                    CLIENT_PERMISSIONS_READ: "client-permissions:read",
                    CLIENT_PERMISSIONS_CREATE: "client-permissions:create",
                    CLIENT_PERMISSIONS_EDIT: "client-permissions:edit",
                    CLIENT_PERMISSIONS_DELETE: "client-permissions:delete",

                    SYSTEM_SETTINGS: "system-settings",
                    // Audit permissions
                    AUDIT_PERMISSIONS_READ: "auditlogs:read",
                }),
                isActive: true,
                emailConfirmed: true,
            },
            clients: [
                { id: "core", name: "Core" },
                { id: "app-1", name: "Ứng dụng 1" },
            ],
            requires2FA: false,
        };

        // Lưu token giả và trả về
        this.storeTokens(mockTokenData, useSessionStorage);
        return mockTokenData;
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
            const oauthReturnUrl = `${currentBaseUrl}/vi/auth/login?returnUrl=${encodeURIComponent(
                finalReturnUrl
            )}`;
            const googleOAuthUrl = `${
                this.endpoint
            }/google?returnUrl=${encodeURIComponent(
                oauthReturnUrl
            )}&clientId=${clientId}&useCookies=false`;
            window.location.href = googleOAuthUrl;
        } catch (error) {
            throw new Error("Không thể khởi tạo đăng nhập Google OAuth");
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
            const oauthReturnUrl = `${currentBaseUrl}/vi/auth/login?returnUrl=${encodeURIComponent(
                finalReturnUrl
            )}`;
            const microsoftOAuthUrl = `${
                this.endpoint
            }/microsoft?returnUrl=${encodeURIComponent(
                oauthReturnUrl
            )}&clientId=${clientId}&useCookies=false`;
            window.location.href = microsoftOAuthUrl;
        } catch (error) {
            throw new Error("Không thể khởi tạo đăng nhập Microsoft OAuth");
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
                "Trạng thái MFA"
            );
        } catch (error) {
            this.handleNetworkError(error, "Trạng thái MFA");
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
                "Thiết lập MFA"
            );
        } catch (error) {
            this.handleNetworkError(error, "Thiết lập MFA");
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
                    throw new Error("Mã xác thực không hợp lệ.");
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
            this.handleNetworkError(error, "Đăng nhập");
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
                    "Lấy thông tin người dùng"
                );
            }

            return await apiCall<UserInfo>(`${this.endpoint}/me`, {
                method: "GET",
            });
        } catch (error: unknown) {
            this.handleNetworkError(error, "Lấy thông tin người dùng");
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
                    "Lấy hồ sơ người dùng"
                );
            }

            return await apiCall<UserProfile>(
                `${this.endpoint}/users/profile`,
                {
                    method: "GET",
                }
            );
        } catch (error: unknown) {
            this.handleNetworkError(error, "Lấy hồ sơ người dùng");
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
                    "Cập nhật hồ sơ"
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
            this.handleNetworkError(error, "Cập nhật hồ sơ");
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
                throw new Error("Không có refresh token");
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
                "Làm mới token"
            );
            this.storeTokens(result);

            return result;
        } catch (error) {
            this.clearAuthData();
            this.handleNetworkError(error, "Làm mới token");
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

            return await this.handleSimpleResponse(response, "Quên mật khẩu");
        } catch (error) {
            this.handleNetworkError(error, "Quên mật khẩu");
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

            return await this.handleSimpleResponse(response, "Đặt lại mật khẩu");
        } catch (error) {
            this.handleNetworkError(error, "Đặt lại mật khẩu");
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
