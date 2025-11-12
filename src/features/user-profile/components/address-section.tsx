"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { MapPin } from "lucide-react"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types"

interface AddressSectionProps {
  form: UseFormReturn<UserProfileSchema>
  isPending?: boolean
}

export function AddressSection({ form, isPending }: AddressSectionProps) {
  return (
    <Card className="bg-white dark:bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Địa chỉ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quốc gia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quốc gia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="usa">Hoa Kỳ</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="vietnam">Việt Nam</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập thành phố" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố/Khu vực</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tỉnh/thành phố/khu vực" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Input placeholder="Nhập địa chỉ" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
