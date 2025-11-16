import { redirect } from 'next/navigation';
import { RootClientRedirect } from '@/shared/components/custom-ui/root-client-redirect';
interface RootPageProps {
    searchParams: Promise<{
        token?: string;
        email?: string;
        returnUrl?: string;
    }>;
}

export default async function RootPage({ searchParams }: RootPageProps) {
    const { token, email, returnUrl } = await searchParams;

    if (token && email) {
        redirect(`/vi/auth/create-new-password?token=${token}&email=${email}`);
    }

    return <RootClientRedirect returnUrl={returnUrl} />;
}
