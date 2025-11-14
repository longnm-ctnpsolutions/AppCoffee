"use client";

import * as React from "react";
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';

import UserDetailHeader from "@/features/users/components/userdetail-header";
import { useUserDetail, useUsersActions } from "@/context/users-context";
import { Button } from "@/shared/components/ui/button";
import UserDetailTabs from "@/features/users/components/user-detail/user-detail-tab";

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    // ✅ Sử dụng context để lấy selected user
    const { selectedUser, isDetailLoading, detailError } = useUserDetail();
    const { fetchUserById, clearSelectedUser } = useUsersActions();

    const [activeTab, setActiveTab] = React.useState("details");

    // ✅ Fetch user details khi component mount
    React.useEffect(() => {
        const fetchUser = async () => {
            if (typeof id === 'string') {
                try {
                    await fetchUserById(id);
                } catch (error) {
                    console.error('Failed to fetch user details:', error);
                }
            }
        };

        fetchUser();

        // ✅ Cleanup khi unmount
        return () => {
            clearSelectedUser();
        };
    }, [id, fetchUserById, clearSelectedUser]);

    // ✅ Loading state
    if (isDetailLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading user details...</p>
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

    // ✅ User not found state
    if (!selectedUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                    <p>User not found.</p>
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

    // ✅ Render user details - TRUYỀN selectedUser VÀO HEADER
    return (
        <div className="flex flex-col h-full w-full space-y-4">
            <UserDetailHeader user={selectedUser} activeTab={activeTab} />

            <div className="h-screen overflow-hidden flex flex-col">
                <UserDetailTabs onTabChange={setActiveTab} />
            </div>
        </div>
    );
}
