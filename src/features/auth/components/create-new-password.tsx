"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronDown, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useSearchParams } from 'next/navigation'

import { Button } from "@/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { Separator } from "@/shared/components/ui/separator"
import Link from "next/link"
import { useAuthActions } from "@/context/auth-context"

const formSchema = z.object({
  password: z.string()
    .min(1, { message: "Mật khẩu là bắt buộc." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
      message: "Mật khẩu phải chứa ít nhất một chữ thường, một chữ hoa, và một số.",
    }),
  rePassword: z.string()
    .min(1, { message: "Xác nhận mật khẩu là bắt buộc." }),
}).refine((data) => data.password === data.rePassword, {
  message: "Mật khẩu không khớp",
  path: ["rePassword"],
})

export function CreateNewPasswordForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showRePassword, setShowRePassword] = React.useState(false)
  const [activeTooltip, setActiveTooltip] = React.useState<keyof z.infer<typeof formSchema> | null>(null)
  const searchParams = useSearchParams()
  const { resetPassword, isActionLoading, error } = useAuthActions()
  
  const languages = [
    { code: 'VI', name: 'Tiếng Việt', flag: '/images/vi.png' },
    { code: 'EN', name: 'English', flag: '/images/en.png' }
  ]

  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [localError, setLocalError] = React.useState('')
  
  const [email, setEmail] = React.useState('')
  const [token, setToken] = React.useState('')

  React.useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    const tokenFromUrl = searchParams.get('token')
    
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl))
    }
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    }
    
    console.log('Email from URL:', emailFromUrl)
    console.log('Token from URL:', tokenFromUrl)
  }, [searchParams])

  const [selectedLanguage, setSelectedLanguage] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('layout-language')
      if (savedLanguage) {
        return languages.find(lang => lang.code === savedLanguage) || languages[0]
      }
    }
    return languages[0]
  })

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language)
    if (typeof window !== 'undefined') {
      localStorage.setItem('layout-language', language.code)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      rePassword: "",
    },
  })

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (target.closest('[data-tooltip-trigger]') || target.closest('[data-radix-tooltip-content]')) {
        return
      }
      
      setActiveTooltip(null)
    }
    
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLocalError('')
    
    if (!email || !token) {
      setLocalError('Thiếu email hoặc token. Vui lòng thử lại từ liên kết trong email.')
      return
    }

    try {
      const success = await resetPassword(email, token, values.password)
      
      if (success) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Lỗi đặt lại mật khẩu:', error)
      setLocalError('Không thể đặt lại mật khẩu. Vui lòng thử lại.')
    }
  }

  if (isSubmitted) {
    return (
      <TooltipProvider>
        <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center">
              <Image src="/images/ctnp-logo.png" alt="Logo" width={50} height={50} data-ai-hint="logo" />
              <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Tạo mật khẩu mới</h1>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Image src="/images/success-icon.svg" alt="Success" width={32} height={32} data-ai-hint="icon"/>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-center mb-8">
            Mật khẩu đã được thay đổi thành công, bạn có thể đăng nhập lại bằng mật khẩu mới.
          </p>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              hoặc
            </span>
          </div>

          <Button variant="outline" className="w-full h-12 text-base" asChild>
            <Link href="/vi/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại trang Đăng nhập
            </Link>
          </Button>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
        <div className="flex flex-col items-center mb-2">
          <div className="flex items-center">
              <Image src="/images/ctnp-logo.png" alt="Logo" width={50} height={50} data-ai-hint="logo" />
              <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Tạo mật khẩu mới</h1>
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
                  className="rounded-full object-cover"
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }}
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
                    className="mr-2 rounded-full object-cover" 
                    style={{ width: '20px', height: '20px', borderRadius: '50%' }}
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
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Nhập mật khẩu mới của bạn"
                            {...field}
                            className={`h-12 text-base pr-10 ${form.formState.errors.password ? "border-destructive" : ""}`}
                            disabled={isActionLoading}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (form.formState.errors.password) {
                                setActiveTooltip(activeTooltip === "password" ? null : "password")
                              } else {
                                setActiveTooltip(null)
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowPassword(!showPassword)
                            }}
                            disabled={isActionLoading}
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
              name="rePassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tooltip open={activeTooltip === "rePassword"}>
                      <TooltipTrigger asChild>
                        <div 
                          className="relative"
                          data-tooltip-trigger
                        >
                          <Input
                            type={showRePassword ? "text" : "password"}
                            placeholder="Xác nhận mật khẩu của bạn"
                            {...field}
                            className={`h-12 text-base pr-10 ${form.formState.errors.rePassword ? "border-destructive" : ""}`}
                            disabled={isActionLoading}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (form.formState.errors.rePassword) {
                                setActiveTooltip(activeTooltip === "rePassword" ? null : "rePassword")
                              } else {
                                setActiveTooltip(null)
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowRePassword(!showRePassword)
                            }}
                            disabled={isActionLoading}
                          >
                            {showRePassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                          </Button>
                          {form.formState.errors.rePassword && (
                            <AlertCircle
                              className="absolute right-10 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                            />
                          )}
                        </div>
                      </TooltipTrigger>
                      {form.formState.errors.rePassword && (
                        <TooltipContent 
                          side="bottom"
                          align="start"
                          sideOffset={0}
                          className="bg-destructive text-white text-xs"
                        >
                          <p>{form.formState.errors.rePassword.message}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold" 
              style={{backgroundColor: '#003366'}}
              disabled={isActionLoading || !email || !token}
            >
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo mật khẩu...
                </>
              ) : (
                'Tạo mật khẩu'
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

        <Button variant="outline" className="w-full h-12 text-base" asChild>
          <Link href="/vi/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại trang Đăng nhập
          </Link>
        </Button>
      </div>
    </TooltipProvider>
  )
}
