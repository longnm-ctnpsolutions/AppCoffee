
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full login-background p-4 sm:p-0">
      {children}
    </div>
  );
}
