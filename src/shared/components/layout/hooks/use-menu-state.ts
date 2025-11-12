"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MenuItem } from "@/layout/types/sidebar-menu.type";

export function useMenuState(menuConfig: MenuItem[]) {
  const pathname = usePathname();
     
  const getDefaultOpenState = (items: MenuItem[]): Record<string, boolean> => {
    const state: Record<string, boolean> = {};
         
    const checkItem = (item: MenuItem, parentPath = ""): void => {
      const fullPath = parentPath ? `${parentPath}.${item.id}` : item.id;
             
      if (item.children) {
        const hasActiveChild = checkHasActiveChild(item.children);
        state[fullPath] = hasActiveChild;
        item.children.forEach(child => checkItem(child, fullPath));
      }
    };
         
    const checkHasActiveChild = (children: MenuItem[]): boolean => {
      return children.some(child => {
        if (child.href && pathname.includes(child.href)) return true;
        if (child.children) return checkHasActiveChild(child.children);
        return false;
      });
    };
         
    items.forEach(item => checkItem(item));
    return state;
  };

  const [openState, setOpenState] = React.useState<Record<string, boolean>>(() =>
     getDefaultOpenState(menuConfig)
  );

  // Update openState when pathname changes (for navigation)
  React.useEffect(() => {
    setOpenState(getDefaultOpenState(menuConfig));
  }, [pathname, menuConfig]);

  // Listen for sidebar opened event to re-expand active submenus
  React.useEffect(() => {
    const handleSidebarOpened = () => {
      const defaultState = getDefaultOpenState(menuConfig);
      setOpenState(prevState => ({
        ...prevState,
        ...defaultState // Merge with existing state, prioritizing active items
      }));
    };

    window.addEventListener('sidebar-opened', handleSidebarOpened);
    return () => window.removeEventListener('sidebar-opened', handleSidebarOpened);
  }, [menuConfig, pathname]);

  const toggleMenu = (menuId: string) => {
    setOpenState(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Function to close all submenus - can be called externally
  const closeAllSubmenus = React.useCallback(() => {
    const currentOpenMenus = Object.keys(openState).filter(key => openState[key]);
    
    if (currentOpenMenus.length === 0) return;
    
    // Close all submenus immediately to prevent flash
    setOpenState(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = false;
      });
      return newState;
    });
  }, [openState]);

  return { 
    openState, 
    toggleMenu, 
    closeAllSubmenus 
  };
}