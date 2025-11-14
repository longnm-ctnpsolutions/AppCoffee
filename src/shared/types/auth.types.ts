// auth.types.ts - Updated to handle core permissions filtering

export interface ClientInfo {
    id: string;
    name: string;
    description?: string;
}

export interface MfaStatusResponse {
    twoFactorEnabled?: boolean;
}

export interface SetupMfaResponse {
    key?: string;
    uri?: string;
}

export interface VerifyFa {
    twoFactorCode?: string;
}

export interface TokenResponseBase {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn: number;
    username?: string;
    user?: UserInfo;
    permissions?: string[];
    roles?: string[];
    clients?: ClientInfo[];
    callbackUrl?: string;
    requires2FA?: boolean;
    twoFactorToken?: string;
}
export interface UserInfo {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
    isActive?: boolean;
    emailConfirmed?: boolean;
    phoneNumber?: string;
    profilePicture?: string;
    createdAt?: string;
    lastLoginAt?: string;
    gender?: number | null;
    birthDate?: Date | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    province?: string | null;
    state?: string;
    image?: string | null;
    address?: string | null;
    avatar?: string;
    picture?: string;
}

// Interface for cookie-based login response
export interface CookieLoginResponse {
    success?: boolean;
    message?: string;
}

export interface UserProfile {
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    roles?: string[];
    gender?: number | null;
    birthDate?: Date | null;
    image?: string | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    email?: string;
    userName?: string;
    state?: string | null;
    bankAccount?: string | null;
    user?: {
        id: string;
        email: string;
        lockoutEnabled?: boolean;
        connection?: string;
    };
}

export interface UpdateProfileRequest {
    userId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    gender?: number | null; // Số nguyên (0: nam, 1: nữ, 2: khác, v.v.)
    birthDate?: Date | null;
    email?: string | null; // Chuỗi ISO date-time
    image?: string | null;
    phone?: string | null;
    country?: string | null;
    city?: string | null;
    province?: string | null;
    address?: string | null;
    bankAccount?: string | null;
}

// Raw JWT claims structure
export interface RawUserInfo {
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
    "AspNet.Identity.SecurityStamp": string;
    given_name: string;
    family_name: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
        | string
        | string[];
    scope: Array<{
        client: string;
        permissions: string[];
    }>;
}

// Type guard to check if data is in raw JWT format
export const isRawUserInfo = (data: any): data is RawUserInfo => {
    return (
        typeof data === "object" &&
        data !== null &&
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" in
            data &&
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress" in
            data &&
        "scope" in data &&
        Array.isArray(data.scope)
    );
};

// Helper function to extract only "core" client permissions
export const extractCorePermissions = (
    scopes: Array<{ client: string; permissions: string[] }>
): string[] => {
    const coreScope = scopes.find((scope) => scope.client === "core");
    return coreScope ? coreScope.permissions : [];
};

// Helper function to get all client info (for display purposes, not authorization)
export const extractClientInfo = (
    scopes: Array<{ client: string; permissions: string[] }>
): ClientInfo[] => {
    return scopes.map((scope) => ({
        id: scope.client.toLowerCase().replace(/\s+/g, "-"), // Convert to ID format
        name: scope.client,
        description: `Client: ${scope.client} with ${scope.permissions.length} permissions`,
    }));
};

// Normalize raw JWT claims to UserInfo format
export const normalizeUserInfo = (rawData: RawUserInfo): UserInfo => {
    console.log("🔄 Normalizing raw JWT claims to UserInfo format");

    // Extract roles - handle both string and array formats
    let roles: string[] = [];
    const rawRoles =
        rawData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (typeof rawRoles === "string") {
        roles = [rawRoles];
    } else if (Array.isArray(rawRoles)) {
        roles = rawRoles;
    }

    // Extract ONLY core permissions for authorization
    const corePermissions = extractCorePermissions(rawData.scope);

    const normalizedUser: UserInfo = {
        id: rawData[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
        email: rawData[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
        name: rawData[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ],
        firstName: rawData["given_name"],
        lastName: rawData["family_name"],
        roles: roles,
        permissions: corePermissions, // Only core permissions for authorization
        isActive: true, // Assume active if JWT is valid
        emailConfirmed: true, // Assume confirmed if JWT is valid
    };

    return normalizedUser;
};

// Merge user info with profile data
export function mergeUserWithProfile(
    user: UserInfo,
    profile: UserProfile
): UserInfo {
    return {
        ...user,
        firstName: profile.firstName || user.firstName,
        lastName: profile.lastName || user.lastName,
        gender: profile.gender,
        birthDate: profile.birthDate,
        phone: profile.phone,
        country: profile.country,
        city: profile.city,
        province: profile.province,
        address: profile.address,
        image: profile.image,
        // Cập nhật avatar để sử dụng image từ profile nếu có
        avatar: profile.image || user.avatar || user.picture,
        // Cập nhật name với dữ liệu profile
        name:
            profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`.trim()
                : user.name,
    };
}

// Helper function to get user display name
export const getUserDisplayName = (user: UserInfo | null): string => {
    if (!user) return "Guest";

    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }

    if (user.name) {
        return user.name;
    }

    return user.email;
};

// Helper function to check if user has specific core permission
export const hasPermission = (
    user: UserInfo | null,
    permission: string
): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
};

// Helper function to check if user has any of the specified core permissions
export const hasAnyPermission = (
    user: UserInfo | null,
    permissions: string[]
): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) =>
        user.permissions.includes(permission)
    );
};

// Helper function to check if user has specific role
export const hasRole = (user: UserInfo | null, role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
};

// Helper function to check if user has any of the specified roles
export const hasAnyRole = (user: UserInfo | null, roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some((role) => user.roles.includes(role));
};

// Constants for common core permissions (adjust based on your needs)
export const CORE_PERMISSIONS = {
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

    // Client management`
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
} as const;

// Type for core permission values
export type CorePermission =
    (typeof CORE_PERMISSIONS)[keyof typeof CORE_PERMISSIONS];

// Admin role constant
export const ADMIN_ROLE = "Admin";

// Helper function to check if user is admin
export const isAdmin = (user: UserInfo | null): boolean => {
    return hasRole(user, ADMIN_ROLE);
};
