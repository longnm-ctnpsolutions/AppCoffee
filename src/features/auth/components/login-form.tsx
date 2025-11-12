
"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff, ChevronDown } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Separator } from "@/shared/components/ui/separator"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean().default(false).optional(),
})

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "admin@bstvn.com",
      password: "",
      rememberMe: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <div className="w-full max-w-[360px] xs:bg-card xs:p-8 xs:rounded-2xl xs:border xs:shadow-lg">
      <div className="flex flex-col items-center mb-2">
        <div className="flex items-center gap-3">
          <Image src="/images/new-icon.png" alt="Logo" width={32} height={32} data-ai-hint="logo" />
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image src="https://placehold.co/20x15.png" alt="UK Flag" width={20} height={15} data-ai-hint="uk flag" />
              <span>EN</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Image src="https://placehold.co/20x15.png" alt="UK Flag" width={20} height={15} className="mr-2" data-ai-hint="uk flag" />
              <span>English</span>
            </DropdownMenuItem>
             <DropdownMenuItem>
              <Image src="https://placehold.co/20x15.png" alt="Vietnam Flag" width={20} height={15} className="mr-2" data-ai-hint="vietnam flag" />
              <span>Vietnamese</span>
            </DropdownMenuItem>
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
                  <Input placeholder="admin@bstvn.com" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      className="h-12 text-base pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember Me
                  </label>
                </FormItem>
              )}
            />
             <Link href="/en/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
              </Link>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" style={{backgroundColor: '#003366'}}>
            Sign in
          </Button>
        </form>
      </Form>
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>
      <Button variant="outline" className="w-full h-12 text-base">
        <Image src="https://placehold.co/20x20.png" alt="Microsoft Logo" width={20} height={20} className="mr-2" data-ai-hint="microsoft logo" />
        Login with Microsoft
      </Button>
    </div>
  )
}
