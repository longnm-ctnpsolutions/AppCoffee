"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Form } from "@/shared/components/ui/form"
import { useToast } from "@/shared/hooks/use-toast"
import { userProfileSchema, type UserProfileSchema } from "@/features/user-profile/types/user-profile.types"
import { UserProfileHeader } from "./user-profile-header"
import { BasicInfoSection } from "./basic-info-section"
import { Separator } from "@/shared/components/ui/separator"
import { ContactInfoSection } from "./contact-info-section"
import { AddressSection } from "./address-section"
import { ScrollArea } from "@/shared/components/ui/scroll-area"


export default function UserProfileForm() {
  const { toast } = useToast()
  const [isPending, startTransition] = React.useTransition()

  // 1. Define your form.
  const form = useForm<UserProfileSchema>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: "Long",
      lastName: "Nguyen",
      role: "Quản trị viên",
      gender: undefined,
      birthDate: undefined,
      email: "long.nguyen@example.com",
      phone: "",
      address: "",
      country: "",
      city: "",
      state: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: UserProfileSchema) {
    startTransition(async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log(values)
      toast({
        title: "Hồ sơ đã được cập nhật",
        description: "Thông tin hồ sơ của bạn đã được cập nhật thành công.",
      })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col overflow-hidden space-y-4">
        {/* Header - Fixed */}
        <div className="flex-shrink-0">
          <UserProfileHeader isPending={isPending} />
        </div>
        
        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            <BasicInfoSection form={form} isPending={isPending} />
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
              <ContactInfoSection form={form} isPending={isPending} />
              <AddressSection form={form} isPending={isPending} />
            </div>
          </div>
        </ScrollArea>
      </form>
    </Form>
  )
}
