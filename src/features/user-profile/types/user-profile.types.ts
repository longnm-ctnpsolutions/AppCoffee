"use client"

import { z } from "zod"

export const userProfileSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, "Tên là bắt buộc."),
  lastName: z.string().min(1, "Họ là bắt buộc."),
  role: z.string(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.date({
    required_error: "Ngày sinh là bắt buộc.",
  }).optional(),
  
  // Contact Info
  email: z.string().email("Địa chỉ email không hợp lệ.").min(1, "Email là bắt buộc."),
  phone: z.string().min(1, "Số điện thoại là bắt buộc."),

  // Address Info
  address: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

export type UserProfileSchema = z.infer<typeof userProfileSchema>
