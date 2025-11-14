import { EmptyState } from "@/shared/components/custom-ui/table/empty-sate"

interface ClientEmptyStateProps {
    isSearching: boolean
    hasFilters: boolean
    onAddClient: () => void
  }
  
  export function ClientEmptyState({ 
    isSearching, 
    hasFilters, 
    onAddClient 
  }: ClientEmptyStateProps) {
    const getDescription = () => {
      if (isSearching || hasFilters) {
        return "Try adjusting your search or filters to find what you're looking for."
      }
      return "Get started by adding your first client to the system."
    }
  
    const shouldShowAction = !isSearching && !hasFilters
  
    return (
      <EmptyState
        title="No clients found"
        description={getDescription()}
        actionLabel={shouldShowAction ? "Add your first client" : undefined}
        onAction={shouldShowAction ? onAddClient : undefined}
      />
    )
  }