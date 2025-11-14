import { UsersProvider } from "@/shared/context/users-context";

export default function UsersLayout({ children }: { children: React.ReactNode; }) {
    return (
        <UsersProvider>
            {children}
        </UsersProvider>
    );
}
