import { ChevronDown } from "lucide-react";
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
}

export function LanguageSwitcher({ menuState, menuActions }: LanguageSwitcherProps) {
  const { currentLanguage, languageOptions, handleLanguageChange } = useHeaderLanguage(menuState, menuActions);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span className="font-bold">{currentLanguage}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem 
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className="flex items-center gap-2"
          >
            {option.flag && <span>{option.flag}</span>}
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}