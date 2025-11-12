export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface HeaderProps {
  user?: User;
  appName?: string;
  logoSrc?: string;
}

export interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon?: string;
}

export interface LanguageOption {
  code: string;
  label: string;
  flag?: string;
  isActive?: boolean;
}

export interface UserMenuAction {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  separator?: boolean;
  disabled?: boolean;
}

export interface MenuState {
  isSidebarOpen: boolean;
  activeMenuItem: string | null;
  expandedSections: string[];
  currentLanguage: string;
}

export interface MenuActions {
  toggleSidebar: () => void;
  setActiveMenuItem: (id: string | null) => void;
  toggleSection: (sectionId: string) => void;
  setLanguage: (languageCode: string) => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}


export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  children?: SidebarMenuItem[];
  isActive?: boolean;
  disabled?: boolean;
  badge?: string | number;
}



export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarMenuItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}