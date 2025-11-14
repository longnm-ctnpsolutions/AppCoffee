"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { ArrowLeft } from "lucide-react"

import type { Role } from "@/features/roles/types/role.types"
import { Card, CardHeader } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface RoleDetailHeaderProps {
  role: Role;
  activeTab?: string;
}

export default function RoleDetailHeader({ role, activeTab }: RoleDetailHeaderProps) {
  const router = useRouter()

  const subtitleMap: Record<string, string> = {
    details: "Role details.",
    permissions: "List of permissions this user has.",
    users: "Users group assigned to this role.",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/en/roles')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h2 className="text-xl font-semibold">{role.name}</h2>
              <p className="text-sm text-muted-foreground">
                {subtitleMap[activeTab ?? "details"]}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
