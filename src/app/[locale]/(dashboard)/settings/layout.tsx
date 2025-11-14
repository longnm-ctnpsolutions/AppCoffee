import { SystemSettingsProvider } from "@/context/system-settings-context";

export default function RolesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SystemSettingsProvider>{children}</SystemSettingsProvider>
    );
}
