
import { EnhancedClientDashboard } from "@/features/clients/components/client-list/enhanced-client-dashboard";
import { ClientsProvider } from "@/shared/context/clients-context";

export default function ClientsPage() {
  return (
    <ClientsProvider>
      <EnhancedClientDashboard />
    </ClientsProvider>
  )
}
