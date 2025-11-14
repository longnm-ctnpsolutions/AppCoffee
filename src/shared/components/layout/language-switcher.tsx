import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { useHeaderLanguage } from "@/shared/components/layout/hooks/header-menu-state";
import type { MenuState, MenuActions } from "@/shared/components/layout/types/header-menu.type";

interface LanguageSwitcherProps {
  menuState: MenuState;
  menuActions: MenuActions;
  visible?: boolean;
}

export function LanguageSwitcher({ 
  menuState, 
  menuActions, 
  visible = false 
}: LanguageSwitcherProps) {
  const { currentLanguage, languageOptions, handleLanguageChange } = useHeaderLanguage(menuState, menuActions);
  const currentOption = languageOptions.find(opt => opt.code === currentLanguage);
  const currentFlag = currentOption?.flag || '/images/en.png';

  if (!visible) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Image
            src={currentFlag}
            alt={`${currentLanguage} Flag`}
            width={20}
            height={20}
            className="rounded-full object-cover"
            style={{width: '20px', height: '20px', borderRadius: '50%' }}
            data-ai-hint="flag"
          />
          <span>{currentLanguage}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem 
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className="flex items-center gap-1"
          >
            <Image
              src={option.flag} 
              alt={`${option.label} Flag`}
              width={20}
              height={20}
              className="mr-2 rounded-full object-cover"
              style={{width: '20px', height: '20px', borderRadius: '50%' }}
              data-ai-hint="flag"
            />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}