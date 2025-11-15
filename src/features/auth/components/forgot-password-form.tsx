"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronDown, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
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
import { useAuthActions } from "@/context/auth-context";
import { useToast } from "@/shared/hooks/use-toast";

const formSchema = z.object({
    email: z.string()
        .min(1, { message: "Trường này là bắt buộc." })
        .max(50, { message: "Email không được vượt quá 50 ký tự." })
        .trim()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
            message: "Định dạng email không hợp lệ.",
        }),
});

export function ForgotPasswordForm() {
    const [activeTooltip, setActiveTooltip] = React.useState<keyof z.infer<typeof formSchema> | null>(null);
    const { forgotPassword, isActionLoading } = useAuthActions();
    const { toast } = useToast();

    const languages = [
        { code: 'VI', name: 'Tiếng Việt', flag: '/images/vi.png' },
        { code: 'EN', name: 'English', flag: '/images/en.png' }
    ];

    const [selectedLanguage, setSelectedLanguage] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('layout-language');
            if (savedLanguage) {
                return languages.find(lang => lang.code === savedLanguage) || languages[0];
            }
        }
        return languages[0];
    });

    const handleLanguageChange = (language: typeof languages[0]) => {
        setSelectedLanguage(language);
        if (typeof window !== 'undefined') {
            localStorage.setItem('layout-language', language.code);
        }
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (target.closest('[data-tooltip-trigger]') || target.closest('[data-radix-tooltip-content]')) {
                return;
            }

            setActiveTooltip(null);
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const success = await forgotPassword(values.email);

            if (success) {
                form.reset();
            }
        } catch (error) {
            console.error('Lỗi quên mật khẩu:', error);
        }
    }

    return (
        <TooltipProvider>
            <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
                <div className="flex flex-col items-center mb-2">
                    <div className="flex items-center">
                        <Image 
                            src="/images/ctnp-logo.png" 
                            alt="Logo" 
                            width={50} 
                            height={50}
                            className="object-contain mr-3"
                            priority
                            data-ai-hint="logo" 
                        />
                        <h1 className="text-2xl font-bold text-foreground">Quên mật khẩu?</h1>
                    </div>
                </div>

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

                <p className="text-muted-foreground text-sm mb-6 text-start">
                    Nhập email của bạn, chúng tôi sẽ gửi mã xác minh đến email của bạn
                </p>

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

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#003366] hover:bg-[#002244] focus:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                'Khôi phục mật khẩu'
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        hoặc
                    </span>
                </div>

                <Button 
                    variant="outline" 
                    className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed" 
                    asChild
                >
                    <Link href="/vi/auth/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại trang Đăng nhập
                    </Link>
                </Button>
            </div>
        </TooltipProvider>
    );
}
