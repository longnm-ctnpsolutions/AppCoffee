"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions, useAuthState } from "@/shared/context/auth-context";
import {
    accessClient,
    getClientById,
} from "@/shared/api/services/clients/clients.service";

import authService from "@/shared/api/services/auth/auth.service";

interface AuthGuardProps {
    children: ReactNode;
}

const ALLOWED_REDIRECT_DOMAINS = [
    "test.eoffice.ctnpsolutions.com",
    "eoffice.ctnpsolutions.com",
    "account.ctnpsolutions.com",
];

const isValidRedirectUrl = (url: string): boolean => {
    if (url.startsWith("/") && !url.startsWith("//")) {
        return true;
    }

    try {
        const urlObj = new URL(url);

        if (!["https:", "http:"].includes(urlObj.protocol)) {
            return false;
        }

        return ALLOWED_REDIRECT_DOMAINS.some(
            (domain) =>
                urlObj.hostname === domain ||
                urlObj.hostname.endsWith("." + domain)
        );
    } catch {
        return false;
    }
};

const getUrlParams = () => {
    if (typeof window === "undefined") return null;

    const params = {
        redirect: null as string | null,
        returnUrl: null as string | null,
        clientId: null as string | null,
        hasHashPath: false,
    };

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.includes("?")) {
            const [hashPath, hashQuery] = hash.split("?");
            params.hasHashPath = hashPath.length > 0;

            const hashParams = new URLSearchParams(hashQuery);
            params.redirect = hashParams.get("redirect");
            params.returnUrl = hashParams.get("returnUrl");
            params.clientId = hashParams.get("clientId");
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (!params.redirect) params.redirect = urlParams.get("redirect");
    if (!params.returnUrl) params.returnUrl = urlParams.get("returnUrl");
    if (!params.clientId) params.clientId = urlParams.get("clientId");

    return params;
};

const hasOAuthParams = (): boolean => {
    if (typeof window === "undefined") return false;

    const params = getUrlParams();
    return !!(params?.redirect && params?.clientId);
};

const Spinner = () => (
    <div className="flex items-center justify-center">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150"></div>
        </div>
    </div>
);

const LoadingOverlay = ({ message = "Loading..." }: { message?: string }) => (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50">
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Spinner />
            <div className="text-gray-600 text-lg font-medium">{message}</div>
        </div>
    </div>
);

