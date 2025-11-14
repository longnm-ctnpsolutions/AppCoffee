import { ClientsProvider } from "@/shared/context/clients-context";

export default function ClientsLayout({ children }: { children: React.ReactNode; }) {
    return (
        <ClientsProvider>
            {children}
        </ClientsProvider>
    );
}
