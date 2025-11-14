import { RolesProvider } from "@/shared/context/roles-context";
import { CORE_PERMISSIONS } from "@/shared/types/auth.types";
import PermissionGuard from "@/shared/components/custom-ui/permission-guard";

export default function RolesLayout({ children }: { children: React.ReactNode; }) {
    return (
        <PermissionGuard requiredPermission={CORE_PERMISSIONS.ROLES_READ}>
            <RolesProvider>
                {children}
            </RolesProvider>
        </PermissionGuard>
    );
}
