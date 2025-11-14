import { useState, useRef, useCallback } from 'react';
import { ClientFormData, ValidationErrors, ValidationStatus } from '../types/client.types';
import { isValidClientName, isValidUrl } from '../lib/validation';

interface UseClientValidationProps {
  fetchClientsByField: (field: string, value: string) => Promise<any>;
  onValidationChange?: (hasErrors: boolean) => void;
}

export const useClientValidation = ({ 
  fetchClientsByField, 
  onValidationChange 
}: UseClientValidationProps) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    name: { isValidating: false, isValid: null },
    audience: { isValidating: false, isValid: null },
    issuer: { isValidating: false, isValid: null },
    tokenExpired: { isValidating: false, isValid: null }
  });
  
  const nameValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audienceValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const issuerValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Hàm validate chung
  const validateUniqueField = useCallback(async (
    fieldName: 'name' | 'audience' | 'issuer',
    value: string,
    currentClientId: string
  ): Promise<boolean> => {
    if (!value.trim()) {
      return true;
    }

    try {
      setValidationStatus(prev => ({
        ...prev,
        [fieldName]: { isValidating: true, isValid: null }
      }));

      const result = await fetchClientsByField(fieldName, value.trim());
      
      if (result && result.clients && result.clients.length > 0) {
        const hasDuplicate = result.clients.some((client: any) => 
          client[fieldName]?.toLowerCase() === value.trim().toLowerCase() && 
          client.id !== currentClientId
        );
        
        if (hasDuplicate) {
          const errorMsg = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`;
          setValidationStatus(prev => ({
            ...prev,
            [fieldName]: { isValidating: false, isValid: false, error: errorMsg }
          }));
          setValidationErrors(prev => ({
            ...prev,
            [fieldName]: errorMsg
          }));
          onValidationChange?.(true);
          return false;
        }
      }

      setValidationStatus(prev => ({
        ...prev,
        [fieldName]: { isValidating: false, isValid: true }
      }));
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
      onValidationChange?.(false);
      return true;

    } catch (error) {
      console.error(`${fieldName} validation error:`, error);
      const errorMsg = `Failed to validate ${fieldName}`;
      setValidationStatus(prev => ({
        ...prev,
        [fieldName]: { isValidating: false, isValid: false, error: errorMsg }
      }));
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: errorMsg
      }));
      onValidationChange?.(true);
      return false;
    }
  }, [fetchClientsByField, onValidationChange]);

  const validateClientName = useCallback(async (name: string, currentClientId: string): Promise<boolean> => {
    return validateUniqueField('name', name, currentClientId);
  }, [validateUniqueField]);

  const validateAudience = useCallback(async (audience: string, currentClientId: string): Promise<boolean> => {
    return validateUniqueField('audience', audience, currentClientId);
  }, [validateUniqueField]);

  const validateIssuer = useCallback(async (issuer: string, currentClientId: string): Promise<boolean> => {
    return validateUniqueField('issuer', issuer, currentClientId);
  }, [validateUniqueField]);

  const validateTokenExpired = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        tokenExpired: 'Token expired is required'
      }));
      setValidationStatus(prev => ({
        ...prev,
        tokenExpired: { isValidating: false, isValid: false, error: 'Token expired is required' }
      }));
      onValidationChange?.(true);
      return false;
    }

    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      setValidationErrors(prev => ({
        ...prev,
        tokenExpired: 'Token expired must be a positive number'
      }));
      setValidationStatus(prev => ({
        ...prev,
        tokenExpired: { isValidating: false, isValid: false, error: 'Token expired must be a positive number' }
      }));
      onValidationChange?.(true);
      return false;
    }

    setValidationErrors(prev => ({
      ...prev,
      tokenExpired: undefined
    }));
    setValidationStatus(prev => ({
      ...prev,
      tokenExpired: { isValidating: false, isValid: true }
    }));
    onValidationChange?.(false);
    return true;
  }, [onValidationChange]);

  // ✅ Debounced validation
  const debouncedValidation = useCallback((
    fieldName: 'name' | 'audience' | 'issuer',
    value: string,
    clientId: string,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setValidationStatus(prev => ({
      ...prev,
      [fieldName]: { isValidating: false, isValid: null }
    }));

    timeoutRef.current = setTimeout(() => {
      validateUniqueField(fieldName, value, clientId);
    }, 800);
  }, [validateUniqueField]);

  const validateAllFieldsBeforeSave = useCallback(async (
    clientData: ClientFormData
  ): Promise<boolean> => {
    const validationPromises: Promise<boolean>[] = [];

    // Validate name (bắt buộc)
    if (clientData.name.trim()) {
      validationPromises.push(validateClientName(clientData.name, clientData.id));
    }

    // Validate audience (bắt buộc)
    if (clientData.audience?.trim()) {
      validationPromises.push(validateAudience(clientData.audience, clientData.id));
    }

    // Validate issuer (bắt buộc)
    if (clientData.issuer?.trim()) {
      validationPromises.push(validateIssuer(clientData.issuer, clientData.id));
    }

    const results = await Promise.all(validationPromises);
    
    // Validate tokenExpired
    const tokenExpiredValue = clientData.tokenExpired?.toString() || '';
    const tokenExpiredValid = validateTokenExpired(tokenExpiredValue);
    
    return results.every(r => r === true) && tokenExpiredValid;
  }, [validateClientName, validateAudience, validateIssuer, validateTokenExpired]);

  const validateForm = useCallback((clientData: ClientFormData): boolean => {
    const errors: ValidationErrors = {};
    
    // Name validation
    if (!clientData.name.trim()) {
      errors.name = 'Client name is required';
    } else if (!isValidClientName(clientData.name)) {
      errors.name = 'Client name contains invalid characters';
    }

    // Audience validation
    if (!clientData.audience?.trim()) {
      errors.audience = 'Audience is required';
    }

    // Issuer validation
    if (!clientData.issuer?.trim()) {
      errors.issuer = 'Issuer is required';
    }

    // TokenExpired validation
    if (!clientData.tokenExpired?.toString().trim()) {
      errors.tokenExpired = 'Token expired is required';
    } else {
      const num = Number(clientData.tokenExpired);
      if (isNaN(num) || num <= 0) {
        errors.tokenExpired = 'Token expired must be a positive number';
      }
    }

    // URL validations
    if (clientData.homepageUrl && !isValidUrl(clientData.homepageUrl)) {
      errors.homepageUrl = 'Please enter a valid URL';
    }

    if (clientData.logoUrl && !isValidUrl(clientData.logoUrl)) {
      errors.logoUrl = 'Please enter a valid URL';
    }

    if (clientData.callbackUrl && !isValidUrl(clientData.callbackUrl)) {
      errors.callbackUrl = 'Please enter a valid URL';
    }

    if (clientData.logoutUrl && !isValidUrl(clientData.logoutUrl)) {
      errors.logoutUrl = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    const hasErrors = Object.keys(errors).length > 0;
    onValidationChange?.(hasErrors);
    
    return !hasErrors;
  }, [onValidationChange]);

  const clearValidationErrors = useCallback((field?: keyof ValidationErrors) => {
    if (field) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
      
      if (['name', 'audience', 'issuer', 'tokenExpired'].includes(field)) {
        setValidationStatus(prev => ({
          ...prev,
          [field]: { isValidating: false, isValid: null }
        }));
      }
    } else {
      setValidationErrors({});
      setValidationStatus({
        name: { isValidating: false, isValid: null },
        audience: { isValidating: false, isValid: null },
        issuer: { isValidating: false, isValid: null },
        tokenExpired: { isValidating: false, isValid: null }
      });
    }
  }, []);

  const validateField = useCallback((field: keyof ClientFormData, value: string, clientData: ClientFormData) => {
    console.log('🔍 validateField called:', { field, value, clientId: clientData.id });

    // Name validation
    if (field === 'name') {
      console.log('📝 Validating name field');
      setValidationStatus(prev => ({
        ...prev,
        name: { isValidating: false, isValid: null }
      }));

      if (!value.trim()) {
        setValidationErrors(prev => ({
          ...prev,
          name: 'Client name is required'
        }));
        setValidationStatus(prev => ({
          ...prev,
          name: { isValidating: false, isValid: false, error: 'Client name is required' }
        }));
        onValidationChange?.(true);
        return false;
      }

      if (!isValidClientName(value)) {
        setValidationErrors(prev => ({
          ...prev,
          name: 'Client name contains invalid characters'
        }));
        setValidationStatus(prev => ({
          ...prev,
          name: { isValidating: false, isValid: false, error: 'Client name contains invalid characters' }
        }));
        onValidationChange?.(true);
        return false;
      }

      console.log('✅ Name format valid, starting debounced validation');
      debouncedValidation('name', value, clientData.id, nameValidationTimeoutRef);
      return true;
    }

    // Audience validation
    if (field === 'audience') {
      console.log('👥 Validating audience field');
      setValidationStatus(prev => ({
        ...prev,
        audience: { isValidating: false, isValid: null }
      }));

      if (!value.trim()) {
        setValidationErrors(prev => ({
          ...prev,
          audience: 'Audience is required'
        }));
        setValidationStatus(prev => ({
          ...prev,
          audience: { isValidating: false, isValid: false, error: 'Audience is required' }
        }));
        onValidationChange?.(true);
        return false;
      }

      console.log('✅ Audience has value, starting debounced validation');
      debouncedValidation('audience', value, clientData.id, audienceValidationTimeoutRef);
      return true;
    }

    // Issuer validation
    if (field === 'issuer') {
      console.log('🏢 Validating issuer field');
      setValidationStatus(prev => ({
        ...prev,
        issuer: { isValidating: false, isValid: null }
      }));

      if (!value.trim()) {
        setValidationErrors(prev => ({
          ...prev,
          issuer: 'Issuer is required'
        }));
        setValidationStatus(prev => ({
          ...prev,
          issuer: { isValidating: false, isValid: false, error: 'Issuer is required' }
        }));
        onValidationChange?.(true);
        return false;
      }

      console.log('✅ Issuer has value, starting debounced validation');
      debouncedValidation('issuer', value, clientData.id, issuerValidationTimeoutRef);
      return true;
    }

    // TokenExpired validation
    if (field === 'tokenExpired') {
      console.log('⏱️ Validating tokenExpired field');
      const result = validateTokenExpired(value);
      console.log('TokenExpired validation result:', result);
      return result;
    }

    // Real-time URL validation
    if (['homepageUrl', 'logoUrl', 'callbackUrl', 'logoutUrl'].includes(field) && value.trim()) {
      console.log('🔗 Validating URL field:', field);
      if (!isValidUrl(value)) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: 'Please enter a valid URL'
        }));
        return false;
      } else {
        clearValidationErrors(field as keyof ValidationErrors);
      }
    }

    return true;
  }, [debouncedValidation, validateTokenExpired, clearValidationErrors, onValidationChange]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (nameValidationTimeoutRef.current) {
      clearTimeout(nameValidationTimeoutRef.current);
    }
    if (audienceValidationTimeoutRef.current) {
      clearTimeout(audienceValidationTimeoutRef.current);
    }
    if (issuerValidationTimeoutRef.current) {
      clearTimeout(issuerValidationTimeoutRef.current);
    }
  }, []);

  return {
    validationErrors,
    validationStatus,
    validateClientName,
    validateAudience,
    validateIssuer,
    validateTokenExpired,
    validateAllFieldsBeforeSave,
    validateForm,
    clearValidationErrors,
    validateField,
    cleanup
  };
};