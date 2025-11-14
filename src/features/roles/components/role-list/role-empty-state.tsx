import { EmptyState } from "@/shared/components/custom-ui/table/empty-sate"

interface RoleEmptyStateProps {
    isSearching: boolean
    hasFilters: boolean
    onAddRole: () => void
  }
  
  export function RoleEmptyState({ 
    isSearching, 
    hasFilters, 
    onAddRole 
  }: RoleEmptyStateProps) {
    const getDescription = () => {
      if (isSearching || hasFilters) {
        return "Try adjusting your search or filters to find what you're looking for."
      }
      return "Get started by adding your first role to the system."
    }
  
    const shouldShowAction = !isSearching && !hasFilters
  
    return (
      <EmptyState
        title="No roles found"
        description={getDescription()}
        actionLabel={shouldShowAction ? "Add your first role" : undefined}
        onAction={shouldShowAction ? onAddRole : undefined}
      />
    )
  }