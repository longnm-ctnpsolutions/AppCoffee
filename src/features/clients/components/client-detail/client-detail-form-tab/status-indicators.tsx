import React, { memo } from 'react';
import { RefreshCcw } from "lucide-react";

interface StatusIndicatorsProps {
  isEditable: boolean;
  hasChanges: boolean;
  hasValidationErrors: boolean;
  isNameValidating: boolean;
}

export const StatusIndicators = memo<StatusIndicatorsProps>(({
  isEditable,
  hasChanges,
  hasValidationErrors,
  isNameValidating
}) => {
  if (!isEditable) return null;

  return (
    <>
      {hasChanges && !hasValidationErrors && (
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-600 text-sm">
            ⚠️ You have unsaved changes
          </p>
        </div>
      )}

      {isNameValidating && (
        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-600 text-sm flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Validating client name...
          </p>
        </div>
      )}
    </>
  );
});

StatusIndicators.displayName = 'StatusIndicators';