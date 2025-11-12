// shared/components/layout/AppLogo.tsx
import Link from "next/link";

interface AppLogoProps {
  appName?: string;
  logoSrc?: string;
  href?: string;
}

export function AppLogo({ 
  appName = "Portal Identity", 
  logoSrc = "/images/new-icon.png",
  href = "/"
}: AppLogoProps) {
  const LogoContent = () => (
    <div className="flex items-center gap-2">
      {logoSrc && (
        <img
          src={logoSrc}
          alt={`${appName} Logo`}
          className="h-10 w-10 object-contain"
          onError={(e) => {
            // Fallback nếu ảnh lỗi
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div className="font-headline text-xl font-medium text-primary">
        {appName}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}