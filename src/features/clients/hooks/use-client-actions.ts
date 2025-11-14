import { useState, useCallback } from 'react';
import { ClientFormData } from '../types/client.types';

interface UseClientActionsProps {
  selectedClient: any;
  updateStatus: (id: string, status: number) => Promise<boolean>;
  updateClientData: (id: string, data: any) => Promise<boolean>;
}

export const useClientActions = ({
  selectedClient,
  updateStatus,
  updateClientData
}: UseClientActionsProps) => {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeactivate = useCallback(async () => {
    if (!selectedClient?.id || !updateStatus) return;

    setIsDeactivating(true);

    try {
      const newStatus = selectedClient.status === 1 ? 0 : 1;
      const success = await updateStatus(selectedClient.id, newStatus);

      if (success) {
        console.log(`Client ${newStatus === 0 ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (error) {
      console.error('❌ Failed to update client status:', error);
    } finally {
      setIsDeactivating(false);
    }
  }, [selectedClient, updateStatus]);

  const handleSave = useCallback(async (
    clientData: ClientFormData,
    validateForm: () => boolean,
    validateName: (name: string, id: string) => Promise<boolean>,
    nameValidationStatus: any,
    onSuccess: (data: ClientFormData) => void
  ) => {
    if (!selectedClient?.id) return false;

    // Validate form first
    const isFormValid = validateForm();
    if (!isFormValid) return false;

    // Check validation status
    if (nameValidationStatus.isValidating) return false;
    if (nameValidationStatus.isValid === false) return false;

    // If name changed, ensure it's validated
    const nameChanged = clientData.name.trim() !== selectedClient.name?.trim();
    if (nameChanged && nameValidationStatus.isValid !== true) {
      const isNameValid = await validateName(clientData.name, clientData.id);
      if (!isNameValid) return false;
    }

    setIsSaving(true);

    try {
      const updateData = {
        name: clientData.name.trim(),
        audience: clientData.audience?.trim() || null,
        issuer: clientData.issuer?.trim() || null,
        tokenExpired: clientData.tokenExpired ? Number(clientData.tokenExpired) : null,
        description: clientData.description.trim() || undefined,
        homePageUrl: clientData.homepageUrl.trim() || null,
        logoUrl: clientData.logoUrl?.trim() || null,
        callbackUrl: clientData.callbackUrl?.trim() || null,
        logoutUrl: clientData.logoutUrl?.trim() || null,
      };

      const success = await updateClientData(selectedClient.id, updateData);

      if (success) {
        onSuccess(clientData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Unexpected error during client update:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedClient, updateClientData]);

  return {
    isDeactivating,
    isSaving,
    handleDeactivate,
    handleSave
  };
};