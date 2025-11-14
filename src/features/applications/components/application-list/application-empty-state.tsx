import { EmptyState } from "@/shared/components/custom-ui/table/empty-sate"

interface ApplicationEmptyStateProps {
    isSearching: boolean
    hasFilters: boolean
    onAddApplication: () => void
  }
  
  export function ApplicationEmptyState({ 
    isSearching, 
    hasFilters, 
    onAddApplication 
  }: ApplicationEmptyStateProps) {
    const getDescription = () => {
      if (isSearching || hasFilters) {
        return "Try adjusting your search or filters to find what you're looking for."
      }
      return "Get started by adding your first application to the system."
    }
  
    const shouldShowAction = false
  
    return (
      <EmptyState
        title="No applications found"
        description={getDescription()}
        actionLabel={shouldShowAction ? "Add your first application" : undefined}
        onAction={shouldShowAction ? onAddApplication : undefined}
      />
    )
  }