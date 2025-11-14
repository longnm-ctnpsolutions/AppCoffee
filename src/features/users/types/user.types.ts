export type User = {
    id: string;
    email: string;
    connection: string;
    lockoutEnabled: boolean;
    profile: {
        firstName: string;
        lastName: string;
    };
    // createdAt: string;
    // updatedAt: string;
};

export interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    password?: string;
}

export interface ValidationStatus {
    name: {
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    };
}

export type AddUser = {
    email: string;
    firstName: string;
    lastName: string | undefined;
    lockoutEnabled: boolean;
    password: string | undefined;
    roles: string[] | undefined | "";
};

export type UpdateUser = {
    userId: string;

    password: string | undefined;
    profile: {
        firstName: string;
        lastName: string;
    };
    connection: string;
    signedUp: Date;
};

export type Role = {
    id: string;
    name: string;
};

export type UserFormData = {
    id: string;
    email: string;
    password?: string | undefined;
    firstName: string;
    lastName: string;
    connection: string;
    signedUp: string;
    lockoutEnabled: boolean;
    roles: string[];
};

export type UserRole = {
    id: string;
    name: string;
    description: string;
};

export type ActiveTooltipField = keyof UserFormData | null;
