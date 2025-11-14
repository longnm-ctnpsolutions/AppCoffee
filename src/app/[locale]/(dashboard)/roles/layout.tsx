import { RolesProvider } from "@/shared/context/roles-context";

export default function RolesLayout({ children }: { children: React.ReactNode; }) {
    return (
        <RolesProvider>
            {children}
        </RolesProvider>
    );
}
