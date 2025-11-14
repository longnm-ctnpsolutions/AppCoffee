// hooks/useClientForm.ts
import { useState, useCallback, useMemo } from 'react';
import { useClientDetail } from "@/context/clients-context";

export const useClientForm = () => {
  const { selectedClient } = useClientDetail();
  const [isEditable, setIsEditable] = useState(false);
  
  // Form state riêng biệt, không phụ thuộc vào client status
  const [formData, setFormData] = useState(() => ({
    name: selectedClient?.name || '',
    description: selectedClient?.description || '',
    homepageUrl: selectedClient?.homePageUrl || ''
  }));

  // Memoize readonly data - chỉ thay đổi khi client ID thay đổi
  const readonlyData = useMemo(() => ({
    id: selectedClient?.id || '',
    identifier: selectedClient?.identifier || ''
  }), [selectedClient?.id, selectedClient?.identifier]);

  // Initialize form data khi cần thiết
  const initializeForm = useCallback(() => {
    if (selectedClient) {
      setFormData({
        name: selectedClient.name || '',
        description: selectedClient.description || '',
        homepageUrl: selectedClient.homePageUrl || ''
      });
    }
  }, [selectedClient?.id]); // Chỉ phụ thuộc vào ID

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const startEditing = useCallback(() => {
    initializeForm();
    setIsEditable(true);
  }, [initializeForm]);

  const cancelEditing = useCallback(() => {
    initializeForm();
    setIsEditable(false);
  }, [initializeForm]);

  const saveChanges = useCallback(async () => {
    try {
      // TODO: Implement actual save logic
      console.log('💾 Saving client data:', formData);
      
      // Call your API here
      // const success = await updateClientDetails(selectedClient?.id, formData);
      
      setIsEditable(false);
      return true;
    } catch (error) {
      console.error('❌ Failed to save client data:', error);
      return false;
    }
  }, [formData]);

  return {
    formData,
    readonlyData,
    isEditable,
    handleInputChange,
    startEditing,
    cancelEditing,
    saveChanges
  };
};