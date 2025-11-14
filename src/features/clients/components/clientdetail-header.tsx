"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";

import type { Client } from "@/features/clients/types/client.types";
import { Card, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface ClientDetailHeaderProps {
    client: Client;
}

export default function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
    const router = useRouter();

    const handleBackClick = () => {
        router.push('/en/clients');
    };

    const isActive = client.status === 1;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={handleBackClick}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-4">
                            {client.logoUrl ? (
                                <Image
                                    src={client.logoUrl}
                                    alt={`${client.name} logo`}
                                    width={48}
                                    height={48}
                                    className="rounded-md"
                                    data-ai-hint="logo"
                                    unoptimized
                                />
                            ) : (
                                <Image
                                    src="/images/ctnp-logo.png"
                                    alt="Default logo"
                                    width={48}
                                    height={48}
                                    className="rounded-md"
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
                            <span className="capitalize"> {isActive ? "Active" : "Inactive"}</span>
                        </Badge>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
