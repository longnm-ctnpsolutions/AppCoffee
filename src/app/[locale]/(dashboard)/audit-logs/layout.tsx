import PermissionGuard from "@/shared/components/custom-ui/permission-guard";
import { AuditLogsProvider } from "@/shared/context/audit-logs-context";
import { CORE_PERMISSIONS } from "@/shared/types/auth.types";

export default function ClientsLayout({ children }: { children: React.ReactNode; }) {
    return (
        // <PermissionGuard requiredPermission={CORE_PERMISSIONS.CLIENTS_READ}>

        // </PermissionGuard>
        <AuditLogsProvider>
            {children}
        </AuditLogsProvider>
    );
}
