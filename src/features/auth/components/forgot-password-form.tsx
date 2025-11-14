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
        .min(1, { message: "This field is required." })
        .max(50, { message: "Email cannot exceed 50 characters." })
        .trim()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
            message: "Invalid email format.",
        }),
});

export function ForgotPasswordForm() {
    const [activeTooltip, setActiveTooltip] = React.useState<keyof z.infer<typeof formSchema> | null>(null);
    const { forgotPassword, isActionLoading } = useAuthActions();
    const { toast } = useToast();

    const languages = [
        { code: 'EN', name: 'English', flag: '/images/en.png' },
        { code: 'VI', name: 'Vietnamese', flag: '/images/vi.png' }
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

    // Handle click outside to close tooltips
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Don't close if clicking on tooltip trigger elements or tooltip content
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
            console.error('Forgot password error:', error);
        }
    }

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
                        <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                    </div>
                </div>

                <div className="flex justify-end mb-4 invisible">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-1 text-sm text-muted-foreground">
                                {/* FIX: Remove conflicting style attributes and use only Tailwind */}
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
                                    {/* FIX: Same fix for flag images */}
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
                    Enter your email, we will send a verification code to your email
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
                                                    {/* FIX: Add autocomplete and type attributes */}
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
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

                        {/* FIX: Replace inline styles with Tailwind classes */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-[#003366] hover:bg-[#002244] focus:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Recover Password'
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        or
                    </span>
                </div>

                <Button 
                    variant="outline" 
                    className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed" 
                    asChild
                >
                    <Link href="/en/auth/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Return to Sign In
                    </Link>
                </Button>
            </div>
        </TooltipProvider>
    );
}