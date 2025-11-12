"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { ArrowLeft } from "lucide-react"

import type { Client } from "@/features/clients/types/client.types"
import { Card, CardHeader } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface ClientDetailHeaderProps {
  client: Client;
}

export default function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const router = useRouter();
  
  const handleBackClick = () => {
    router.push('/en/clients');
  };

  const statusText = client.status === 1 ? 'active' : 'inactive';
  const isActive = statusText === 'active';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackClick}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              {client.logo && (
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-md"
                  data-ai-hint="logo"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{client.name}</h2>
                {client.description && (
                  <p className="text-sm text-muted-foreground">{client.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={cn(
                "border-transparent text-xs font-semibold",
                isActive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              )}
            >
              <span className={cn(
                "mr-1.5 h-2 w-2 rounded-full", 
                isActive ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="capitalize">{statusText}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
