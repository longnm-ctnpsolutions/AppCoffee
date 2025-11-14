import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ActiveTooltipField, UserFormData } from "@/features/users/types/user.types";

interface UseUserFormStateProps {
    selectedUser: any;
    onDataChange?: (hasChanges: boolean) => void;
}

export const useUserFormState = ({
    selectedUser,
    onDataChange,
}: UseUserFormStateProps) => {
    const [isEditable, setIsEditable] = useState(false);
    const [activeTooltip, setActiveTooltip] =
        useState<ActiveTooltipField>(null);

    // Initialize User data
    const createUserData = useCallback(
        (User: UserFormData): any => ({
            id: User?.id,
            password: User?.password || "",
            email: User?.email,
            connection: User?.connection,
            signedUp: User?.signedUp,
            firstName: User?.firstName,
            lastName: User?.lastName,
            roles: User?.roles
        }),
        []
    );

    const [userData, setUserData] = useState<UserFormData>(() =>
        createUserData(selectedUser)
    );

    const [originalData, setOriginalData] = useState<UserFormData>(() =>
        createUserData(selectedUser)
    );

    // Track initialization to prevent unnecessary re-renders
    const initializedRef = useRef<string | null>(null);

    // Update when selectedUser changes
    useEffect(() => {
        if (selectedUser && initializedRef.current !== selectedUser.id) {
            const newData = createUserData(selectedUser);

            setUserData(newData);
            setOriginalData(newData);
            initializedRef.current = selectedUser.id;
            setIsEditable(false);
            setActiveTooltip(null);
        }
    }, [selectedUser?.id, createUserData]);

    const hasChanges = useMemo(() => {
        const hasChangesValue =
            JSON.stringify(userData) !== JSON.stringify(originalData);
        onDataChange?.(hasChangesValue);
        return hasChangesValue;
    }, [userData, originalData, onDataChange]);

    const updateUserData = useCallback(
        (field: keyof UserFormData, value: string) => {
            setUserData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    const resetToOriginal = useCallback(() => {
        setUserData({ ...originalData });
        setIsEditable(false);
        setActiveTooltip(null);
    }, [originalData]);

    const updateOriginalData = useCallback((newData: UserFormData) => {
        setOriginalData(newData);
        setUserData(newData);
    }, []);

    return {
        isEditable,
        setIsEditable,
        activeTooltip,
        setActiveTooltip,
        userData,
        originalData,
        hasChanges,
        updateUserData,
        resetToOriginal,
        updateOriginalData,
    };
};
