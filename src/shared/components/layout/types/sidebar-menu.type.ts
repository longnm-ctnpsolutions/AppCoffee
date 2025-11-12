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
    label: "Identity Manager",
    icon: SquareUser,
    dividerAfter: true,
    children: [
      { id: "users", label: "Users", icon: User, href: "/users" },
      { id: "clients", label: "Clients", icon: User, href: "/clients" },
      { id: "roles", label: "Roles", icon: Shield, href: "/roles" },
    ]
  },
  {
    id: "applications",
    label: "Applications",
    icon: BriefcaseBusiness,
    href: "/applications",
    dividerAfter: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    dividerAfter: true,
    children: [
      { id: "user-profile", label: "User Profile", icon: User, href: "/user-profile" },
      { id: "system-settings", label: "Settings", icon: Settings, href: "/settings" },
    ]
  },
];
