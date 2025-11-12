"use client"

import * as React from "react"
import { useParams } from 'next/navigation'

import ClientDetailHeader from "@/features/clients/components/clientdetail-header"
import ClientDetailTabs from "@/features/clients/components/clientdetail-tab"
import { clients } from "@/features/clients/lib/data"
import type { Client } from "@/features/clients/types/client.types"

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // Find the client from the mock data
  const client = clients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Client not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      <ClientDetailHeader client={client} />
      <div className="h-screen overflow-hidden flex flex-col">
        <ClientDetailTabs client={client} />
      </div>
    </div>
  );
}
