"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/shared/components/ui/form";
import { useToast } from "@/shared/hooks/use-toast";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { BasicInfoSection } from "./basic-info-sections";
import { ContactInfoSection } from "./contact-info-section";
import { AddressSection } from "./address-section";
import { UserProfileHeader } from "./user-profile-header";
import { useAuthActions, useAuth } from "@/shared/context/auth-context";
import {
    userProfileSchema,
    UserProfileSchema,
} from "../types/user-profile.types";
import { UpdateProfileRequest } from "@/shared/types/auth.types";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function UserProfileForm() {
    const { toast } = useToast();
    const [isPending, startTransition] = React.useTransition();
    const [isEditing, setIsEditing] = React.useState(false);

    // Use auth context for profile data
    const { profile, isProfileLoading } = useAuth();
    const { updateUserProfile, getUserProfile } = useAuthActions();

    // Debug: Log profile data
    React.useEffect(() => {
        console.log("=== USER PROFILE FORM DEBUG ===");
        console.log("Profile object:", profile);
        console.log("Is profile loading:", isProfileLoading);
        console.log("==============================");
    }, [profile, isProfileLoading]);

    // Define form
    const form = useForm<UserProfileSchema>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            gender: null,
            birthDate: undefined,
            email: "",
            phone: "",
            address: "",
            country: "",
            city: "",
            province: "",
            image: "",
            bankAccount: "",
        },
    });

    // Load profile data on mount if not already loaded
    React.useEffect(() => {
        const loadProfile = async () => {
            if (!profile && !isProfileLoading) {
                console.log("Profile not loaded, fetching...");
                try {
                    const profileData = await getUserProfile();
                    console.log("Profile loaded successfully:", profileData);
                } catch (error) {
                    console.error("Failed to load profile:", error);
                }
            }
        };

        loadProfile();
    }, [profile, isProfileLoading, getUserProfile]);

    // Update form when profile data changes
    React.useEffect(() => {
        if (profile) {
            console.log("Updating form with profile data...");
            console.log("Profile data to map:", profile);

            const formValues: UserProfileSchema = {
                userId: profile.user?.id || "",
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                gender: profile.gender,
                role: profile.roles,
                birthDate: profile.birthDate
                    ? new Date(profile.birthDate)
                    : undefined,
                email: profile.user?.email || "",
                phone: profile.phone || "",
                address: profile.address || "",
                country: profile.country || "",
                city: profile.city || "",
                province: profile.province || "",
                image: profile.image || "",
                connection: profile.user?.connection,
                bankAccount: profile.bankAccount,
            };

            console.log("Form values to be set:", formValues);
            form.reset(formValues);
        }
    }, [profile, form]);

    // Debug: Watch form values
    const watchedValues = form.watch();
    React.useEffect(() => {
        console.log("Current form values:", watchedValues);
    }, [watchedValues]);

    // Submit handler
    async function onSubmit(values: UserProfileSchema) {
        let birthDate: Date | null | undefined = null;

        if (values.birthDate) {
            const fixedDate = new Date(values.birthDate);
            fixedDate.setHours(12, 0, 0, 0);
            birthDate = fixedDate;
        }

        // Prepare update request
        const updateRequest: UpdateProfileRequest = {
            userId: values.userId,
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
            birthDate: birthDate,
            phone: values.phone,
            email: values.email,
            address: values.address,
            country: values.country,
            city: values.city,
            province: values.province,
            bankAccount: values.bankAccount,
            image: values.image,
        };

        console.log("Update request payload:", updateRequest);

        // Call API via context
        await updateUserProfile(updateRequest);
        await getUserProfile();

        // Tắt chế độ edit sau khi save thành công
        setIsEditing(false);
    }

    // Handler cho nút Edit
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Handler cho nút Cancel
    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
    };

    // Show loading state
    if (isProfileLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="h-full flex flex-col overflow-hidden space-y-4"
            >
                <div className="sticky top-0 z-10 bg-background p-2 pb-0">
                    <Card>
                        <CardContent className="p-6">
                            <UserProfileHeader
                                isPending={isPending || isProfileLoading}
                                isDirty={form.formState.isDirty}
                                isEditing={isEditing}
                                onEdit={handleEdit}
                                onCancel={handleCancel}
                            />
                        </CardContent>
                    </Card>
                </div>
                <ScrollArea className="flex-1 p-2">
                    <div className="space-y-6">
                        <BasicInfoSection
                            form={form}
                            isPending={isPending || isProfileLoading}
                            disabled={!isEditing}
                        />
                        <Separator />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
                            <ContactInfoSection
                                form={form}
                                isPending={isPending || isProfileLoading}
                                disabled={!isEditing}
                            />
                            <AddressSection
                                form={form}
                                isPending={isPending || isProfileLoading}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </ScrollArea>
            </form>
        </Form>
    );
}
