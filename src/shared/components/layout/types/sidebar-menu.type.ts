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
        label: "Identity Manager",
        icon: SquareUser,
        dividerAfter: true,
        children: [
            {
                id: "users",
                label: "Users",
                icon: User,
                href: "/users",
                permission: CORE_PERMISSIONS.USERS_READ,
            },
            {
                id: "clients",
                label: "Clients",
                icon: User,
                href: "/clients",
                permission: CORE_PERMISSIONS.CLIENTS_READ,
            },
            {
                id: "roles",
                label: "Roles",
                icon: Shield,
                href: "/roles",
                permission: CORE_PERMISSIONS.ROLES_READ,
            },
        ],
    },
    {
        id: "applications",
        label: "Applications",
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
        label: "Audit Logs",
        icon: FileText,
        href: "/audit-logs",
        dividerAfter: true,
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        dividerAfter: true,
        children: [
            {
                id: "profile",
                label: "User Profile",
                icon: User,
                href: "/user-profile",
            },
            {
                id: "system-settings",
                label: "System Settings",
                icon: Settings,
                href: "/settings",
                permission: CORE_PERMISSIONS.SYSTEM_SETTINGS,
            },
        ],
    },
];
