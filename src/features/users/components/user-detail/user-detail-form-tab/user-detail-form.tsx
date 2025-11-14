import * as React from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useEffect, useMemo } from "react";
import { useUsersActions, useUserDetail } from "@/context/users-context";
import { Role } from "@/features/roles/types/role.types";
import { ActionButtons } from "./actions-button";
import { FormField } from "./form-field-enhanced";
import { useUserFormState } from "@/features/users/hooks/use-user-form-state";
import { useUserValidation } from "@/features/users/hooks/use-user-validation";
import { useUserActions } from "@/features/users/hooks/use-user-actions";
import { UserPermissions } from "@/shared/types/permissions.types";
import { format } from "date-fns";

// Type for form data matching API structure
interface UserFormData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roles: Role;
}

interface UserDetailsFormProps {
    error?: string | null;
    permissions: UserPermissions;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ error, permissions }) => {
    const { updateStatus, updateUserData, fetchUsersByField } = useUsersActions();
    const { selectedUser } = useUserDetail();

    const userStatus = useMemo(() => selectedUser?.lockoutEnabled, [selectedUser?.lockoutEnabled]);
    const { canChangeStatus, canEdit } = permissions
    // Custom hooks
    const {
        isEditable,
        setIsEditable,
        activeTooltip,
        setActiveTooltip,
        userData,
        originalData,
        hasChanges,
        updateUserData: updateFormData,
        resetToOriginal,
        updateOriginalData
    } = useUserFormState({ selectedUser });


    const {
        validationErrors,
        validationStatus,
        validateForm,
        clearValidationErrors,
        validateUserName,
        cleanup,
        validateField
    } = useUserValidation({
        fetchUsersByField,
        onValidationChange: (hasErrors) => {
            if (hasErrors && Object.keys(validationErrors).length > 0) {
                const firstErrorField = Object.keys(validationErrors)[0] as keyof typeof validationErrors;
                setActiveTooltip(firstErrorField);
            }
        }
    });

    const {
        isDeactivating,
        isSaving,
        handleDeactivate,
        handleSave: performSave
    } = useUserActions({
        selectedUser,
        updateStatus,
        updateUserData
    });

    // Computed values
    const hasValidationErrors = useMemo(() => {
        return Object.keys(validationErrors).length > 0 || validationStatus.name.isValid === false;
    }, [validationErrors, validationStatus.name.isValid]);

    const canSave = useMemo(() => {
        const hasFirstNameError = validationErrors.firstName;
        const hasLastNameError = validationErrors.lastName;
        const hasPassword = validationErrors.password;
         const hasOtherErrors = Object.keys(validationErrors).some(
            key => !['firstName', 'lastName', 'password'].includes(key)
            );

        return hasChanges &&
            !hasFirstNameError &&
            !hasLastNameError &&
            !hasPassword &&
            !hasOtherErrors &&
            !validationStatus.name.isValidating &&
            userData.firstName.trim().length > 0;
    }, [hasChanges, validationErrors, validationStatus.name, userData.firstName, userData.lastName, userData.password]);

    // Event handlers
    const handleInputChange = (field: keyof typeof userData, value: string) => {
        updateFormData(field, value);

        // Clear validation error for this field when user starts typing
        if (validationErrors[field as keyof typeof validationErrors]) {
            clearValidationErrors(field as keyof typeof validationErrors);
            setActiveTooltip(null);
        }

        // Field-specific validation
        if (isEditable) {
            validateField(field, value, userData);
        }
    };

    const handleSave = async () => {
        await performSave(
            {
                ...userData,
                id: userData.id,
            },
            () => validateForm(userData),
            validateUserName,
            validationStatus.name,
            (newData) => {
                updateOriginalData(newData);
                setIsEditable(false);
                clearValidationErrors();
                setActiveTooltip(null);
            }
        );
    };


    const handleCancel = () => {
        resetToOriginal();
        clearValidationErrors();
    };

    const handleEdit = () => {
        setIsEditable(true);
    };


    // Click outside handler to close tooltips
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-radix-popper-content-wrapper]') &&
                !target.closest('input') &&
                !target.closest('[data-state="open"]')) {
                setActiveTooltip(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // const [isDeactivating, setIsDeactivating] = useState(false);
    // const [isSaving, setIsSaving] = useState(false);

    // const { updateStatus, updateUserData, users, fetchUsersByField } = useUsersActions();
    // const { selectedUser } = useUserDetail();
    // const userStatus = useMemo(() => selectedUser?.lockoutEnabled, [selectedUser?.lockoutEnabled]);


    // // Initialize userData with proper structure
    // const [userData, setUserData] = useState<UserFormData>(() => ({
    //     id: selectedUser?.id || "",
    //     email: selectedUser?.email || "",
    //     firstName: selectedUser?.profile.firstName || "",
    //     lastName: selectedUser?.profile.lastName || "",
    //     password: selectedUser?.password || "",
    //     roles: { id: "", description: "", name: "" },
    // }));

    // // Original data để có thể cancel/rollback
    // const [originalData, setOriginalData] = useState<UserFormData>(() => ({
    //     id: selectedUser?.id || "",
    //     email: selectedUser?.email || "",
    //     firstName: selectedUser?.profile.firstName || "",
    //     lastName: selectedUser?.profile.lastName || "",
    //     password: selectedUser?.password || "",
    //     roles: { id: "", description: "", name: "" },
    // }));

    // // Update khi selectedUser thay đổi
    // const initializedRef = useRef<string | null>(null);
    // useEffect(() => {
    //     if (selectedUser && initializedRef.current !== selectedUser.id) {
    //         const newData: UserFormData = {
    //             id: selectedUser?.id || "",
    //             email: selectedUser?.email || "",
    //             firstName: selectedUser?.profile.firstName || "",
    //             lastName: selectedUser?.profile.lastName || "",
    //             password: selectedUser?.password || "",
    //             roles: { id: "", description: "", name: "" },
    //         };

    //         setUserData(newData);
    //         setOriginalData(newData);
    //         initializedRef.current = selectedUser.id;
    //         setIsEditable(false);
    //     }
    // }, [selectedUser?.id]);

    // const canSave = useMemo(() => {
    //     const hasNameError = validationErrors.name || validationStatus.name.isValid === false;
    //     const hasOtherErrors = Object.keys(validationErrors).filter(key => key !== 'name').length > 0;

    //     return hasChanges &&
    //            !hasNameError &&
    //            !hasOtherErrors &&
    //            !validationStatus.name.isValidating &&
    //            UserData.name.trim().length > 0;
    //   }, [hasChanges, validationErrors, validationStatus.name, UserData.name]);

    // const handleInputChange = (field: keyof UserFormData, value: string) => {
    //     setUserData((prev) => ({
    //         ...prev,
    //         [field]: value,
    //     }));
    // };

    // const handleSave = async () => {
    //     if (!selectedUser?.id || !userData.email.trim()) return;

    //     setIsSaving(true);

    //     try {
    //         const updateData = {
    //             name: userData.email.trim(),
    //         };

    //         const success = await updateUserData(selectedUser.id, updateData);

    //         if (success) {
    //             setOriginalData({ ...userData });
    //             setIsEditable(false);
    //         }
    //     } catch (error) {
    //         console.error("❌ Unexpected error during user update:", error);
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };

    // const handleCancel = () => {
    //     setUserData({ ...originalData });
    //     setIsEditable(false);
    // };

    // const hasChanges = useMemo(() => {
    //     return JSON.stringify(userData) !== JSON.stringify(originalData);
    // }, [userData, originalData]);

    return (
        <>
            {/* Details form card */}
            <Card className="space-y-2 p-6 shadow-md border border-gray-100">
                <ActionButtons
                    isEditable={isEditable}
                    isDeactivating={isDeactivating}
                    isSaving={isSaving}
                    canSave={canSave}
                    userStatus={userStatus}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onDeactivate={handleDeactivate}
                    canEdit={canEdit}
                    canChangeStatus={canChangeStatus}
                />
                <FormField
                    label="User ID"
                    field="id"
                    placeholder="Enter user Id"
                    disabled={true}
                    isEditable={isEditable}
                    value={userData.id}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />

                <FormField
                    label="Email"
                    field="email"
                    placeholder="Enter email"
                    disabled={true}
                    required={true}
                    isEditable={isEditable}
                    value={userData.email}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />

                <FormField
                    label="First Name"
                    field="firstName"
                    placeholder="Enter first name"
                    disabled={false}
                    required={true}
                    isEditable={isEditable}
                    value={userData.firstName}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={50}
                />


                <FormField
                    label="Last Name"
                    field="lastName"
                    placeholder="Enter last name"
                    disabled={false}
                    required={true}
                    isEditable={isEditable}
                    value={userData.lastName}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={50}
                />

                <FormField
                    label="Connection"
                    field="connection"
                    placeholder="Enter connection"
                    disabled={true}
                    isEditable={isEditable}
                    value={userData.connection}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />

            {userData.connection === "Database" && (
                <FormField
                    label="Password"
                    field="password"
                    placeholder="***********"
                    disabled={false}
                    isEditable={isEditable}
                    value={userData.password ?? ""}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />
            )}

                <FormField
                    label="Signed Up"
                    field="signedUp"
                    placeholder="Enter signed up"
                    disabled={true}
                    isEditable={isEditable}
                    value={
                        userData.signedUp
                            ? format(new Date(userData.signedUp), "MMMM do yyyy, HH:mm")
                            : ""
                    }
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />
            </Card>
        </>
    );
};

export default UserDetailsForm;
