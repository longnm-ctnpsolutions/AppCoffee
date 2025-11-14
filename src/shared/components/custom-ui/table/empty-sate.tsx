interface EmptyStateProps {
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    icon?: React.ReactNode
  }
  
  export function EmptyState({ 
    title, 
    description, 
    actionLabel, 
    onAction,
    icon 
  }: EmptyStateProps) {
    const defaultIcon = (
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M34 40v-4a9.971 9.971 0 01-.712-3.714M14 40v-4a9.971 9.971 0 00-.712-3.714"
        />
      </svg>
    )
  
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mx-auto max-w-md">
          {icon || defaultIcon}
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
          {actionLabel && onAction && (
            <button 
              onClick={onAction}
              className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    )
  }