"use client";

import * as React from "react";
import { SidebarContent, SidebarMenu, useSidebar } from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { menuConfig } from "@/layout/types/sidebar-menu.type";
import { useMenuState } from "@/layout/hooks/use-menu-state";
import { MenuItem } from "./nav-item";

export function SidebarNav() {
  const { state, isMobile, openMobile, setCloseAllSubmenus } = useSidebar();
  const effectiveState = isMobile && openMobile ? 'expanded' : state;
  
  // Use the existing useMenuState hook
  const { openState, toggleMenu } = useMenuState(menuConfig);

  // Create a function to close all submenus and register it with sidebar context
  const closeAllSubmenus = React.useCallback(() => {
    // Get all currently open submenus
    const openMenus = Object.keys(openState).filter(key => openState[key]);
    
    if (openMenus.length === 0) return;
    
    // Close all submenus immediately to prevent flash on mobile
    openMenus.forEach(key => {
      toggleMenu(key);
    });
  }, [openState, toggleMenu]);

  // Register the close function with sidebar context
  React.useEffect(() => {
    setCloseAllSubmenus(closeAllSubmenus);
  }, [setCloseAllSubmenus, closeAllSubmenus]);

  return (
    <div className="flex flex-col h-full">
      <SidebarContent className="flex-1">
        {menuConfig.map((item, index) => (
          <React.Fragment key={item.id}>
            <SidebarMenu className={cn("pr-4", index === 0 && "pt-2")}>
              <MenuItem
                item={item}
                openState={openState}
                toggleMenu={toggleMenu}
              />
            </SidebarMenu>
            {item.dividerAfter && (
              <div className="h-px bg-sidebar-border" />
            )}
          </React.Fragment>
        ))}
      </SidebarContent>
      {effectiveState !== 'collapsed' && (
        <div className="p-4 transition-all duration-500">
          <div className="text-xs text-muted-foreground transition-all duration-500">
            <div>Copyright © 2025</div>
            <div>CTNP Solutions.</div>
          </div>
        </div>
      )}
    </div>
  );
}