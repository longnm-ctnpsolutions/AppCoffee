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

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      return token;
    }
  }

  if (tokenProvider) {
    return tokenProvider();
  }

  return null;
};

const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    if (token) {
      return token;
    }
  }

  if (refreshTokenProvider) {
    return refreshTokenProvider();
  }

  return null;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

declare global {
  interface Window {
    __authRedirectInProgress?: boolean;
  }
}

const clearAuthAndRedirect = async () => {
  if (typeof window !== 'undefined') {
    window.__authRedirectInProgress = true;
  }

  if (clearAuthFunction) {
    clearAuthFunction();
  }

  if (typeof window !== 'undefined') {
    const authKeys = [
      'accessToken',
      'refreshToken',
      'tokenType',
      'tokenExpiry',
      'userInfo',
      'username',
      'permissions',
      'roles',
      'clients'
    ];

    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  if (logoutFunction) {
    try {
      await logoutFunction();
      return; // Logout function handles redirect
    } catch (error) {
      console.warn('⚠️ Logout function failed, falling back to redirect:', error);
    }
  }
  redirectToLogin();
};

const refreshTokenIfNeeded = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken || !tokenRefreshFunction) {
    await clearAuthAndRedirect();
    return false;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      await tokenRefreshFunction(refreshToken);
      return true;
    } catch (error) {
      await clearAuthAndRedirect();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const redirectToLogin = () => {
    if (typeof window !== "undefined") {
        const currentUrl =
            window.location.pathname +
            window.location.search +
            window.location.hash;
        sessionStorage.setItem("redirectAfterLogin", currentUrl);
        const encodedReturnUrl = encodeURIComponent(currentUrl);
        window.location.href = `/en/auth/login?returnUrl=${encodedReturnUrl}`;
    }
};

export const getReturnUrl = (defaultUrl: string = "/"): string => {
    if (typeof window === "undefined") return defaultUrl;

  // Thu thập tất cả params từ cả search và hash
  const allParams = new URLSearchParams();

  // 1. Thêm params từ search
  if (window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.forEach((value, key) => {
      allParams.set(key, value);
    });
  }

  // 2. Thêm params từ hash (nếu hash có dạng #path?key=value)
  if (window.location.hash && window.location.hash.includes('?')) {
    const hashPart = window.location.hash.split('?')[1]; // Lấy phần sau dấu ?
    const hashParams = new URLSearchParams(hashPart);
    hashParams.forEach((value, key) => {
      // Hash params ưu tiên hơn search params
      allParams.set(key, value);
    });
  }
  const redirectUrlFromParam = allParams.get("redirectUrl");
  if (redirectUrlFromParam) {
    try {
      const decoded = decodeURIComponent(redirectUrlFromParam);

      // Kiểm tra nếu là relative path
      if (decoded.startsWith('/')) {
        return decoded;
      }

      try {
        new URL(decoded);
        return decoded;
      } catch {
        console.warn('⚠️ Invalid redirectUrl format, skipping:', decoded);
      }
    } catch (error) {
      console.warn('⚠️ Failed to decode redirectUrl:', error);
    }
  }

  const returnUrlFromParam = allParams.get("returnUrl");
  if (returnUrlFromParam) {
    try {
      const decoded = decodeURIComponent(returnUrlFromParam);
      return decoded;
    } catch (error) {
      console.warn('⚠️ Failed to decode returnUrl:', error);
    }
  }

  // Check sessionStorage
  const returnUrlFromSession = sessionStorage.getItem("redirectAfterLogin");
  if (returnUrlFromSession) {
    sessionStorage.removeItem("redirectAfterLogin");
    console.log('✅ Using returnUrl from session:', returnUrlFromSession);
    return returnUrlFromSession;
  }

  console.log('⚠️ No returnUrl/redirectUrl found, using default:', defaultUrl);
  return defaultUrl;
};

export const cleanTokensFromUrl = (urlString: string): string => {
  try {
    const url = urlString.startsWith('http')
      ? new URL(urlString)
      : new URL(urlString, window.location.origin);
    url.searchParams.delete('accessToken');
    url.searchParams.delete('refreshToken');
    if (url.hash.includes('access_token=')) {
      url.hash = url.hash
        .replace(/[?&]?access_token=[^&]*(&)?/g, '$1')
        .replace(/[?&]?refresh_token=[^&]*(&)?/g, '$1')
        .replace(/^#&/, '#')
        .replace(/^#$/, '');
    }
    return urlString.startsWith('http')
      ? url.toString()
      : url.pathname + url.search + url.hash;
  } catch (error) {
    return urlString
      .replace(/[?&]accessToken=[^&]*(&)?/g, '$1')
      .replace(/[?&]refreshToken=[^&]*(&)?/g, '$1')
      .replace(/[?&]$/, '');
  }
};

export const redirectAfterLogin = () => {
    if (typeof window !== "undefined") {
        const returnUrl = getReturnUrl();

    if (isValidReturnUrl(returnUrl)) {
      window.location.href = returnUrl;
    } else {
      window.location.href = '/';
    }
  }
};

const isValidReturnUrl = (url: string): boolean => {
  try {
    if (url.startsWith('/')) {
      return true;
    }

    const returnUrlObj = new URL(url, window.location.origin);
    return returnUrlObj.origin === window.location.origin;
  } catch {
    return false;
  }
};

const createApiError = (
  message: string,
  status: number,
  code?: string,
  details?: any,
  shouldRetry?: boolean
): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  error.details = details;
  error.shouldRetry = shouldRetry;
  return error;
};

export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401) {
    const refreshSuccess = await refreshTokenIfNeeded();
    if (refreshSuccess) {
      throw createApiError('Token refreshed, retry needed', 401, 'TOKEN_REFRESHED', null, true);
    } else {
      throw createApiError('Authentication failed', 401, 'UNAUTHORIZED', null, false);
    }
  }

    if (!response.ok) {
        let errorData: ErrorResponse | null = null;

        try {
            errorData = await response.json();
            // const text = await response.text();
            // if (text) {
            //   errorData = JSON.parse(text);
            // }
        } catch (parseError) {
            console.warn("Failed to parse error response:", parseError);
        }

        let errorMessage = "Unknown error";

        if (errorData?.errors) {
          errorMessage = Object.values(errorData.errors).flat()[0] as string;
        }
        else {
          errorMessage =
          errorData?.message ||
          getDefaultErrorMessage(response.status) ||
          `HTTP error! status: ${response.status}`;
        }

        throw createApiError(
            errorMessage,
            response.status,
            errorData?.code,
            errorData
        );
    }

  try {
    const text = await response.text();

    if (!text || text.trim() === '') {
      return {} as T;
    }

    const data = JSON.parse(text);
    return data;

  } catch (parseError) {
    throw createApiError('Invalid response format', 500, 'PARSE_ERROR', parseError);
  }
};

