"use client";

import * as React from "react";
import { Loader2, Save, Pencil } from "lucide-react";
import { CardTitle, CardDescription } from "@/shared/components/ui/card";

import { Button } from "@/shared/components/ui/button";

interface UserProfileHeaderProps {
    isPending: boolean;
    isDirty: boolean;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    isEditMode?: boolean;
    onSave?: () => void;
    canSave?: boolean;
}

export function UserProfileHeader({
    isPending,
    isDirty,
    isEditing,
    onEdit,
    onCancel,
}: UserProfileHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl tracking-tight">
                    User Profile
                </CardTitle>
                <CardDescription>
                    Manage your profile information.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                {!isEditing ? (
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onEdit}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isPending}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
