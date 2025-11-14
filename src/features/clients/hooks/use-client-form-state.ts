import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ActiveTooltipField, Client, ClientFormData } from "../types/client.types";

interface UseClientFormStateProps {
    selectedClient: any;
    onDataChange?: (hasChanges: boolean) => void;
}

export const useClientFormState = ({
    selectedClient,
    onDataChange,
}: UseClientFormStateProps) => {
    const [isEditable, setIsEditable] = useState(false);
    const [activeTooltip, setActiveTooltip] =
        useState<ActiveTooltipField>(null);

    // Initialize client data
    const createClientData = useCallback(
        (client: Client): ClientFormData => ({
            id: client?.id || "",
            name: client?.name || "",
            identifier: client?.identifier || "",
            audience: client?.audience || "",          
            issuer: client?.issuer || "",               
            tokenExpired: client?.tokenExpired || "",   
            secretKey: client?.secretKey || "",         
            description: client?.description || "",
            homepageUrl: client?.homePageUrl || "",
            logoUrl: client?.logoUrl || "",
            callbackUrl: client?.callbackUrl || "",
            logoutUrl: client?.logoutUrl || "",
        }),
        []
    );

    const [clientData, setClientData] = useState<ClientFormData>(() =>
        createClientData(selectedClient)
    );

    const [originalData, setOriginalData] = useState<ClientFormData>(() =>
        createClientData(selectedClient)
    );

    // Track initialization to prevent unnecessary re-renders
    const initializedRef = useRef<string | null>(null);

    // Update when selectedClient changes
    useEffect(() => {
        if (selectedClient && initializedRef.current !== selectedClient.id) {
            const newData = createClientData(selectedClient);

            setClientData(newData);
            setOriginalData(newData);
            initializedRef.current = selectedClient.id;
            setIsEditable(false);
            setActiveTooltip(null);
        }
    }, [selectedClient?.id, createClientData]);

    const hasChanges = useMemo(() => {
        const hasChangesValue =
            JSON.stringify(clientData) !== JSON.stringify(originalData);
        onDataChange?.(hasChangesValue);
        return hasChangesValue;
    }, [clientData, originalData, onDataChange]);

    const updateClientData = useCallback(
        (field: keyof ClientFormData, value: string) => {
            setClientData((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        []
    );

    const resetToOriginal = useCallback(() => {
        setClientData({ ...originalData });
        setIsEditable(false);
        setActiveTooltip(null);
    }, [originalData]);

    const updateOriginalData = useCallback((newData: ClientFormData) => {
        setOriginalData(newData);
        setClientData(newData);
    }, []);

    return {
        isEditable,
        setIsEditable,
        activeTooltip,
        setActiveTooltip,
        clientData,
        originalData,
        hasChanges,
        updateClientData,
        resetToOriginal,
        updateOriginalData,
    };
};
