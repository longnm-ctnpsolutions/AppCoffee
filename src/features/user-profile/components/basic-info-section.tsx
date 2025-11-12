"use client"

import * as React from "react"
import { UseFormReturn } from "react-hook-form"
import { CalendarIcon, KeyRound, Copy } from "lucide-react"
import { format } from "date-fns"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Calendar } from "@/shared/components/ui/calendar"
import { useToast } from "@/shared/hooks/use-toast"
import { cn } from "@/shared/lib/utils"
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types"

interface BasicInfoSectionProps {
  form: UseFormReturn<UserProfileSchema>
  isPending?: boolean
}

export function BasicInfoSection({ form, isPending }: BasicInfoSectionProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The user ID has been copied.",
      })
    })
  }

  const userId = "b2272b77-8cec-4186-a2d0-9d14767aa110"

  return (
    <Card className="bg-white dark:bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Basic Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Row 1: Avatar and ID Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-28 w-28 border-2 border-muted">
            <AvatarImage src="https://placehold.co/112x112.png" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>LN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ID: {userId}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(userId)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full max-w-xs">
              <KeyRound className="mr-2 h-4 w-4" />
              Change your password
            </Button>
          </div>
        </div>

        {/* Row 2: First Name and Last Name */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Remaining Inputs */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
           <div className="sm:col-span-1">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
           </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:col-span-1">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date <span className="text-destructive">*</span></FormLabel>
                      <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isPending}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select birth date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
