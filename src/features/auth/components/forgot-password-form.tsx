
"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronDown, ArrowLeft } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form"
import { Input } from "@/shared/components/ui/input"
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
})

export function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
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
          <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
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
                  <Input placeholder="Enter your email" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 text-base font-semibold" style={{backgroundColor: '#003366'}}>
            Recover Password
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
  )
}
