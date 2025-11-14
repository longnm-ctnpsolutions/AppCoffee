export type Client = {
    id: string;
    name: string;
    description?: string | null;
    homePageUrl?: string | null;
    audience: string;
    issuer: string,
    secretKey?: string,
    tokenExpired:string | number,
    logoUrl?: string | null;
    callbackUrl?: string | null;
    logoutUrl?: string | null;
    clientId?: string;
    status?: number | string;
    identifier?: string;
};

export type Permission = {
    permission: string;
    description: string;
};

export interface ClientFormData {
    id: string;
    name: string;
    identifier: string;
    description: string;
    audience: string;
    issuer: string,
    secretKey?: string,
    tokenExpired:string | number,
    homepageUrl: string;
    logoUrl?: string;
    callbackUrl?: string;
    logoutUrl?: string;
}

export interface ValidationErrors {
    name?: string;
    audience?: string;
    issuer?: string,
    tokenExpired?:string | number,
    homepageUrl?: string;
    logoUrl?: string;
    callbackUrl?: string;
    logoutUrl?: string;
}

export interface ValidationStatus {
  name: { isValidating: boolean; isValid: boolean | null; error?: string };
  audience: { isValidating: boolean; isValid: boolean | null; error?: string };
  issuer: { isValidating: boolean; isValid: boolean | null; error?: string };
  tokenExpired: { isValidating: boolean; isValid: boolean | null; error?: string };
}

export type ActiveTooltipField = keyof ClientFormData | null;
