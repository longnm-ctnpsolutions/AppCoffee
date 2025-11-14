
// This file is now mostly a placeholder as API calls are mocked.
// The functions are kept for type consistency and to avoid breaking imports.

export interface ErrorResponse {
  message?: string;
  code?: string;
  details?: any;
  title?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  shouldRetry?: boolean;
}

// Keep providers as they might be used by the AuthContext structure
let tokenProvider: (() => string | null) | null = null;
let refreshTokenProvider: (() => string | null) | null = null;
let tokenRefreshFunction: ((refreshToken: string) => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>) | null = null;
let clearAuthFunction: (() => void) | null = null;
let logoutFunction: (() => Promise<void>) | null = null;

export const setTokenProvider = (provider: () => string | null) => {
  tokenProvider = provider;
};

export const setRefreshTokenProvider = (provider: () => string | null) => {
  refreshTokenProvider = provider;
};

export const setTokenRefreshFunction = (refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>) => {
  tokenRefreshFunction = refreshFn;
};

export const setClearAuthFunction = (clearFn: () => void) => {
  clearAuthFunction = clearFn;
};

export const setLogoutFunction = (logoutFn: () => Promise<void>) => {
  logoutFunction = logoutFn;
};


export const getReturnUrl = (defaultUrl: string = "/"): string => {
    if (typeof window === "undefined") return defaultUrl;
    const returnUrlFromSession = sessionStorage.getItem("redirectAfterLogin");
    if (returnUrlFromSession) {
      sessionStorage.removeItem("redirectAfterLogin");
      return returnUrlFromSession;
    }
    return defaultUrl;
};

export const cleanTokensFromUrl = (urlString: string): string => {
  return urlString;
};

export const redirectAfterLogin = () => {
    if (typeof window !== "undefined") {
        const returnUrl = getReturnUrl();
        window.location.href = returnUrl;
  }
};


export const handleResponse = async <T>(response: Response): Promise<T> => {
    // This is a mock implementation
    if (!`${response.status}`.startsWith('2')) {
         throw new Error(`Mock Error: Status ${response.status}`);
    }
    return response.json() as Promise<T>;
};

export interface ODataResponse<T> {
    "@odata.context": string;
    "@odata.count"?: number;
    "@odata.nextLink"?: string;
    value: T[];
}

export const handleODataResponse = async <T>(
    response: Response
): Promise<ODataResponse<T>> => {
    return handleResponse<ODataResponse<T>>(response);
};


export const apiCall = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    console.log(`Mocking apiCall for: ${options.method || 'GET'} ${url}`);
    return new Promise((resolve) => {
        setTimeout(() => {
             // You can add more sophisticated mocking logic here based on the URL
            resolve({} as T);
        }, 300);
    });
};

export const odataApiCall = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<ODataResponse<T>> => {
  console.log(`Mocking odataApiCall for: ${options.method || 'GET'} ${url}`);
  return new Promise((resolve) => {
        setTimeout(() => {
             resolve({
                '@odata.context': '',
                value: [],
                '@odata.count': 0
            } as ODataResponse<T>);
        }, 300);
    });
};
