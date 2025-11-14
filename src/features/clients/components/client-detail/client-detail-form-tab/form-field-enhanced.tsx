import React, { memo, useState } from 'react';
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { RefreshCcw, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { ClientFormData, ValidationErrors, ValidationStatus } from '../../../types/client.types';

interface FormFieldProps {
    label: string;
    field: keyof ClientFormData;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
    isEditable: boolean;
    value: string | number | undefined;
    validationErrors: ValidationErrors;
    validationStatus: ValidationStatus;
    activeTooltip: keyof ClientFormData | null;
    onChange: (field: keyof ClientFormData, value: string) => void;
    onTooltipChange: (field: keyof ClientFormData | null) => void;
    maxLength?: number;
}

export const FormField = memo<FormFieldProps>(({
    label,
    field,
    placeholder,
    required = false,
    disabled = false,
    isEditable,
    value,
    validationErrors,
    validationStatus,
    activeTooltip,
    onChange,
    onTooltipChange,
    maxLength
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const fieldError = validationErrors[field as keyof ValidationErrors];
  const fieldStatus = validationStatus[field as keyof ValidationStatus];

  const hasError = !!fieldError || fieldStatus?.isValid === false;
  const isValidating = fieldStatus?.isValidating;
  const isValid = fieldStatus?.isValid === true && !fieldError;
  const isPasswordField = field === 'secretKey';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasError) {
      onTooltipChange(activeTooltip === field ? null : field);
    } else {
      onTooltipChange(null);
    }
  };

  return (
    <div className="space-y-1">
      <p className={hasError ? "text-red-500" : ""}>
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <Tooltip 
        open={activeTooltip === field} 
      >
        <TooltipTrigger asChild>
          <div className="relative">
            <Input
              type={isPasswordField && !showPassword ? "password" : "text"}
              disabled={disabled || !isEditable}
              maxLength={maxLength}
              className={`bg-transparent ${
                hasError ? 'border-red-500' : ''
              } ${
                isValid ? 'border-green-500' : ''
              } ${isPasswordField ? 'pr-20' : ''}`}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              onClick={handleClick}
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {isPasswordField && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {isEditable && !isPasswordField && (
                <>
                  {isValidating && (
                    <RefreshCcw className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  
                  {isValid && !isValidating && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  
                  {hasError && !isValidating && (
                    <AlertCircle className="w-4 h-4 text-red-500 pointer-events-none" />
                  )}
                </>
              )}
            </div>
          </div>
        </TooltipTrigger>
        {hasError && (
          <TooltipContent
            side="bottom"
            align="start"
            sideOffset={0}
            className="bg-destructive text-white text-xs"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <p>{fieldError || fieldStatus?.error}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
});

FormField.displayName = 'FormField';