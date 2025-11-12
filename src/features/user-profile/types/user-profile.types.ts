"use client"

import { z } from "zod"

export const userProfileSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  role: z.string(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }).optional(),
  
  // Contact Info
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  phone: z.string().min(1, "Phone number is required."),

  // Address Info
  address: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

export type UserProfileSchema = z.infer<typeof userProfileSchema>
