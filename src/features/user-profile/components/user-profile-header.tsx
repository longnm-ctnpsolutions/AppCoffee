"use client"

import * as React from "react"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

interface UserProfileHeaderProps {
  isPending: boolean
}

export function UserProfileHeader({ isPending }: UserProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-card shadow-sm rounded-lg border">
      <div className="flex items-center justify-between gap-4 p-3">
        <div>
          <h1 className="text-xl font-bold">User Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your profile information.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" type="button" disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
