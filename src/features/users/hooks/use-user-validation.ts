import { useState, useRef, useCallback } from "react";
import {
    UserFormData,
    ValidationErrors,
    ValidationStatus,
} from "../types/user.types";
import {
    isValidFirstName,
    isValidLastName,
    isValidPassword,
} from "../lib/validation";

interface UseUserValidationProps {
    fetchUsersByField: (field: string, value: string) => Promise<any>;
    onValidationChange?: (hasErrors: boolean) => void;
}

export const useUserValidation = ({
    fetchUsersByField,
    onValidationChange,
}: UseUserValidationProps) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
        name: { isValidating: false, isValid: null },
    });

    const nameValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const validateUserName = useCallback(
        async (name: string, currentClientId: string): Promise<boolean> => {
            if (!name.trim()) {
                return false;
            }
            try {
                setValidationStatus((prev) => ({
                    ...prev,
                    name: { isValidating: true, isValid: null },
                }));

                setValidationStatus((prev) => ({
                    ...prev,
                    name: { isValidating: false, isValid: true },
                }));
                setValidationErrors((prev) => ({
                    ...prev,
                    name: undefined,
                }));
                onValidationChange?.(false);
                return true;
            } catch (error) {
                console.error("Name validation error:", error);
                setValidationStatus((prev) => ({
                    ...prev,
                    name: {
                        isValidating: false,
                        isValid: false,
                        error: "Failed to validate name",
                    },
                }));
                setValidationErrors((prev) => ({
                    ...prev,
                    name: "Failed to validate name",
                }));
                onValidationChange?.(true);
                return false;
            }
        },
        [onValidationChange]
    );

    const validateForm = useCallback(
        (UserData: UserFormData): boolean => {
            const errors: ValidationErrors = {};

            if (!UserData.firstName.trim()) {
                errors.firstName = "First name is required";
            } else if (!isValidFirstName(UserData.firstName)) {
                errors.firstName = "First name contains invalid characters";
            }

            if (!UserData.lastName.trim()) {
                errors.lastName = "Last name is required";
            } else if (!isValidLastName(UserData.lastName)) {
                errors.lastName = "Last name contains invalid characters";
            }

            setValidationErrors(errors);
            const hasErrors = Object.keys(errors).length > 0;
            onValidationChange?.(hasErrors);

            return !hasErrors;
        },
        [onValidationChange]
    );

    const clearValidationErrors = useCallback(
        (field?: keyof ValidationErrors) => {
            if (field) {
                setValidationErrors((prev) => ({
                    ...prev,
                    [field]: undefined,
                }));
            } else {
                setValidationErrors({});
                setValidationStatus({
                    name: { isValidating: false, isValid: null },
                });
            }
        },
        []
    );

    // Cleanup
    const cleanup = useCallback(() => {
        if (nameValidationTimeoutRef.current) {
            clearTimeout(nameValidationTimeoutRef.current);
        }
    }, []);

    const debouncedNameValidation = useCallback(
        (name: string, clientId: string) => {
            if (nameValidationTimeoutRef.current) {
                clearTimeout(nameValidationTimeoutRef.current);
            }

            nameValidationTimeoutRef.current = setTimeout(() => {
                validateUserName(name, clientId);
            }, 500);
        },
        [validateUserName]
    );

    const validateField = useCallback(
        (
            field: keyof UserFormData,
            value: string,
            clientData: UserFormData
        ) => {
            if (field === "firstName") {
                setValidationStatus((prev) => ({
                    ...prev,
                    firstName: { isValidating: false, isValid: null },
                }));

                if (!value.trim()) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        firstName: "This field is required",
                    }));
                    return false;
                }

                if (!isValidFirstName(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        firstName:
                            "The input value must not contain special characters.",
                    }));
                    return false;
                }
            }
            if (field === "lastName") {
                setValidationStatus((prev) => ({
                    ...prev,
                    lastName: { isValidating: false, isValid: null },
                }));

                if (!value.trim()) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        lastName: "This field is required",
                    }));
                    return false;
                }

                if (!isValidFirstName(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        lastName:
                            "The input value must not contain special characters.",
                    }));
                    return false;
                }
            }

            if (field === "password") {
                setValidationStatus((prev) => ({
                    ...prev,
                    password: { isValidating: false, isValid: null },
                }));

                if (!value.trim()) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password: "This field is required",
                    }));
                    return false;
                }

                if (!/[A-Z]/.test(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password:
                            "Password must contain at least one uppercase letter",
                    }));
                    return false;
                }

                if (!/[a-z]/.test(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password:
                            "Password must contain at least one lowercase letter",
                    }));
                    return false;
                }

                if (!/\d/.test(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password: "Password must contain at least one number",
                    }));
                    return false;
                }

                if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password: "Password must contain at least one special character",
                    }));
                    return false;
                }

                if (value.length < 8) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        password: "Password must be at least 8 characters long",
                    }));
                    return false;
                }
            }
            return true;
        },
        []
    );

    return {
        validationErrors,
        validationStatus,
        validateForm,
        clearValidationErrors,
        cleanup,
        validateUserName,
        validateField,
    };
};
