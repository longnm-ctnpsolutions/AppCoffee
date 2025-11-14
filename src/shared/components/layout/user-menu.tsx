import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { useUserMenu } from "@/shared/components/layout/hooks/header-menu-state";
import { useAuthState } from "@/shared/context/auth-context";
import React from "react";

export function UserMenuInner() {
  const { profile } = useAuthState()
  const { userMenuActions } = useUserMenu(); // nếu hook cần profile thì truyền vào, không thì bỏ luôn

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`;
    return initials.toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md"
          aria-label="Open user menu"
        >
          <Avatar className="rounded-md cursor-pointer h-8 w-8">
            <AvatarImage
              src={profile?.image || "/images/personal.svg"}
              alt={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "User"}
              data-ai-hint="avatar user"
            />
            <AvatarFallback>
              {getInitials(profile?.firstName, profile?.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {profile
            ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
            : "User Name"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userMenuActions.map((action, index) => (
          <div key={action.key}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className="flex items-center gap-2"
              disabled={action.disabled}
            >
              {action.icon && (
                <span className="text-sm">
                  {React.createElement(action.icon)}
                </span>
              )}
              <span>{action.label}</span>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  return (
      <UserMenuInner />
  );
}
