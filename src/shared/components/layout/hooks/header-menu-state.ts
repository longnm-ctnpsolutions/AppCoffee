// shared/components/layout/hooks/use-menu-state.ts
import { useState, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { SquareUser, LogOut } from "lucide-react";
import { useAuthActions } from '@/context/auth-context'; // Import auth context
import type { 
  MenuState, 
  MenuActions, 
  ThemeOption, 
  LanguageOption, 
  UserMenuAction, 
  User,
  SidebarMenuItem 
} from '@/layout/types/header-menu.type';

const STORAGE_KEYS = {
  SIDEBAR_STATE: 'layout-sidebar-state',
  LANGUAGE: 'layout-language',
  EXPANDED_SECTIONS: 'layout-expanded-sections'
} as const;

export const useMenuState = (user?: User) => {
  // Menu state
  const [menuState, setMenuState] = useState<MenuState>({
    isSidebarOpen: true,
    activeMenuItem: null,
    expandedSections: [],
    currentLanguage: 'EN'
  });

  const router = useRouter();
  const pathname = usePathname();

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = {
        isSidebarOpen: localStorage.getItem(STORAGE_KEYS.SIDEBAR_STATE) !== 'false',
        currentLanguage: localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'EN',
        expandedSections: JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPANDED_SECTIONS) || '[]')
      };
      
      setMenuState(prev => ({
        ...prev,
        ...savedState
      }));
    }
  }, []);

  // Persist state to localStorage
  const persistState = useCallback((key: keyof typeof STORAGE_KEYS, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    }
  }, []);

  // Menu actions
  const menuActions: MenuActions = {
    toggleSidebar: useCallback(() => {
      setMenuState(prev => {
        const newState = !prev.isSidebarOpen;
        persistState('SIDEBAR_STATE', newState);
        return { ...prev, isSidebarOpen: newState };
      });
    }, [persistState]),

    setActiveMenuItem: useCallback((id: string | null) => {
      setMenuState(prev => ({ ...prev, activeMenuItem: id }));
    }, []),

    toggleSection: useCallback((sectionId: string) => {
      setMenuState(prev => {
        const expandedSections = prev.expandedSections.includes(sectionId)
          ? prev.expandedSections.filter(id => id !== sectionId)
          : [...prev.expandedSections, sectionId];
        
        persistState('EXPANDED_SECTIONS', expandedSections);
        return { ...prev, expandedSections };
      });
    }, [persistState]),

    setLanguage: useCallback((languageCode: string) => {
      setMenuState(prev => {
        persistState('LANGUAGE', languageCode);
        return { ...prev, currentLanguage: languageCode };
      });
    }, [persistState]),

    closeSidebar: useCallback(() => {
      setMenuState(prev => {
        persistState('SIDEBAR_STATE', false);
        return { ...prev, isSidebarOpen: false };
      });
    }, [persistState]),

    openSidebar: useCallback(() => {
      setMenuState(prev => {
        persistState('SIDEBAR_STATE', true);
        return { ...prev, isSidebarOpen: true };
      });
    }, [persistState])
  };

  return {
    menuState,
    menuActions
  };
};

export const useHeaderTheme = () => {
  const { setTheme } = useTheme();

  const themeOptions: ThemeOption[] = [
    { value: 'light', label: 'Sáng', icon: '☀️' },
    { value: 'dark', label: 'Tối', icon: '🌙' },
  ];

  const handleThemeChange = useCallback((theme: ThemeOption['value']) => {
    setTheme(theme);
  }, [setTheme]);

  return {
    themeOptions,
    handleThemeChange
  };
};

export const useHeaderLanguage = (menuState: MenuState, menuActions: MenuActions) => {
  const languageOptions: LanguageOption[] = [
    { code: 'EN', label: 'English', flag: '/images/en.png' },
    { code: 'VI', label: 'Vietnamese', flag: '/images/vi.png' }
  ];
  
  const handleLanguageChange = useCallback((languageCode: string) => {
    menuActions.setLanguage(languageCode);
    // Thêm logic i18n ở đây
    console.log(`Language changed to: ${languageCode}`);
  }, [menuActions]);
  const cleanLanguage = menuState.currentLanguage.replace(/"/g, '')
  return {
    currentLanguage: cleanLanguage,
    languageOptions,
    handleLanguageChange
  };
};

export const useUserMenu = () => {
  const router = useRouter();
  // Lấy logout function từ auth context
  const { logout: authLogout, isActionLoading } = useAuthActions();

  const handleLogout = useCallback(async () => {
    try {
      // Gọi logout từ auth context thay vì console.log
      await authLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [authLogout]);

  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const handleProfile = useCallback(() => {
    router.push('user-profile');
  }, [router]);

  const handleSupport = useCallback(() => {
    router.push('/support');
  }, [router]);

  const userMenuActions: UserMenuAction[] = [
    {
      key: 'profile',
      label: 'Hồ sơ',
      icon: SquareUser,
      onClick: handleProfile
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: LogOut,
      onClick: handleLogout,
      separator: true,
      disabled: isActionLoading // Disable khi đang logout
    }
  ];

  return {
    userMenuActions,
    handleLogout,
    handleSettings,
    handleProfile,
    handleSupport,
    isActionLoading // Export để component có thể sử dụng
  };
};

export const useNavigationMenu = (menuActions: MenuActions) => {
  const pathname = usePathname();

  const handleMenuItemClick = useCallback((item: SidebarMenuItem) => {
    if (item.href) {
      menuActions.setActiveMenuItem(item.id);
      // Navigation sẽ được handle bởi Link component
    } else if (item.onClick) {
      item.onClick();
    }
  }, [menuActions]);

  // Tự động set active menu item dựa trên pathname
  useEffect(() => {
    // Logic để determine active menu item from pathname
    // menuActions.setActiveMenuItem(determinedActiveId);
  }, [pathname, menuActions]);

  return {
    handleMenuItemClick,
    currentPath: pathname
  };
};
