
"use client"

import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface ListLayoutProps {
  actions?: React.ReactNode
  filters?: React.ReactNode
  pagination?: React.ReactNode
  tableContent: React.ReactNode
  className?: string
  cardClassName?: string
  loading?: boolean
  emptyState?: React.ReactNode
}

export function ListLayout({
  actions,
  filters,
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
     <div className="flex-1 overflow-y-auto no-scroll-desktop">
        <Card className={cn("h-full flex flex-col overflow-y-auto no-scroll-desktop", cardClassName)}>
          {filters && (
            <div className="border-b border-border p-4">
              {filters}
            </div>
          )}

          <CardContent className="p-0 h-full flex flex-col">
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
