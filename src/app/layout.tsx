import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/shared/components/ui/toaster"
import { ThemeProvider } from "@/shared/components/theme-provider"
import { FilesProvider } from "@/shared/context/files-context"
import { AuthProvider } from "@/shared/context/auth-context"
import { AuthGuard } from '@/shared/components/custom-ui/auth-guard';
export const metadata: Metadata = {
  title: 'Quản lý Cafe',
  description: 'Hệ thống quản lý dành cho quán cafe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuthGuard>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FilesProvider>
              {children}
            </FilesProvider>
            <Toaster />
          </ThemeProvider>
          </AuthGuard>       
        </AuthProvider>
      </body>
    </html>
  );
}
