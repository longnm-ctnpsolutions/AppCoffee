"use client";

import { Save, Pencil } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CardTitle, CardDescription } from "@/shared/components/ui/card";
import {
    useSystemSettingsActions,
    useSystemSettingsState,
} from "@/context/system-settings-context";

interface SettingsHeaderProps {
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
    isEditMode: boolean;
    canSave?: boolean;
    hasValidationErrors?: boolean;
}

export function SettingsHeader({
    onSave,
    onCancel,
    onEdit,
    isEditMode,
    canSave = false,
    hasValidationErrors = false,
}: SettingsHeaderProps) {
    const { isActionLoading } = useSystemSettingsState();

    return (
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-2xl tracking-tight">
                    Cài đặt hệ thống
                </CardTitle>
                <CardDescription>
                    Quản lý xác thực và chính sách mật khẩu cho hệ thống.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {!isEditMode ? (
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onEdit}
                        disabled={isActionLoading}
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onCancel}
                            disabled={isActionLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            onClick={onSave}
                            disabled={!canSave || isActionLoading}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isActionLoading ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
