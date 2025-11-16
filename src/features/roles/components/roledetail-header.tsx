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
    details: "Chi tiết vai trò.",
    permissions: "Danh sách các quyền mà người dùng này có.",
    users: "Nhóm người dùng được gán cho vai trò này.",
  }

  const handleBackClick = () => {
    router.push('/vi/roles');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBackClick}>
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
