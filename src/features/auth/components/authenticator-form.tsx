"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";
import { useAuthActions } from "@/context/auth-context";
import { useToast } from "@/shared/hooks/use-toast";
import QRCode from "react-qr-code";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/shared/components/ui/tooltip"
import { MfaStatusResponse, SetupMfaResponse } from "@/shared/types/auth.types";

const formSchema = z.object({
    otp: z
        .string()
        .length(6, { message: "OTP phải có đúng 6 chữ số." })
        .regex(/^\d{6}$/, { message: "OTP chỉ được chứa số." }),
});

export function AuthenticatorForm() {
    const { toast } = useToast();
    const [otp, setOtp] = React.useState<string[]>(Array(6).fill(""));
    const [open, setOpen] = React.useState(false)

    const [status, setStatus] = React.useState<MfaStatusResponse | null>(null);
    const [setup, setSetup] = React.useState<SetupMfaResponse | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { otp: "" },
    });

    const { mfaStatus, mfaSetup, verifyFa } = useAuthActions();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    React.useEffect(() => {
        if (!token) {
            setError("Thiếu token. Vui lòng đăng nhập trước.");
            setIsLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const result = await mfaStatus(token);
                setStatus(result);

                const setupMfa = await mfaSetup(token)
                setSetup(setupMfa)

            } catch (err) {
                setError("Không thể lấy trạng thái MFA.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        form.setValue("otp", newOtp.join(""));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (token) {
                const success = await verifyFa(token, false, values.otp);
            }
        } catch (error) {
            console.error("OTP verify error:", error);
        }
    }

    function useIsMobile() {
        const [isMobile, setIsMobile] = React.useState(false)

        React.useEffect(() => {
            const checkMobile = () => setIsMobile(window.innerWidth <= 768)
            checkMobile()
            window.addEventListener("resize", checkMobile)
            return () => window.removeEventListener("resize", checkMobile)
        }, [])

        return isMobile
    }

    const isMobile = useIsMobile()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-sm text-destructive">
                <div className="mt-4">
                    <Link href="/vi/auth/login">
                        <Button variant="outline">Quay lại trang Đăng nhập</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[400px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg 
         max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent md:max-h-none md:overflow-visible">

            <div className="flex flex-col items-center mb-4">
                <div className="flex items-center">
                    <Image
                        src="/images/ctnp-logo.png"
                        alt="Logo"
                        width={50}
                        height={50}
                        className="object-contain mr-3"
                        priority
                    />
                    <h1 className="text-2xl font-bold text-foreground">
                        {status?.twoFactorEnabled ? "Xác minh 2 bước" : "Thêm ứng dụng xác thực"}
                    </h1>
                </div>
            </div>

            {!status?.twoFactorEnabled && (
                <div className="mt-4 text-left">
                    <h2 className="text-base font-semibold text-foreground">
                        Bước 1: Quét mã QR này
                    </h2>
                    <p className="text-xs text-muted-foreground mt-2">
                        Quét mã QR sau đây bằng ứng dụng xác thực của bạn.
                    </p>

                    <div className="mt-4 flex justify-center">
                        <div className="p-3 bg-white border rounded-lg shadow-md">
                            <QRCode
                                value={setup?.uri ?? ""}
                                size={160}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="M"
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <TooltipProvider>
                            <Tooltip open={open} onOpenChange={setOpen} delayDuration={0} disableHoverableContent>
                                <TooltipTrigger asChild>
                                    <span
                                        onClick={() => setOpen(!open)}
                                        className="text-xs text-blue-600 underline transition-colors cursor-pointer"
                                    >
                                        Cách sử dụng ứng dụng Xác thực?
                                    </span>
                                </TooltipTrigger>

                                <TooltipContent
                                    side={isMobile ? "top" : "right"}
                                    align="center"
                                    sideOffset={isMobile ? 0 : 12}
                                    className="max-w-xs text-left p-3 text-xs leading-relaxed border border-border bg-muted text-muted-foreground rounded-md"
                                >
                                    <p>1. Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Microsoft Authenticator</strong>.</p>
                                    <p>2. Chọn <strong>Thêm tài khoản</strong> hoặc <strong>"+"</strong>.</p>
                                    <p>3. <strong>Quét mã QR</strong> hiển thị trên màn hình.</p>
                                    <p>4. Sau khi quét, ứng dụng sẽ hiển thị một <strong>mã 6 chữ số</strong>. Nhập mã đó vào <strong>Bước 2</strong>.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}

            {!status?.twoFactorEnabled && (
                <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    </span>
                </div>
            )}


            {/* ⬇️ Phần Form giữ nguyên */}
            <Form {...form}>
                <div className="mt-4 text-left mb-4">
                    {!status?.twoFactorEnabled && (
                        <h2 className="text-base font-semibold text-foreground">
                            Bước 2: Nhập mã sử dụng một lần
                        </h2>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                        Nhập mã xác minh gồm 6 chữ số được tạo bởi ứng dụng xác thực.
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="otp"
                        render={() => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex justify-between gap-2">
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                autoComplete="off"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                onChange={(e) => handleChange(e.target.value, index)}
                                                onKeyDown={(e) => handleKeyDown(e, index)}
                                                className="w-12 h-12 text-center text-lg font-semibold border rounded-md focus:ring-2 focus:ring-[#003366]"
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                                {form.formState.errors.otp && (
                                    <p className="text-destructive text-xs mt-2">
                                        {form.formState.errors.otp.message}
                                    </p>
                                )}
                            </FormItem>
                        )}
                    />

                    {/* ✅ Tăng khoảng cách giữa ô OTP và nút */}
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold bg-[#003366] hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed mt-8 mb-4"
                    >
                        Tiếp tục
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

    );
}
