"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, ChevronDown, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";
import { useAuthActions } from "@/shared/context/auth-context";
const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Trường này là bắt buộc." })
        .max(50, { message: "Email không được vượt quá 50 ký tự." })
        .trim()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
            message: "Email không được chứa khoảng trắng ở đầu hoặc cuối.",
        }),
    password: z.string()
        .min(1, { message: "Trường này là bắt buộc." })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
            message: "Mật khẩu phải từ 8 ký tự trở lên, bao gồm chữ hoa, chữ thường và số.",
        }),
    rememberMe: z.boolean().default(false).optional(),
});

export function LoginForm() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [activeTooltip, setActiveTooltip] = React.useState<keyof z.infer<typeof formSchema> | null>(null);
    const { login, loginWithGoogle, loginWithMicrosoft, isActionLoading, error } = useAuthActions();

    const languages = [
        { code: 'VI', name: 'Tiếng Việt', flag: '/images/vi.png' },
        { code: 'EN', name: 'English', flag: '/images/en.png' }
    ];

    // Initialize language from localStorage or default to English
    const [selectedLanguage, setSelectedLanguage] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('layout-language');
            if (savedLanguage) {
                return languages.find(lang => lang.code === savedLanguage) || languages[0];
            }
        }
        return languages[0]; // Default to English
    });

    // Handle language change and save to localStorage
    const handleLanguageChange = React.useCallback((language: typeof languages[0]) => {
        setSelectedLanguage(language);
        if (typeof window !== 'undefined') {
            localStorage.setItem('layout-language', language.code);
        }
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');

        if (accessToken) {
            console.log('OAuth callback detected, AuthProvider will handle it');
        }
    }, []);

    const handleClickOutside = React.useCallback(
        React.useMemo(() => {
            let timeoutId: NodeJS.Timeout;
            return (event: MouseEvent) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    const target = event.target as HTMLElement;
                    if (target.closest('[data-tooltip-trigger]') || target.closest('[data-radix-tooltip-content]')) {
                        return;
                    }
                    setActiveTooltip(null);
                }, 10);
            };
        }, []),
        []
    );

    React.useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [handleClickOutside]);

    const onSubmit = React.useCallback(async (values: z.infer<typeof formSchema>) => {
        
        const success = await login(
            values.email,
            values.password,
            process.env.NEXT_PUBLIC_IDENTITY_CLIENT_ID!,
            values.rememberMe || false,
        );
        //
    }, [login]);

    // OAuth handlers
    const handleGoogleLogin = React.useCallback(() => {
        loginWithGoogle();
    }, [loginWithGoogle]);

    const handleMicrosoftLogin = React.useCallback(() => {
        loginWithMicrosoft();
    }, [loginWithMicrosoft]);

    return (
        <TooltipProvider>
            <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
                <div className="flex flex-col items-center mb-2">
                    <div className="flex items-center">
                        {/* FIX: Add proper sizing to prevent aspect ratio issues */}
                        <Image
                            src="/images/ctnp-logo.png"
                            alt="Logo"
                            width={50}
                            height={50}
                            className="object-contain mr-3"
                            priority
                            data-ai-hint="logo"
                        />
                        <h1 className="text-2xl font-bold text-foreground">Đăng nhập</h1>
                    </div>
                </div>

                {/* Language selector temporarily hidden - using invisible to maintain layout */}
                <div className="flex justify-end mb-4 invisible">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Image
                                    src={selectedLanguage.flag}
                                    alt={`${selectedLanguage.name} Flag`}
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 rounded-full object-cover"
                                    data-ai-hint="flag"
                                />
                                <span>{selectedLanguage.code.toUpperCase()}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {languages.map((language) => (
                                <DropdownMenuItem
                                    key={language.code}
                                    onClick={() => handleLanguageChange(language)}
                                >
                                    <Image
                                        src={language.flag}
                                        alt={`${language.name} Flag`}
                                        width={20}
                                        height={20}
                                        className="mr-2 w-5 h-5 rounded-full object-cover"
                                        data-ai-hint="flag"
                                    />
                                    <span>{language.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Tooltip open={activeTooltip === "email"}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="relative"
                                                    data-tooltip-trigger
                                                >
                                                    {/* FIX: Add autocomplete attribute */}
                                                    <Input
                                                        type="email"
                                                        placeholder="Nhập email của bạn"
                                                        autoComplete="email"
                                                        {...field}
                                                        className={`h-12 text-base ${form.formState.errors.email ? "pr-10 border-destructive" : ""}`}
                                                        disabled={isActionLoading}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (form.formState.errors.email) {
                                                                setActiveTooltip(activeTooltip === "email" ? null : "email");
                                                            } else {
                                                                setActiveTooltip(null);
                                                            }
                                                        }}
                                                    />
                                                    {form.formState.errors.email && (
                                                        <AlertCircle
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                                        />
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            {form.formState.errors.email && (
                                                <TooltipContent
                                                    side="bottom"
                                                    align="start"
                                                    sideOffset={0}
                                                    className="bg-destructive text-white text-xs"
                                                >
                                                    <p>{form.formState.errors.email.message}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Tooltip open={activeTooltip === "password"}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="relative"
                                                    data-tooltip-trigger
                                                >
                                                    {/* FIX: Add autocomplete attribute */}
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Nhập mật khẩu của bạn"
                                                        autoComplete="current-password"
                                                        {...field}
                                                        className={`h-12 text-base pr-10 ${form.formState.errors.password ? "border-destructive" : ""}`}
                                                        disabled={isActionLoading}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (form.formState.errors.password) {
                                                                setActiveTooltip(activeTooltip === "password" ? null : "password");
                                                            } else {
                                                                setActiveTooltip(null);
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowPassword(!showPassword);
                                                        }}
                                                        disabled={isActionLoading}
                                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                                    >
                                                        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                    </Button>
                                                    {form.formState.errors.password && (
                                                        <AlertCircle
                                                            className="absolute right-10 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                                        />
                                                    )}
                                                </div>
                                            </TooltipTrigger>
                                            {form.formState.errors.password && (
                                                <TooltipContent
                                                    side="bottom"
                                                    align="start"
                                                    sideOffset={0}
                                                    className="bg-destructive text-white text-xs"
                                                >
                                                    <p>{form.formState.errors.password.message}</p>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            id="rememberMe"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isActionLoading}
                                        />
                                    </FormControl>
                                    <label
                                        htmlFor="rememberMe"
                                        className={`text-sm font-medium leading-none select-none ${isActionLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                            }`}
                                    >
                                        Ghi nhớ tôi
                                    </label>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#003366] hover:bg-[#002244] focus:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>

                        <div className="text-center">
                            <Link href="/vi/auth/forgot-password" className="text-sm text-primary hover:underline focus:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </form>
                </Form>

                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        hoặc
                    </span>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                    {/* Google OAuth Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isActionLoading}
                        onClick={handleGoogleLogin}
                    >
                        <Image
                            src="/images/google-logo.svg"
                            alt="Google Logo"
                            width={20}
                            height={20}
                            className="mr-2 object-contain"
                            data-ai-hint="google logo"
                        />
                        Đăng nhập với Google
                    </Button>

                    {/* Microsoft OAuth Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isActionLoading}
                        onClick={handleMicrosoftLogin}
                    >
                        <Image
                            src="/images/microsoft-logo.svg"
                            alt="Microsoft Logo"
                            width={20}
                            height={20}
                            className="mr-2 object-contain"
                            data-ai-hint="microsoft logo"
                        />
                        Đăng nhập với Microsoft
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
