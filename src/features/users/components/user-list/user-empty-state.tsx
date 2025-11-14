import { EmptyState } from "@/shared/components/custom-ui/table/empty-sate";

interface UserEmptyStateProps {
    isSearching: boolean;
    hasFilters: boolean;
    onAddUser: () => void;
}

export function UserEmptyState({
    isSearching,
    hasFilters,
    onAddUser
}: UserEmptyStateProps) {
    const getDescription = () => {
        if (isSearching || hasFilters) {
            return "Try adjusting your search or filters to find what you're looking for.";
        }
        return "Get started by adding your first user to the system.";
    };

    const shouldShowAction = !isSearching && !hasFilters;

    return (
        <EmptyState
            title="No users found"
            description={getDescription()}
            actionLabel={shouldShowAction ? "Add your first user" : undefined}
            onAction={shouldShowAction ? onAddUser : undefined}
        />
    );
}
