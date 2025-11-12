
"use client"

import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface ListLayoutProps {
  actions?: React.ReactNode
  pagination?: React.ReactNode
  tableContent: React.ReactNode
  className?: string
  cardClassName?: string
  loading?: boolean
  emptyState?: React.ReactNode
}

export function ListLayout({ 
  actions, 
  pagination, 
  tableContent,
  className,
  cardClassName,
  loading = false,
  emptyState
}: ListLayoutProps) {
  const showEmptyState = !loading && emptyState;

  return (
    <div className={cn("flex flex-col h-full w-full space-y-4", className)}>
      {/* Fixed Actions Area */}
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
      
      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-hidden">
        <Card className={cn("h-full flex flex-col", cardClassName)}>
          <CardContent className="p-0 h-full flex flex-col overflow-hidden">
            {showEmptyState ? (
              <div className="flex items-center justify-center h-full">
                {emptyState}
              </div>
            ) : (
              tableContent
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Pagination Area */}
      {pagination && !showEmptyState && !loading && (
        <div className="flex-shrink-0">
          {pagination}
        </div>
      )}
    </div>
  )
}
