import { EmptyState } from "@/shared/components/custom-ui/table/empty-sate"

interface AuditLogEmptyStateProps {
    isSearching: boolean
    hasFilters: boolean
  }
  
  export function AuditLogEmptyState({ 
    isSearching, 
    hasFilters, 
  }: AuditLogEmptyStateProps) {
    const getDescription = () => {
      if (isSearching || hasFilters) {
        return "Try adjusting your search or filters to find what you're looking for."
      }
      return "Get started by adding your first auditlog to the system."
    }
  
    const shouldShowAction = !isSearching && !hasFilters
  
    return (
      <EmptyState
        title="No audit-logs found"
        description={getDescription()}
        actionLabel={shouldShowAction ? "Add your first audit-log" : undefined}
      />
    )
  }