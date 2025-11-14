"use client"

import * as React from "react"
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'

import ClientDetailHeader from "@/features/clients/components/clientdetail-header"
import ClientDetailTabs from "@/features/clients/components/client-detail/client-detail-tabs"
import { useClientDetail, useClientsActions } from "@/context/clients-context"
import { Button } from "@/shared/components/ui/button"

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  // ✅ Sử dụng context để lấy selected client
  const { selectedClient, isDetailLoading, detailError } = useClientDetail();
  const { getClientDetails, clearSelectedClient } = useClientsActions();
  
  // ✅ Fetch client details khi component mount
  React.useEffect(() => {
    const fetchClient = async () => {
      if (typeof id === 'string') {
        try {
          await getClientDetails(id);
        } catch (error) {
          console.error('Failed to fetch client details:', error);
        }
      }
    };

    fetchClient();
    
    // ✅ Cleanup khi unmount
    return () => {
      clearSelectedClient();
    };
  }, [id, getClientDetails, clearSelectedClient]);

  // ✅ Loading state
  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading client details...</p>
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

  // ✅ Client not found state
  if (!selectedClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p>Client not found.</p>
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

  // ✅ Render client details - TRUYỀN selectedClient VÀO HEADER
  return (
    <div className="flex flex-col h-full w-full space-y-4">
      {/* ✅ Truyền selectedClient từ context vào ClientDetailHeader */}
      <ClientDetailHeader client={selectedClient} />
      
      <div className="h-screen overflow-hidden flex flex-col">
        <ClientDetailTabs/>
      </div>
    </div>
  );
}