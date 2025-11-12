"use client"
import * as React from "react"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AppLogo } from "./app-logo"
import { ThemeSwitcher } from "./theme-switcher"
import { LanguageSwitcher } from "./language-switcher"
import { UserMenu } from "./user-menu"
import { useMenuState } from "@/shared/components/layout/hooks/header-menu-state"
import type { HeaderProps } from "@/shared/components/layout/types/header-menu.type"

export function Header({ 
  user,
  appName = "Portal Identity",
  logoSrc = "/images/new-icon.png"
}: HeaderProps) {
  const { menuState, menuActions } = useMenuState(user);

  return (
    <header className="flex h-16 w-full shrink-0 items-center gap-4 border-b bg-sidebar pr-6 pl-[10px]">
      <SidebarTrigger />
      
      <AppLogo 
        appName={appName}
        logoSrc={logoSrc}
        href="/"
      />
      
      <div className="ml-auto flex items-center gap-4">
        <ThemeSwitcher />
        <LanguageSwitcher 
          menuState={menuState}
          menuActions={menuActions}
        />
        <UserMenu user={user} />
      </div>
    </header>
  );
}