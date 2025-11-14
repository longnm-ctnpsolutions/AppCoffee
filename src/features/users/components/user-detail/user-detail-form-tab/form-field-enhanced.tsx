import React, { memo } from 'react';
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { RefreshCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { UserFormData, ValidationErrors, ValidationStatus } from '@/features/users/types/user.types';

interface FormFieldProps {
    label: string;
    field: keyof UserFormData;
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
    isEditable: boolean;
    value: string;
    validationErrors: ValidationErrors;
    validationStatus: ValidationStatus;
    activeTooltip: keyof UserFormData | null;
    onChange: (field: keyof UserFormData, value: string) => void;
    onTooltipChange: (field: keyof UserFormData | null) => void;
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
    const fieldError = validationErrors[field as keyof ValidationErrors];
    const fieldStatus = validationStatus[field as keyof ValidationStatus];

    const hasError = !!fieldError || fieldStatus?.isValid === false;
    const isValidating = fieldStatus?.isValidating;
    const isValid = fieldStatus?.isValid === true && !fieldError;

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
                            disabled={disabled || !isEditable}
                            maxLength={maxLength}
                            className={`bg-transparent ${hasError ? 'border-red-500' : ''
                                } ${isValid ? 'border-green-500' : ''
                                }`}
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                onChange(field, newValue);

                                if (hasError) {
                                onTooltipChange(field);
                                } else {
                                onTooltipChange(null);
                                }
                            }}
                            onClick={handleClick}
                        />

                        {isEditable && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {isValidating && (
                                    <RefreshCcw className="w-4 h-4 animate-spin text-gray-400" />
                                )}

                                {isValid && !isValidating && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}

                                {hasError && !isValidating && (
                                    <AlertCircle className="w-4 h-4 text-red-500 pointer-events-none" />
                                )}
                            </div>
                        )}
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
