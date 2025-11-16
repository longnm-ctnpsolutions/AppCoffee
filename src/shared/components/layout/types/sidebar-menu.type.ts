import {
    User,
    BriefcaseBusiness,
    Settings,
    Shield,
    SquareUser,
    FileText,
    ShoppingCart,
} from "lucide-react";
import { CORE_PERMISSIONS } from "@/types/auth.types";

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href?: string;
    children?: MenuItem[];
    roles?: string[];
    dividerAfter?: boolean;
    permission?: string;
    permissions?: string[];
}

export const menuConfig: MenuItem[] = [
    {
        id: "identity",
        label: "Quản lý định danh",
        icon: SquareUser,
        dividerAfter: true,
        children: [
            {
                id: "users",
                label: "Người dùng",
                icon: User,
                href: "/users",
                permission: CORE_PERMISSIONS.USERS_READ,
            },
            // {
            //     id: "clients",
            //     label: "Clients",
            //     icon: User,
            //     href: "/clients",
            //     permission: CORE_PERMISSIONS.CLIENTS_READ,
            // },
            {
                id: "roles",
                label: "Vai trò",
                icon: Shield,
                href: "/roles",
                permission: CORE_PERMISSIONS.ROLES_READ,
            },
        ],
    },
    {
        id: "applications",
        label: "Ứng dụng",
        icon: BriefcaseBusiness,
        href: "/applications",
        dividerAfter: true,
    },
     {
        id: "pos",
        label: "POS",
        icon: ShoppingCart,
        href: "/pos",
        dividerAfter: true,
    },
    {
        id: "audit-logs",
        label: "Nhật ký truy vết",
        icon: FileText,
        href: "/audit-logs",
        dividerAfter: true,
    },
    {
        id: "settings",
        label: "Cài đặt",
        icon: Settings,
        dividerAfter: true,
        children: [
            {
                id: "profile",
                label: "Hồ sơ người dùng",
                icon: User,
                href: "/user-profile",
            },
            {
                id: "system-settings",
                label: "Cài đặt hệ thống",
                icon: Settings,
                href: "/settings",
                permission: CORE_PERMISSIONS.SYSTEM_SETTINGS,
            },
        ],
    },
];
