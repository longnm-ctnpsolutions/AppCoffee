export type Role = {
    id: string;
    name?: string;
    description?: string | null;
};

export type RoleUser = {
    id: string;
    email?: string;
    connection?: string;
    lockoutEnabled?: boolean;
};

export interface RoleFormData {
    id: string;
    name: string;
    description: string;
}
