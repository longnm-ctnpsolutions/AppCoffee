import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import { Card } from "@/shared/components/ui/card";
import { useState } from "react";
import { useClientsActions, useClientDetail } from "@/context/clients-context";
import ClientDetailsForm from "@/features/clients/components/client-detail/client-detail-form-tab/client-detail-form";
import type { Permission } from "@/types/permissions.types";
import PermissionsTableWrapper from "./permissions-client-tab/permissions-table-wrap";
import { usePermissions } from "@/context/auth-context";
import { CORE_PERMISSIONS } from "@/types/auth.types";

export default function ClientDetailTabs() {
    const { error } = useClientsActions();
    const [permissionsCount, setPermissionsCount] = useState(0);
    const { selectedClient } = useClientDetail();
    
    // Always show tabs, regardless of permissions
    const clientPermissions = React.useMemo(() => ({
        canPermissionsRead: true,
        canChangeStatus: true,
        canEdit: true,
        canPermissionsCreate: true,
        canPermissionsDelete: true,
    }), []);

    const handleDeletePermission = async (permission: Permission) => {
        try {
            return Promise.resolve();
        } catch (error) {
            throw error;
        }
    };

    const handlePermissionsCountChange = (count: number) => {
        setPermissionsCount(count);
    };

    return (
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            {/* Card chứa TabsList (Header) - Added shadow */}
            <Card className="rounded-b-none border-b-0 shadow-md">
                <div className="px-2 pt-1 pb-2">
                    <TabsList className="w-full justify-start bg-transparent">
                        <TabsTrigger value="details">Chi tiết</TabsTrigger>
                        <TabsTrigger value="permissions">
                            Quyền
                            {permissionsCount > 0 && (
                                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                    {permissionsCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Card>

            {/* Card chứa nội dung, có thể scroll - Added shadow */}
            <Card className="flex flex-col flex-1 overflow-hidden rounded-t-none shadow-lg">
                <div className="flex flex-col flex-1 h-full min-h-0">
                    <div className="flex-1 flex flex-col overflow-y-auto min-h-0 px-4 pb-6 pt-0">
                        <TabsContent value="details">
                            <ClientDetailsForm error={error} permissions={clientPermissions} />
                        </TabsContent>

                        <TabsContent value="permissions" className="flex-1 flex flex-col min-h-0 space-y-6">
                            {/* Show error if any */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-800">Lỗi: {error}</p>
                                </div>
                            )}

                            {/* Only the PermissionsTable is wrapped with OData context */}
                            <PermissionsTableWrapper
                                clientId={selectedClient!.id}
                                onDeletePermission={handleDeletePermission}
                                onPermissionsCountChange={handlePermissionsCountChange}
                                initialPageSize={10}
                                canPermissionsCreate={clientPermissions.canPermissionsCreate}
                                canPermissionsDelete={clientPermissions.canPermissionsDelete}
                            />
                        </TabsContent>
                    </div>
                </div>
            </Card>
        </Tabs>
    );
}
