import { useState, useCallback } from "react";
import { UserFormData } from "../types/user.types";

interface UseUserActionsProps {
    selectedUser: any;
    updateStatus: (user: any, active: boolean) => Promise<boolean>;
    updateUserData: (id: string, data: any) => Promise<boolean>;
}

export const useUserActions = ({
    selectedUser,
    updateStatus,
    updateUserData,
}: UseUserActionsProps) => {
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleDeactivate = useCallback(async () => {
        if (!selectedUser?.id || !updateStatus) return;

        setIsDeactivating(true);

        try {
            const currentStatus = selectedUser.lockoutEnabled;
            const newStatus = currentStatus; 
            const success = await updateStatus(selectedUser, newStatus);

            if (success) {
                console.log(
                    `User ${
                        newStatus === true ? "deactivated" : "activated"
                    } successfully`
                );
            }
        } catch (error) {
        } finally {
            setIsDeactivating(false);
        }
    }, [selectedUser, updateStatus]);

    const handleSave = useCallback(
        async (
            UserData: UserFormData,
            validateForm: () => boolean,
            validateName: (name: string, id: string) => Promise<boolean>,
            nameValidationStatus: any,
            onSuccess: (data: UserFormData) => void
        ) => {
            if (!selectedUser?.id) return false;

            // Validate form first
            const isFormValid = validateForm();
            if (!isFormValid) return false;

            // Check validation status
            if (nameValidationStatus.isValidating) return false;
            if (nameValidationStatus.isValid === false) return false;

            setIsSaving(true);

            try {
                const updateData = {
                    userId: UserData.id,
                    password: UserData.password,
                    firstName: UserData.firstName.trim(),
                    lastName: UserData.lastName.trim(),
                };

                const success = await updateUserData(
                    selectedUser.id,
                    updateData
                );

                if (success) {
                    onSuccess(UserData);
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [selectedUser, updateUserData]
    );

    return {
        isDeactivating,
        isSaving,
        handleDeactivate,
        handleSave,
    };
};