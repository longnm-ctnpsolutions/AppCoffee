// Clean nav-item.tsx - Using props from useMenuState
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MenuItem } from "@/layout/types/sidebar-menu.type";

interface MenuItemProps {
  item: MenuItem;
  level?: number;
  parentPath?: string;
  openState: Record<string, boolean>;      // From useMenuState
  toggleMenu: (menuId: string) => void;    // From useMenuState
}

export function MenuItem({ 
  item, 
  level = 0, 
  parentPath = "", 
  openState, 
  toggleMenu 
}: MenuItemProps) {
  const { 
    state, 
    setOpen, 
    isMobile, 
    openMobile, 
    setOpenMobile
  } = useSidebar();
  
  const effectiveState = isMobile && openMobile ? 'expanded' : state;
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'en';
  
  const fullPath = parentPath ? `${parentPath}.${item.id}` : item.id;
  const isOpen = openState[fullPath] || false;
  const isActive = item.href ? pathname.includes(item.href) : false;
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // If sidebar is collapsed, expand it first
    if (effectiveState === 'collapsed') {
      setOpen(true);
      
      // If item has submenu, open it after expanding sidebar
      if (item.children) {
        setTimeout(() => {
          toggleMenu(fullPath);
        }, 100); // Small delay to allow sidebar expansion
      } else if (item.href) {
        // If no submenu, navigate after expanding
        setTimeout(() => {
          const href = `/${locale}${item.href}`;
          router.push(href);
        }, 100);
      }
      return;
    }
    
    // If sidebar is expanded
    if (item.children) {
      // Has submenu - toggle submenu
      toggleMenu(fullPath);
    } else if (item.href) {
      // No submenu - navigate and close sidebar on mobile
      const href = `/${locale}${item.href}`;
      router.push(href);
      
      // On mobile, close sidebar after navigation
      if (isMobile && openMobile) {
        setTimeout(() => {
          setOpenMobile(false);
        }, 200);
      }
    }
  };

  if (!item.children) {
    const Component = level === 0 ? SidebarMenuButton : SidebarMenuSubButton;
    
    return (
      <SidebarMenuItem>
        <Component
          tooltip={item.label}
          isActive={isActive}
          className={cn(
            "w-full flex items-center cursor-pointer",
            effectiveState === 'collapsed' && "justify-center",
            level > 0 && "ml-4"
          )}
          onClick={handleMenuClick}
        >
          {level === 0 && (
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          )}
          {effectiveState !== 'collapsed' && (
            <span className="flex-1 overflow-hidden whitespace-nowrap ml-2">
              {item.label}
            </span>
          )}
        </Component>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={() => toggleMenu(fullPath)}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.label}
            className={cn(
              "w-full flex items-center cursor-pointer",
              effectiveState === 'collapsed' && "justify-center"
            )}
            onClick={handleMenuClick}
          >
            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {effectiveState !== 'collapsed' && (
              <div className="flex-1 overflow-hidden whitespace-nowrap flex items-center justify-between ml-2">
                <span>{item.label}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </div>
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.children.map(child => (
            <MenuItem
              key={child.id}
              item={child}
              level={level + 1}
              parentPath={fullPath}
              openState={openState}
              toggleMenu={toggleMenu}
            />
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}