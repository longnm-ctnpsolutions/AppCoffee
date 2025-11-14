'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/shared/context/auth-context';

interface RootClientRedirectProps {
  returnUrl?: string;
}

export function RootClientRedirect({ returnUrl }: RootClientRedirectProps) {
  const router = useRouter();
  const authState = useAuthState();

  useEffect(() => {
    if (!authState.isInitialized) {
      return; // Wait for AuthProvider to initialize
    }

    if (authState.isAuthenticated && authState.user) {
      router.push('/en/applications');
    } else {
      // Cookie existed but validation failed - invalid/expired
      const loginUrl = returnUrl 
        ? `/en/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : '/en/auth/login';
      router.push(loginUrl);
    }
  }, [authState.isInitialized, authState.isAuthenticated, authState.user, returnUrl, router]);

  // Just return null, let each page handle its own loading
  return null;
}