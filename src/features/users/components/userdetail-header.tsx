"use client";

import * as React from "react";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";

import type { User, UserFormData } from "@/features/users/types/user.types";
import { Card, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface UserDetailHeaderProps {
    user: any;
    activeTab?: string;
}

// ✅ Bỏ React.memo để component tự nhiên re-render khi props thay đổi
const UserDetailHeader: React.FC<UserDetailHeaderProps> = ({ user, activeTab }) => {
    const router = useRouter();
    const subtitleMap: Record<string, string> = {
        details: "Chi tiết người dùng.",
        permissions: "Danh sách các quyền mà người dùng này có.",
        roles: "Các vai trò được gán cho người dùng này.",
    };
    const handleBackClick = React.useCallback(() => {
        router.push('/vi/users');
    }, [router]);
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={handleBackClick}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div>
                            <h2 className="text-xl font-semibold">
                                {user.lastName + " " + user.firstName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {subtitleMap[activeTab ?? "details"]}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                "border-transparent text-xs font-semibold",
                                user.lockoutEnabled === false
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            )}
                        >
                            <span
                                className={cn(
                                    "mr-1.5 h-2 w-2 rounded-full",
                                    user.lockoutEnabled === false ? "bg-green-500" : "bg-gray-400"
                                )}
                            />
                            <span className="capitalize">
                                {user.lockoutEnabled === false ? "Hoạt động" : "Không hoạt động"}
                            </span>
                        </Badge>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};

UserDetailHeader.displayName = 'UserDetailHeader';

export default UserDetailHeader;
