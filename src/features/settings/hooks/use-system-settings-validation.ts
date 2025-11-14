import { useState, useRef, useCallback } from "react";

interface ValidationErrors {
    passwordHistoryCount?: string;
    passwordExpiryDays?: string;
}

interface ValidationStatus {
    passwordHistoryCount: {
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    };
    passwordExpiryDays: {
        isValidating: boolean;
        isValid: boolean | null;
        error?: string;
    };
}

interface UseSystemSettingsValidationProps {
    onValidationChange?: (hasErrors: boolean) => void;
}

export const useSystemSettingsValidation = ({
    onValidationChange,
}: UseSystemSettingsValidationProps) => {
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
        passwordHistoryCount: { isValidating: false, isValid: null },
        passwordExpiryDays: { isValidating: false, isValid: null },
    });

    const passwordHistoryCountTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const passwordExpiryDaysTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Validate positive number
    const validatePositiveNumber = useCallback(
        (
            value: string,
            fieldName: "passwordHistoryCount" | "passwordExpiryDays"
        ): boolean => {
            if (!value.trim()) {
                const errorMsg = `${
                    fieldName === "passwordHistoryCount"
                        ? "Password history count"
                        : "Password expiry days"
                } is required`;
                setValidationErrors((prev) => ({
                    ...prev,
                    [fieldName]: errorMsg,
                }));
                setValidationStatus((prev) => ({
                    ...prev,
                    [fieldName]: {
                        isValidating: false,
                        isValid: false,
                        error: errorMsg,
                    },
                }));
                onValidationChange?.(true);
                return false;
            }

            const num = Number(value);
            if (isNaN(num) || num <= 0) {
                const errorMsg = `${
                    fieldName === "passwordHistoryCount"
                        ? "Password history count"
                        : "Password expiry days"
                } must be a positive number`;
                setValidationErrors((prev) => ({
                    ...prev,
                    [fieldName]: errorMsg,
                }));
                setValidationStatus((prev) => ({
                    ...prev,
                    [fieldName]: {
                        isValidating: false,
                        isValid: false,
                        error: errorMsg,
                    },
                }));
                onValidationChange?.(true);
                return false;
            }

            setValidationErrors((prev) => ({
                ...prev,
                [fieldName]: undefined,
            }));
            setValidationStatus((prev) => ({
                ...prev,
                [fieldName]: { isValidating: false, isValid: true },
            }));
            onValidationChange?.(false);
            return true;
        },
        [onValidationChange]
    );

    // Debounced validation
    const debouncedValidation = useCallback(
        (
            fieldName: "passwordHistoryCount" | "passwordExpiryDays",
            value: string,
            timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
        ) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setValidationStatus((prev) => ({
                ...prev,
                [fieldName]: { isValidating: false, isValid: null },
            }));

            timeoutRef.current = setTimeout(() => {
                validatePositiveNumber(value, fieldName);
            }, 800);
        },
        [validatePositiveNumber]
    );

    // Validate single field (real-time)
    const validateField = useCallback(
        (
            field: "passwordHistoryCount" | "passwordExpiryDays",
            value: string
        ) => {
            if (field === "passwordHistoryCount") {
                setValidationStatus((prev) => ({
                    ...prev,
                    passwordHistoryCount: {
                        isValidating: false,
                        isValid: null,
                    },
                }));

                if (!value.trim()) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        passwordHistoryCount:
                            "Password history count is required",
                    }));
                    setValidationStatus((prev) => ({
                        ...prev,
                        passwordHistoryCount: {
                            isValidating: false,
                            isValid: false,
                            error: "Password history count is required",
                        },
                    }));
                    onValidationChange?.(true);
                    return false;
                }

                debouncedValidation(
                    "passwordHistoryCount",
                    value,
                    passwordHistoryCountTimeoutRef
                );
                return true;
            }

            if (field === "passwordExpiryDays") {
                setValidationStatus((prev) => ({
                    ...prev,
                    passwordExpiryDays: { isValidating: false, isValid: null },
                }));

                if (!value.trim()) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        passwordExpiryDays: "Password expiry days is required",
                    }));
                    setValidationStatus((prev) => ({
                        ...prev,
                        passwordExpiryDays: {
                            isValidating: false,
                            isValid: false,
                            error: "Password expiry days is required",
                        },
                    }));
                    onValidationChange?.(true);
                    return false;
                }

                debouncedValidation(
                    "passwordExpiryDays",
                    value,
                    passwordExpiryDaysTimeoutRef
                );
                return true;
            }

            return true;
        },
        [debouncedValidation, onValidationChange]
    );

    // Validate all fields before save
    const validateAllFieldsBeforeSave = useCallback(
        async (
            passwordHistoryCount: number | string,
            passwordExpiryDays: number | string
        ): Promise<boolean> => {
            const historyCountValid = validatePositiveNumber(
                passwordHistoryCount.toString(),
                "passwordHistoryCount"
            );
            const expiryDaysValid = validatePositiveNumber(
                passwordExpiryDays.toString(),
                "passwordExpiryDays"
            );

            return historyCountValid && expiryDaysValid;
        },
        [validatePositiveNumber]
    );

    // Validate form
    const validateForm = useCallback(
        (
            passwordHistoryCount: number | string,
            passwordExpiryDays: number | string
        ): boolean => {
            const errors: ValidationErrors = {};

            // Validate passwordHistoryCount
            if (!passwordHistoryCount?.toString().trim()) {
                errors.passwordHistoryCount =
                    "Password history count is required";
            } else {
                const num = Number(passwordHistoryCount);
                if (isNaN(num) || num <= 0) {
                    errors.passwordHistoryCount =
                        "Password history count must be a positive number";
                }
            }

            // Validate passwordExpiryDays
            if (!passwordExpiryDays?.toString().trim()) {
                errors.passwordExpiryDays = "Password expiry days is required";
            } else {
                const num = Number(passwordExpiryDays);
                if (isNaN(num) || num <= 0) {
                    errors.passwordExpiryDays =
                        "Password expiry days must be a positive number";
                }
            }

            setValidationErrors(errors);
            const hasErrors = Object.keys(errors).length > 0;
            onValidationChange?.(hasErrors);

            return !hasErrors;
        },
        [onValidationChange]
    );

    // Clear validation errors
    const clearValidationErrors = useCallback(
        (field?: keyof ValidationErrors) => {
            if (field) {
                setValidationErrors((prev) => ({
                    ...prev,
                    [field]: undefined,
                }));

                setValidationStatus((prev) => ({
                    ...prev,
                    [field]: { isValidating: false, isValid: null },
                }));
            } else {
                setValidationErrors({});
                setValidationStatus({
                    passwordHistoryCount: {
                        isValidating: false,
                        isValid: null,
                    },
                    passwordExpiryDays: { isValidating: false, isValid: null },
                });
            }
        },
        []
    );

    // Cleanup
    const cleanup = useCallback(() => {
        if (passwordHistoryCountTimeoutRef.current) {
            clearTimeout(passwordHistoryCountTimeoutRef.current);
        }
        if (passwordExpiryDaysTimeoutRef.current) {
            clearTimeout(passwordExpiryDaysTimeoutRef.current);
        }
    }, []);

    return {
        validationErrors,
        validationStatus,
        validateField,
        validateForm,
        validateAllFieldsBeforeSave,
        clearValidationErrors,
        cleanup,
    };
};
