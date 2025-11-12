"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { AtSign, Copy } from "lucide-react"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { useToast } from "@/shared/hooks/use-toast"
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types"

interface ContactInfoSectionProps {
  form: UseFormReturn<UserProfileSchema>
  isPending?: boolean
}

export function ContactInfoSection({ form, isPending }: ContactInfoSectionProps) {
  const { toast } = useToast()
  const email = form.watch("email")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Đã sao chép vào clipboard",
        description: "Địa chỉ email đã được sao chép.",
      })
    })
  }

  return (
    <Card className="bg-white dark:bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Liên hệ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <AtSign className="h-5 w-5 text-red-600 dark:text-red-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{email}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(email)}>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điện thoại <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