export function AuthGuard({ children }: AuthGuardProps) {
    const pathname = usePathname();
    const router = useRouter();
    const authState = useAuthState();
    const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

    const hasCalledAccessClient = useRef(false);

    const publicRoutes = [
        "/en/auth/login",
        "/en/auth/register",
        "/en/auth/forgot-password",
        "/en/auth/reset-password",
        "/en/auth/verify-email",
        "/en/auth/create-new-password",
        "/en/auth/authenticator",
    ];

    const loginRoutes = ["/en/auth/login"];

    const signOutRoutes = ["/en/signout"];

    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );
    const isLoginRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );
    const isSignOutRoute = signOutRoutes.some((route) =>
        pathname.startsWith(route)
    );

    const isAuthenticated = (() => {
        if (!authState.isAuthenticated || !authState.user) {
            return false;
        }

        if (authState.authType === "cookie") {
            return true;
        }

        if (authState.authType === "token") {
            const stateToken = authState.tokens?.accessToken;

            if (typeof window !== "undefined") {
                const localToken =
                    localStorage.getItem("accessToken") ||
                    sessionStorage.getItem("accessToken");
                return !!(stateToken && localToken);
            }

            return !!stateToken;
        }

        return false;
    })();

    useEffect(() => {
        if (!authState.isInitialized) {
            return;
        }

        if (typeof window !== "undefined" && !authState.isAuthenticated) {
            const urlParams = new URLSearchParams(window.location.search);
            const hashPart = window.location.hash;

            const hasAccessTokenInSearch = urlParams.has("accessToken");
            const hasAccessTokenInHash = hashPart.includes("access_token=");

            if (hasAccessTokenInSearch || hasAccessTokenInHash) {
                if (!isProcessingOAuth) {
                    setIsProcessingOAuth(true);
                }

                const timeout = setTimeout(() => {
                    setIsProcessingOAuth(false);
                }, 10000);

                return () => clearTimeout(timeout);
            }
        }

        if (authState.isAuthenticated && isProcessingOAuth) {
            setIsProcessingOAuth(false);
        }

        if (
            typeof window !== "undefined" &&
            (window as any).__oauthRedirectInProgress
        ) {
            return;
        }

        if (pathname === "/") {
            if (hasOAuthParams()) {
                if (typeof window !== "undefined") {
                    const params = getUrlParams();
                    if (params?.hasHashPath) {
                        const hash = window.location.hash;
                        const newUrl = "/en/auth/login/" + hash;
                        router.replace(newUrl);
                        return;
                    }
                }
                return;
            }

            if (isAuthenticated) {
                router.replace("/en/applications");
            } else {
                if (typeof window !== "undefined") {
                    const fullUrl =
                        window.location.pathname +
                        window.location.search +
                        window.location.hash;
                    if (fullUrl !== "/") {
                        router.replace(fullUrl);
                    } else {
                        router.replace("/en/auth/login");
                    }
                } else {
                    router.replace("/en/auth/login");
                }
            }
            return;
        }

        if (isAuthenticated && pathname === "/en/auth/login") {
            if (typeof window !== "undefined") {
                const params = getUrlParams();

                if (params?.redirect && params?.clientId) {
                    // TODO
                    // const targetUrl = decodeURIComponent(params.redirectUrl);

                    // if (!isValidRedirectUrl(targetUrl)) {
                    //   router.replace('/en/applications');
                    //   return;
                    // }
                    // if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                    //   window.location.href = targetUrl;
                    // } else {
                    //   router.replace(targetUrl);
                    // }
                    return;
                }

                let targetUrl: string;
                if (params?.returnUrl) {
                    targetUrl = decodeURIComponent(params.returnUrl);
                } else {
                    targetUrl = "/en/applications";
                }

                if (!isValidRedirectUrl(targetUrl)) {
                    targetUrl = "/en/applications";
                }

                if (
                    targetUrl.startsWith("http://") ||
                    targetUrl.startsWith("https://")
                ) {
                    window.location.href = targetUrl;
                } else {
                    router.replace(targetUrl);
                }
            }
            return;
        }

        if (!isAuthenticated && !isPublicRoute && pathname !== "/") {
            if (hasOAuthParams()) {
                return;
            }

            if (typeof window !== "undefined") {
                const currentPath = pathname + window.location.search;
                const returnUrl = encodeURIComponent(currentPath);
                router.replace(`/en/auth/login?returnUrl=${returnUrl}`);
            }
            return;
        }
    }, [
        authState.isInitialized,
        authState.isAuthenticated,
        isAuthenticated,
        pathname,
        router,
        isPublicRoute,
        isProcessingOAuth,
    ]);

    if (isSignOutRoute) {
        const urlParams = new URLSearchParams(window.location.search);
        var clientId = urlParams.get("clientId");
        if (clientId) {
            authService.logout().then(() => {
                window.location.href =
                    "/en/auth/login?redirect=true&clientId=" + clientId;
            });
        }
        return <LoadingOverlay message="Signing out..." />;
    }

    if (isLoginRoute && isAuthenticated) {
        const urlParams = new URLSearchParams(window.location.search);
        var redirect = urlParams.get("redirect");
        var clientId = urlParams.get("clientId");

        if (redirect === "true" && clientId) {
            if (!hasCalledAccessClient.current) {
                hasCalledAccessClient.current = true;
                accessClient(clientId).then((res) => {
                    window.location.href =
                        res.callbackUrl + "?token=" + res.accessToken;
                });
            }
            return <LoadingOverlay message="Redirecting to application..." />;
        } else {
            const returnUrl = urlParams.get("returnUrl");
            if (returnUrl) {
                const targetUrl = decodeURIComponent(returnUrl);
                if (isValidRedirectUrl(targetUrl)) {
                    urlParams.delete("returnUrl");
                    const remainingParams = urlParams.toString();
                    const finalUrl =
                        targetUrl +
                        (remainingParams
                            ? (targetUrl.includes("?") ? "&" : "?") +
                              remainingParams
                            : "");
                    window.location.href = finalUrl;
                    return <LoadingOverlay message="Redirecting..." />;
                }
            }
            window.location.href = "/" + window.location.search;
        }
        return <LoadingOverlay message="Redirecting..." />;
    }

    if (isProcessingOAuth) {
        return <LoadingOverlay message="Processing login..." />;
    }

    if (!authState.isInitialized) {
        return <LoadingOverlay message="Initializing..." />;
    }

    if (pathname === "/" && !hasOAuthParams()) {
        return <>{children}</>;
    }

    if (isPublicRoute && !isAuthenticated) {
        return <>{children}</>;
    }

    if (!isPublicRoute && isAuthenticated) {
        return <>{children}</>;
    }

    return <LoadingOverlay message="Loading..." />;
}
