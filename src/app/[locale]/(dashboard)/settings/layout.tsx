import { SystemSettingsProvider } from "@/context/system-settings-context";
import { CORE_PERMISSIONS } from "@/shared/types/auth.types";
import PermissionGuard from "@/shared/components/custom-ui/permission-guard";

export default function RolesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PermissionGuard requiredPermission={CORE_PERMISSIONS.SYSTEM_SETTINGS}>
            <SystemSettingsProvider>{children}</SystemSettingsProvider>
        </PermissionGuard>
    );
}