const getDefaultErrorMessage = (status: number): string => {
    switch (status) {
        case 400:
            return "Bad request - Please check your input data";
        case 401:
            return "Unauthorized - Please login again";
        case 403:
            return "Forbidden - You do not have permission for this action";
        case 404:
            return "Resource not found";
        case 409:
            return "Conflict - Resource already exists or is being used";
        case 422:
            return "Validation failed - Please check your input data";
        case 429:
            return "Too many requests - Please try again later";
        case 500:
            return "Internal server error - Please try again later";
        case 502:
            return "Bad gateway - Service temporarily unavailable";
        case 503:
            return "Service unavailable - Please try again later";
        default:
            return "An unexpected error occurred";
    }
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

// Helper function to build headers with authentication (JWT only)
const buildHeaders = (
    customHeaders: HeadersInit = {},
    body?: any
): HeadersInit => {
    const headers: Record<string, string> = {};

    // ❌ Chỉ thêm Content-Type nếu KHÔNG phải FormData
    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    // Thêm custom headers (nếu có)
    Object.assign(headers, customHeaders);

    // Thêm token (nếu có)
    const token = getAuthToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
};


export const apiCall = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
  const makeRequest = async (retryCount = 0): Promise<T> => {
    const finalOptions: RequestInit = {
      ...options,
      headers: buildHeaders(options.headers, options.body),
    };

    try {
      const response = await fetch(url, finalOptions);
      return await handleResponse<T>(response);
    } catch (error: any) {
      // If token was refreshed and we haven't retried yet, try again
      if (error.code === 'TOKEN_REFRESHED' && retryCount === 0) {
        return makeRequest(1); // Retry once with new token
      }

      console.error(`API Call failed: ${finalOptions.method || 'GET'} ${url}`, error);
      throw error;
    }
  };

  return makeRequest();
};

export const odataApiCall = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<ODataResponse<T>> => {
  const makeRequest = async (retryCount = 0): Promise<ODataResponse<T>> => {
    const finalOptions: RequestInit = {
      ...options,
      headers: buildHeaders(options.headers, options.body),
    };

    try {
      const response = await fetch(url, finalOptions);
      return await handleODataResponse<T>(response);
    } catch (error: any) {
      if (error.code === 'TOKEN_REFRESHED' && retryCount === 0) {
        return makeRequest(1); // Retry once with new token
      }

      throw error;
    }
  };

  return makeRequest();
};
