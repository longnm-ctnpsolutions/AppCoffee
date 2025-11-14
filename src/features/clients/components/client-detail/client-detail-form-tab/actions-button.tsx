import React, { memo } from 'react';
import { Button } from "@/shared/components/ui/button";
import { RefreshCcw, Pencil } from "lucide-react";

interface ActionButtonsProps {
    isEditable: boolean;
    isDeactivating: boolean;
    isSaving: boolean;
    canSave: boolean;
    clientStatus?: string | number;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void;
    onDeactivate: () => void;
    canEdit?: boolean;
    canChangeStatus?: boolean;
}

export const ActionButtons = memo<ActionButtonsProps>(({
    isEditable,
    isDeactivating,
    isSaving,
    canSave,
    clientStatus,
    onEdit,
    onCancel,
    onSave,
    onDeactivate,
    canEdit = false,
    canChangeStatus = false
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
                            {clientStatus === 1 ? 'Deactivating...' : 'Activating...'}
                        </>
                    ) : (
                        <>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            {clientStatus === 1 ? 'Deactivate' : 'Activate'}
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
});

ActionButtons.displayName = 'ActionButtons';
