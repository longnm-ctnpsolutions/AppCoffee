import { useState, useCallback, useMemo } from 'react';
import { useClientDetail, useClientsActions } from "@/context/clients-context";

export const useClientStatus = () => {
  const { selectedClient } = useClientDetail();
  const { updateStatus } = useClientsActions();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const clientStatus = useMemo(() => selectedClient?.status, [selectedClient?.status]);

  const handleStatusUpdate = useCallback(async () => {
    if (!selectedClient?.id || !updateStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const newStatus = selectedClient.status === 1 ? 0 : 1;
      const success = await updateStatus(selectedClient.id, newStatus);
      return success;
    } catch (error) {
      console.error('Failed to update client status:', error);
      return false;
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [selectedClient?.id, selectedClient?.status, updateStatus]);

  return {
    clientStatus,
    isUpdatingStatus,
    handleStatusUpdate
  };
};