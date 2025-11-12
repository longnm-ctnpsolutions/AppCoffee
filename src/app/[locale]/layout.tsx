// This is the root layout that will be shared by all routes.
// The dashboard-specific layout is now in (dashboard)/layout.tsx.

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
