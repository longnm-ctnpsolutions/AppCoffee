import { User, BriefcaseBusiness, Settings, Shield, SquareUser } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: MenuItem[];
  roles?: string[];
  dividerAfter?: boolean;
}

export const menuConfig: MenuItem[] = [
  {
    id: "identity",
    label: "Quản lý định danh",
    icon: SquareUser,
    dividerAfter: true,
    children: [
      { id: "users", label: "Người dùng", icon: User, href: "/users" },
      { id: "clients", label: "Máy khách", icon: User, href: "/clients" },
      { id: "roles", label: "Vai trò", icon: Shield, href: "/roles" },
    ]
  },
  {
    id: "applications",
    label: "Ứng dụng",
    icon: BriefcaseBusiness,
    href: "/applications",
    dividerAfter: true,
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: Settings,
    dividerAfter: true,
    children: [
      { id: "user-profile", label: "Hồ sơ người dùng", icon: User, href: "/user-profile" },
      { id: "system-settings", label: "Cài đặt hệ thống", icon: Settings, href: "/settings" },
    ]
  },
];
