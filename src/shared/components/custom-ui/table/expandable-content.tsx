import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { StatusBadge } from "@/shared/components/custom-ui/table/status-badge"

interface ExpandedRowContentProps {
  fields: Array<{
    key: string
    label: string
    value: any
    renderValue?: (value: any) => React.ReactNode
  }>
  className?: string
}

export function ExpandedRowContent({ fields, className }: ExpandedRowContentProps) {
  if (fields.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No additional information to display
      </div>
    )
  }

  return (
    <div className={cn("p-4 bg-muted/30 border-t", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground capitalize tracking-wide">
              {field.label}
            </div>
            <div className="text-sm">
              {field.renderValue ? field.renderValue(field.value) : (
                <DefaultFieldRenderer fieldKey={field.key} value={field.value} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DefaultFieldRenderer({ fieldKey, value }: { fieldKey: string; value: any }) {
  if (fieldKey === 'status') {
    return <StatusBadge status={value === 1 ? 'active' : 'inactive'} />
  }
    if (fieldKey === 'lockoutEnabled') {
    return <StatusBadge status={value === true ? 'active' : 'inactive'} />
  }
  if (fieldKey.toLowerCase().includes('url') && typeof value === 'string') {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline break-all"
        data-no-expand
      >
        {value}
      </a>
    )
  }
  
  return <span className="break-all">{value}</span>
}