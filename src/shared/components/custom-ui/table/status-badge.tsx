"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"

export type StatusVariant = 'active' | 'inactive' | 'success' | 'failed'

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyle = (status: StatusVariant) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-green-100 text-green-800',
          dot: 'bg-green-500',
        }
      case 'inactive':
        return {
          bg: 'bg-gray-100 text-gray-800',
          dot: 'bg-gray-400',
        }
      case 'success':
        return {
          bg: 'bg-emerald-100 text-emerald-800',
          dot: 'bg-emerald-500',
        }
      case 'failed':
        return {
          bg: 'bg-red-100 text-red-800',
          dot: 'bg-red-500',
        }
      default:
        return {
          bg: 'bg-gray-100 text-gray-800',
          dot: 'bg-gray-400',
        }
    }
  }

  const styles = getStatusStyle(status)

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        styles.bg,
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-2 w-2 rounded-full",
          styles.dot
        )}
      />
      <span className="capitalize">{status}</span>
    </div>
  )
}
