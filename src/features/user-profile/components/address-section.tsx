"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { MapPin } from "lucide-react";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/shared/components/ui/form";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import type { UserProfileSchema } from "@/features/user-profile/types/user-profile.types";

interface AddressSectionProps {
    form: UseFormReturn<UserProfileSchema>;
    isPending?: boolean;
    disabled?: boolean;
}

export function AddressSection({
    form,
    isPending,
    disabled = false,
}: AddressSectionProps) {
    const isDisabled = disabled || isPending;

    return (
        <Card className="bg-white dark:bg-card shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="font-medium">
                        {[
                            form.watch("country"),
                            form.watch("city"),
                            form.watch("province"),
                            form.watch("address"),
                        ]
                            .filter(Boolean)
                            .join(", ")}
                    </span>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter country"
                                        {...field}
                                        value={field.value ?? ""}
                                        disabled={isDisabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter city"
                                        {...field}
                                        value={field.value ?? ""}
                                        disabled={isDisabled}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State/Province/Area</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter state/province/area"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isDisabled}
                                />
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
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter address"
                                    {...field}
                                    value={field.value ?? ""}
                                    disabled={isDisabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
