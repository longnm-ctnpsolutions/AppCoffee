import { UsersProvider } from "@/shared/context/users-context";
import { CORE_PERMISSIONS } from "@/shared/types/auth.types";
import PermissionGuard from "@/shared/components/custom-ui/permission-guard";

export default function UsersLayout({ children }: { children: React.ReactNode; }) {
    return (
        <PermissionGuard requiredPermission={CORE_PERMISSIONS.USERS_READ}>
            <UsersProvider>
                {children}
            </UsersProvider>
        </PermissionGuard>

    );
}
