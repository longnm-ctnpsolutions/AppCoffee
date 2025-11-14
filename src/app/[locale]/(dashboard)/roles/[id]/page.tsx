"use client"

import * as React from "react"
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'

import RoleDetailHeader from "@/features/roles/components/roledetail-header"
import RoleDetailTabs from "@/features/roles/components/role-detail/role-detail-tabs"
import { useRoleDetail, useRolesActions } from "@/context/roles-context"
import type { Role } from "@/features/roles/types/role.types"
import { Button } from "@/shared/components/ui/button"

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  // ✅ Sử dụng context để lấy selected role
  const { selectedRole, isDetailLoading, detailError } = useRoleDetail();
  const { getRoleDetails, clearSelectedRole } = useRolesActions();

  const [activeTab, setActiveTab] = React.useState("details");

  // ✅ Fetch role details khi component mount
  React.useEffect(() => {
    const fetchRole = async () => {
      if (typeof id === 'string') {
        try {
          await getRoleDetails(id);
        } catch (error) {
          console.error('Failed to fetch role details:', error);
        }
      }
    };

    fetchRole();
    
    // ✅ Cleanup khi unmount
    return () => {
      clearSelectedRole();
    };
  }, [id, getRoleDetails, clearSelectedRole]);

  // ✅ Loading state
  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading role details...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (detailError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error: {detailError}</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Role not found state
  if (!selectedRole) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p>Role not found.</p>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Render role details - TRUYỀN selectedRole VÀO HEADER
  return (
    <div className="flex flex-col h-full w-full space-y-4">
    <RoleDetailHeader role={selectedRole} activeTab={activeTab} />

    <div className="h-screen overflow-hidden flex flex-col">
      <RoleDetailTabs onTabChange={setActiveTab} />
    </div>
  </div>
  );
}