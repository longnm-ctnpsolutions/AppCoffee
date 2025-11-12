"use client"

import * as React from "react"
import { Card } from "@/shared/components/ui/card"
import UserDetailHeader from "@/features/users/components/userdetail-header"
import UserDetailTabs from "@/features/users/components/userdetail-tab"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (

    <div className="w-full space-y-6">
      <UserDetailHeader />
      <UserDetailTabs />
  </div>
    
  );
}
