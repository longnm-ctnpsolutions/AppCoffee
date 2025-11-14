import React from 'react';
import { Button } from "@/shared/components/ui/button";
import { RefreshCcw, Pencil } from "lucide-react";

interface ActionButtonsProps {
  isEditable: boolean;
  isDeactivating: boolean;
  isSaving: boolean;
  canSave: boolean;
  userStatus?: string | number | boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDeactivate: () => void;
  canEdit?: boolean;
  canChangeStatus?: boolean;
}
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditable,
  isDeactivating,
  isSaving,
  canSave = true,
  userStatus,
  onEdit,
  onCancel,
  onSave,
  onDeactivate,
  canEdit,
  canChangeStatus
}) => {
  return (
    <div className="flex justify-end mt-4 gap-x-2">
      {canChangeStatus && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDeactivate}
          disabled={isDeactivating || isEditable || isSaving}
        >
          {isDeactivating ? (
            <>
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
              {userStatus === false ? 'Deactivating...' : 'Activating...'}
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4 mr-2" />
              {userStatus === false ? 'Deactivate' : 'Activate'}
            </>
          )}
        </Button>
      )}
      {canEdit && (
        <>
          {isEditable ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={isDeactivating || isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#0f6cbd] text-white hover:bg-[#084c91]"
                onClick={onSave}
                disabled={isDeactivating || isSaving || !canSave}
              >
                {isSaving ? (
                  <>
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="bg-[#0f6cbd] text-white hover:bg-[#084c91]"
              onClick={onEdit}
              disabled={isDeactivating || isSaving}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </>
      )}
    </div>
  );
};

ActionButtons.displayName = 'ActionButtons';