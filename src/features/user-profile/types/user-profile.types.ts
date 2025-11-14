"use client";

import { z } from "zod";

enum Gender {
    Male = 0,
    Female = 1,
    Other = 2,
}

export const userProfileSchema = z.object({
    // Basic Info
    userId: z.string(),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    role: z.array(z.string()).optional(),
    gender: z.nativeEnum(Gender).nullable().optional(),
    birthDate: z
        .date({
            required_error: "A date of birth is required.",
        })
        .optional(),

    // Contact Info
    email: z
        .string()
        .email("Invalid email address.")
        .min(1, "Email is required."),
    //phone: z.string().min(1, "Phone number is required."),
    phone: z.string().optional().nullable(),

    // Address Info
    address: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    connection: z.string().optional().nullable(),
    bankAccount: z.string().optional().nullable(),
});

export type UserProfileSchema = z.infer<typeof userProfileSchema>;
