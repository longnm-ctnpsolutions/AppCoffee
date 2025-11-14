import * as React from "react";
import { Card } from "@/shared/components/ui/card";
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { useState, useEffect, useMemo } from "react";
import { useClientsActions, useClientDetail } from "@/context/clients-context";
import { useClientFormState } from "../../../hooks/use-client-form-state";
import { useClientValidation } from "../../../hooks/use-client-validation";
import { useClientActions } from "../../../hooks/use-client-actions";
import { ActionButtons } from "./actions-button";
import { FormField } from "./form-field-enhanced";
import { StatusIndicators } from "./status-indicators";
import { FileUpload } from "./file-upload";
import { ClientPermissions } from "@/types/permissions.types";

interface ClientDetailsFormProps {
    error?: string | null;
    permissions: ClientPermissions;
}

const ClientDetailsForm: React.FC<ClientDetailsFormProps> = ({ error, permissions }) => {
    const { updateStatus, updateClientData, fetchClientsByField } = useClientsActions();
    const { selectedClient } = useClientDetail();
    const clientStatus = useMemo(() => selectedClient?.status, [selectedClient?.status]);
    const { canChangeStatus, canEdit } = permissions;
    
    // Custom hooks
    const {
        isEditable,
        setIsEditable,
        activeTooltip,
        setActiveTooltip,
        clientData,
        originalData,
        hasChanges,
        updateClientData: updateFormData,
        resetToOriginal,
        updateOriginalData
    } = useClientFormState({ selectedClient });

    const {
        validationErrors,
        validationStatus,
        validateClientName,
        validateAllFieldsBeforeSave,
        validateForm,
        clearValidationErrors,
        validateField,
        cleanup
    } = useClientValidation({
        fetchClientsByField,
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
    } = useClientActions({
        selectedClient,
        updateStatus,
        updateClientData
    });

    // ✅ Computed values - Bổ sung check đầy đủ tất cả validation status
    const hasValidationErrors = useMemo(() => {
        const hasAnyError = Object.keys(validationErrors).length > 0;
        const hasNameInvalid = validationStatus.name.isValid === false;
        const hasAudienceInvalid = validationStatus.audience.isValid === false;
        const hasIssuerInvalid = validationStatus.issuer.isValid === false;
        const hasTokenExpiredInvalid = validationStatus.tokenExpired.isValid === false;
        
        return hasAnyError || hasNameInvalid || hasAudienceInvalid || hasIssuerInvalid || hasTokenExpiredInvalid;
    }, [validationErrors, validationStatus]);

    const canSave = useMemo(() => {
        const hasNameError = validationErrors.name || validationStatus.name.isValid === false;
        const hasAudienceError = validationErrors.audience || validationStatus.audience.isValid === false;
        const hasIssuerError = validationErrors.issuer || validationStatus.issuer.isValid === false;
        const hasTokenExpiredError = validationErrors.tokenExpired || validationStatus.tokenExpired.isValid === false;
        const hasHomepageUrlError = validationErrors.homepageUrl;

        const hasOtherErrors = Object.keys(validationErrors).some(
            key => !['name', 'audience', 'issuer', 'tokenExpired', 'homepageUrl'].includes(key)
        );

        const isAnyFieldValidating =
            validationStatus.name.isValidating ||
            validationStatus.audience.isValidating ||
            validationStatus.issuer.isValidating ||
            validationStatus.tokenExpired.isValidating;

        return (
            hasChanges &&
            !hasNameError &&
            !hasAudienceError &&
            !hasIssuerError &&
            !hasTokenExpiredError &&
            !hasHomepageUrlError &&
            !hasOtherErrors &&
            !isAnyFieldValidating &&
            clientData.name.trim().length > 0
        );
    }, [hasChanges, validationErrors, validationStatus, clientData.name]);

    // ✅ Event handlers - Cải thiện xử lý input change
    const handleInputChange = (field: keyof typeof clientData, value: string) => {
        const normalizedValue = field === 'tokenExpired' ? value.toString() : value;
        
        updateFormData(field, normalizedValue);

        // Clear validation error for this field when user starts typing
        if (validationErrors[field as keyof typeof validationErrors]) {
            clearValidationErrors(field as keyof typeof validationErrors);
            setActiveTooltip(null);
        }
        if (isEditable) {
            validateField(field, normalizedValue, clientData);
        } 
    };

    const handleSave = async () => {
        if (!validateForm(clientData)) {
            return;
        }

        // Validate tất cả các field async
        const isValid = await validateAllFieldsBeforeSave(clientData);
        if (!isValid) {
            return;
        }
        const success = await performSave(
            clientData,
            () => true, // Đã validate rồi
            validateClientName,
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
        setActiveTooltip(null);
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleFileUploaded = (fileUrl: string) => {
        updateFormData('logoUrl', fileUrl);
    };

    const handleFileRemoved = () => {
        updateFormData('logoUrl', '');
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

    return (
        <TooltipProvider>
            {/* Error message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Details form card */}
            <Card className="space-y-4 p-6 shadow-md border border-gray-100">
                <ActionButtons
                    isEditable={isEditable}
                    isDeactivating={isDeactivating}
                    isSaving={isSaving}
                    canSave={canSave}
                    clientStatus={clientStatus}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onDeactivate={handleDeactivate}
                    canEdit={canEdit}
                    canChangeStatus={canChangeStatus}
                />

                <FormField
                    label="Client ID"
                    field="id"
                    placeholder="Enter client ID"
                    disabled={true}
                    isEditable={isEditable}
                    value={clientData.id}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />

                <FormField
                    label="Client Name"
                    field="name"
                    placeholder="Enter client name"
                    required={true}
                    isEditable={isEditable}
                    value={clientData.name}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={100}
                />

                <FormField
                    label="Identifier"
                    field="identifier"
                    placeholder="Enter identifier"
                    disabled={true}
                    isEditable={isEditable}
                    value={clientData.identifier}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={255}
                />

                <FormField
                    label="Audience"
                    field="audience"
                    placeholder="Enter audience"
                    isEditable={isEditable}
                    disabled={true}
                    value={clientData.audience}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={255}
                />

                <FormField
                    label="Issuer"
                    field="issuer"
                    placeholder="Enter issuer"
                    isEditable={isEditable}
                    disabled={true}
                    value={clientData.issuer}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={255}
                />

                <FormField
                    label="Token Expired"
                    field="tokenExpired"
                    placeholder="Enter token expired (seconds)"
                    isEditable={isEditable}
                    value={clientData.tokenExpired}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={255}
                />

                <FormField
                    label="SecretKey"
                    field="secretKey"
                    placeholder="***********"
                    disabled={true}
                    isEditable={isEditable}
                    value={clientData.secretKey}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={255}
                />

                <FormField
                    label="Description"
                    field="description"
                    placeholder="Enter description"
                    isEditable={isEditable}
                    value={clientData.description}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                    maxLength={500}
                />

                <FormField
                    label="Homepage URL"
                    field="homepageUrl"
                    placeholder="Enter homepage URL"
                    isEditable={isEditable}
                    value={clientData.homepageUrl}
                    validationErrors={validationErrors}
                    validationStatus={validationStatus}
                    activeTooltip={activeTooltip}
                    onChange={handleInputChange}
                    onTooltipChange={setActiveTooltip}
                />

                <FileUpload
                    isEditable={isEditable}
                    currentLogoUrl={clientData.logoUrl || ''}
                    onFileUploaded={handleFileUploaded}
                    onFileRemoved={handleFileRemoved}
                    disabled={!isEditable}
                    container=""
                    userId=""
                />

                <StatusIndicators
                    isEditable={isEditable}
                    hasChanges={hasChanges}
                    hasValidationErrors={hasValidationErrors}
                    isNameValidating={validationStatus.name.isValidating}
                />
            </Card>
        </TooltipProvider>
    );
};

export default ClientDetailsForm;