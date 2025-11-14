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
    .min(1, { message: "Password is required." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
      message: "Password must contain at least one lowercase letter, one uppercase letter, and one number.",
    }),
  rePassword: z.string()
    .min(1, { message: "Password confirmation is required." }),
}).refine((data) => data.password === data.rePassword, {
  message: "Passwords don't match",
  path: ["rePassword"],
})

export function CreateNewPasswordForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showRePassword, setShowRePassword] = React.useState(false)
  const [activeTooltip, setActiveTooltip] = React.useState<keyof z.infer<typeof formSchema> | null>(null)
  const searchParams = useSearchParams()
  const { resetPassword, isActionLoading, error } = useAuthActions()
  
  const languages = [
    { code: 'EN', name: 'English', flag: '/images/en.png' },
    { code: 'VI', name: 'Vietnamese', flag: '/images/vi.png' }
  ]

  // State to track form submission success
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [localError, setLocalError] = React.useState('')
  
  // Lấy email và token từ URL params
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

  // Initialize language from localStorage or default to English
  const [selectedLanguage, setSelectedLanguage] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('layout-language')
      if (savedLanguage) {
        return languages.find(lang => lang.code === savedLanguage) || languages[0]
      }
    }
    return languages[0] // Default to English
  })

  // Handle language change and save to localStorage
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

  // Handle click outside to close tooltips
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Don't close if clicking on tooltip trigger elements or tooltip content
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
    
    // Validate email và token có tồn tại
    if (!email || !token) {
      setLocalError('Missing email or token. Please try again from the email link.')
      return
    }

    try {
      // Gọi resetPassword từ context
      const success = await resetPassword(email, token, values.password)
      
      if (success) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setLocalError('Failed to reset password. Please try again.')
    }
  }

  // If form is submitted successfully, show success message
  if (isSubmitted) {
    return (
      <TooltipProvider>
        <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center">
              <Image src="/images/ctnp-logo.png" alt="Logo" width={50} height={50} data-ai-hint="logo" />
              <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Create New Password</h1>
            </div>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center my-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Image src="/images/success-icon.svg" alt="Success" width={32} height={32} data-ai-hint="icon"/>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-center mb-8">
            Password changed successfully, you can login again with new password
          </p>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button variant="outline" className="w-full h-12 text-base" asChild>
            <Link href="/en/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Sign In
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
              <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Create New Password</h1>
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
                            placeholder="Enter your new password"
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
                            placeholder="Confirm your password"
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
                  Creating Password...
                </>
              ) : (
                'Create Password'
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

        <Button variant="outline" className="w-full h-12 text-base" asChild>
          <Link href="/en/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Sign In
          </Link>
        </Button>
      </div>
    </TooltipProvider>
  )
}