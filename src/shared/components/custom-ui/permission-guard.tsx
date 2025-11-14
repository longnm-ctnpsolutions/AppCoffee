'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions, useAuth, useAuthState } from '@/context/auth-context';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

export default function PermissionGuard({ 
  children,
  requiredPermission,
  fallbackPath = '/unauthorized' 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();
  const { isLoading } = useAuth();
  const authState = useAuthState();
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   if (!requiredPermission) return;
    
  //   // console.log('🔒 PermissionGuard check:', {
  //   //   pathname,
  //   //   requiredPermission,
  //   //   isInitialized: authState.isInitialized,
  //   //   isAuthenticated: authState.isAuthenticated,
  //   //   isLoading,
  //   //   hasUser: !!authState.user
  //   // });

  //   if (!authState.isInitialized || isLoading) {
  //     return;
  //   }

  //   if (!authState.isAuthenticated || !authState.user) {
  //     return;
  //   }

  //   if (!hasPermission(requiredPermission)) {
  //     const locale = pathname.split('/')[1] || 'en';
  //     router.replace(`/${locale}${fallbackPath}`);
  //   } else {
  //     console.log(`✅ Permission granted for: ${requiredPermission}`);
  //   }

  // }, [
  //   authState.isInitialized,
  //   authState.isAuthenticated,
  //   authState.user,
  //   hasPermission,
  //   requiredPermission,
  //   router,
  //   pathname,
  //   fallbackPath,
  //   isLoading
  // ]);

  return <>{children}</>;
}
