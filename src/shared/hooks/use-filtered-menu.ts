import { useMemo } from 'react';
import { usePermissions } from "@/context/auth-context";
import { MenuItem } from '@/layout/types/sidebar-menu.type';

export function useFilteredMenu(menuConfig: MenuItem[]) {
  const { hasPermission } = usePermissions();

  const filteredMenu = useMemo(() => {
    const filterMenuItem = (item: MenuItem): MenuItem | null => {
      if (item.permission && !hasPermission(item.permission)) {
        return null;
      }
      let filteredChildren: MenuItem[] | undefined;
      if (item.children) {
        filteredChildren = item.children
          .map(child => filterMenuItem(child))
          .filter((child): child is MenuItem => child !== null);
        if (filteredChildren.length === 0) {
          filteredChildren = undefined;
        }
      }

      return {
        ...item,
        children: filteredChildren
      };
    };

    return menuConfig
      .map(item => filterMenuItem(item))
      .filter((item): item is MenuItem => item !== null);
  }, [menuConfig, hasPermission]);

  return filteredMenu;
}