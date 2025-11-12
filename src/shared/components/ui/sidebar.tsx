"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { AlignJustify  } from "lucide-react"

import { useIsMobile } from "@/shared/hooks/use-mobile"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Separator } from "@/shared/components/ui/separator"
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/sheet"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem" 
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  isTablet: boolean
  toggleSidebar: () => void
  closeAllSubmenus: () => void
  setCloseAllSubmenus: (fn: () => void) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

// Custom hook to detect tablet size
function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(false)

  React.useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth < 1200 && window.innerWidth >= 768)
    }
    
    checkTablet()
    window.addEventListener('resize', checkTablet)
    return () => window.removeEventListener('resize', checkTablet)
  }, [])

  return isTablet
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const isTablet = useIsTablet()
    const [openMobile, setOpenMobile] = React.useState(false)
    
    // Reference to external close all submenus function
    const closeAllSubmenusRef = React.useRef<(() => void) | null>(null)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    const closeAllSubmenus = React.useCallback(() => {
      if (closeAllSubmenusRef.current) {
        closeAllSubmenusRef.current()
      }
    }, [])

    const setCloseAllSubmenus = React.useCallback((fn: () => void) => {
      closeAllSubmenusRef.current = fn
    }, [])

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        if (openMobile) {
          // Closing: close submenus first, then close sidebar with delay
          closeAllSubmenus()
          setTimeout(() => {
            setOpenMobile(false)
          }, 200) // Increased delay to prevent flash
        } else {
          // Opening: open sidebar first, then expand active submenus
          setOpenMobile(true)
          setTimeout(() => {
            // Re-apply default submenu states (auto-expand active items)
            if (closeAllSubmenusRef.current) {
              // This will trigger useMenuState to recalculate and open active submenus
              const event = new CustomEvent('sidebar-opened')
              window.dispatchEvent(event)
            }
          }, 100)
        }
      } else {
        if (open) {
          // Closing: close submenus and sidebar together on desktop
          closeAllSubmenus()
          setOpen(false)
        } else {
          // Opening: open sidebar first, then expand active submenus
          setOpen(true)
          setTimeout(() => {
            // Re-apply default submenu states (auto-expand active items)
            const event = new CustomEvent('sidebar-opened')
            window.dispatchEvent(event)
          }, 100)
        }
      }
    }, [isMobile, open, openMobile, setOpen, setOpenMobile, closeAllSubmenus])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          
          if (isMobile) {
            if (openMobile) {
              // Closing: close submenus first, then close sidebar with delay
              closeAllSubmenus()
              setTimeout(() => {
                setOpenMobile(false)
              }, 200)
            } else {
              // Opening: open sidebar first, then expand active submenus
              setOpenMobile(true)
              setTimeout(() => {
                const event = new CustomEvent('sidebar-opened')
                window.dispatchEvent(event)
              }, 100)
            }
          } else {
            if (open) {
              // Closing: close submenus and sidebar together on desktop
              closeAllSubmenus()
              setOpen(false)
            } else {
              // Opening: open sidebar first, then expand active submenus
              setOpen(true)
              setTimeout(() => {
                const event = new CustomEvent('sidebar-opened')
                window.dispatchEvent(event)
              }, 100)
            }
          }
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isMobile, open, openMobile, setOpen, setOpenMobile, closeAllSubmenus])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        isTablet,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        closeAllSubmenus,
        setCloseAllSubmenus,
      }),
      [state, open, setOpen, isMobile, isTablet, openMobile, setOpenMobile, toggleSidebar, closeAllSubmenus, setCloseAllSubmenus]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div ref={ref} {...props}>
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, isTablet, state, open, openMobile, setOpenMobile, setOpen, closeAllSubmenus } = useSidebar()

    // Mobile: Use Sheet with custom overlay positioning
    if (isMobile) {
      return (
        <>
          <Sheet open={openMobile} onOpenChange={(open) => {
            if (!open) {
              // When closing: close submenus first, then close sidebar
              closeAllSubmenus?.()
              setTimeout(() => {
                setOpenMobile(false)
              }, 200) // Increased delay to prevent flash
            } else {
              setOpenMobile(true)
              // When opening, expand active submenus after sidebar is open
              setTimeout(() => {
                const event = new CustomEvent('sidebar-opened')
                window.dispatchEvent(event)
              }, 100)
            }
          }} {...props}>
            <SheetContent
              data-sidebar="sidebar"
              data-mobile="true" 
              data-state="expanded" // Force expanded state for mobile
              className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden top-16 h-[calc(100vh-4rem)] z-40 border-0"
              style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
              side={side}
              onEscapeKeyDown={() => {
                // Close submenus first, then close sidebar
                closeAllSubmenus?.()
                setTimeout(() => {
                  setOpenMobile(false)
                }, 200) // Increased delay to prevent flash
              }}
            >
              <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
              <div className="flex h-full w-full flex-col" data-state="expanded">
                {children}
              </div>
            </SheetContent>
          </Sheet>
          {/* Custom overlay: only covers content area from header down, positioned behind sidebar */}
          {openMobile && (
            <>
              {/* Hide default shadcn overlay */}
              <style jsx global>{`
                [data-radix-popper-content-wrapper] {
                  z-index: -1 !important;
                }
                .fixed.inset-0.z-50 {
                  display: none !important;
                }
              `}</style>
              <div 
                className="fixed top-16 bottom-0 z-30 bg-black/50 transition-opacity duration-200"
                style={{ 
                  left: side === "left" ? SIDEBAR_WIDTH : "0",
                  right: side === "right" ? SIDEBAR_WIDTH : "0"
                }}
                onClick={() => {
                  // Close submenus first, then close sidebar with delay for smooth animation
                  closeAllSubmenus?.()
                  setTimeout(() => {
                    setOpenMobile(false)
                  }, 200) // Increased delay to prevent flash
                }}
              />
            </>
          )}
        </>
      )
    }

    // Tablet: Icon only when collapsed, full width with overlay when expanded
    if (isTablet) {
      return (
        <>
          <div
            ref={ref}
            data-sidebar="sidebar"
            data-state={state}
            className={cn(
              "fixed left-0 top-16 z-30 flex flex-col h-[calc(100vh-4rem)] bg-sidebar text-sidebar-foreground border-r transition-all duration-300 ease-in-out",
              state === 'expanded' ? 'w-[16rem]' : 'w-[3.5rem]',
              className
            )}
            {...props}
          >
            {children}
          </div>
          {/* Overlay when expanded on tablet */}
          {state === 'expanded' && (
            <div 
              className="fixed inset-0 top-16 z-20 bg-black/50"
              onClick={() => setOpen(false)} // Fix: Use setOpen from context
            />
          )}
        </>
      )
    }

    // Desktop: Normal behavior
    return (
      <div
        ref={ref}
        data-sidebar="sidebar"
        data-state={state}
        className={cn(
          "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r transition-all duration-300 ease-in-out",
          state === 'expanded' ? 'w-[16rem]' : 'w-[3.5rem]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-10 w-10", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <AlignJustify />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state, isMobile, openMobile } = useSidebar();
  // On mobile, when sidebar is open, treat as expanded
  const effectiveState = isMobile && openMobile ? 'expanded' : state;
  
  return (
    <div
      ref={ref}
      data-sidebar="content"
      data-state={effectiveState}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto",
        effectiveState === 'collapsed' && 'overflow-hidden',
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: React.ReactNode
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { state, isMobile, openMobile } = useSidebar()
    // On mobile, when sidebar is open, treat as expanded
    const effectiveState = isMobile && openMobile ? 'expanded' : state;

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        data-state={effectiveState}
        className={cn(
          "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 mx-2",
          "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )

    // Show tooltip only when collapsed and not on mobile
    if (!tooltip || effectiveState === 'expanded' || isMobile) {
      return buttonContent;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={effectiveState !== "collapsed" || isMobile}
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
    const { state, isMobile, openMobile } = useSidebar();
    // On mobile, when sidebar is open, treat as expanded
    const effectiveState = isMobile && openMobile ? 'expanded' : state;
    
    if (effectiveState === 'collapsed') return null;

    return (
        <ul
            ref={ref}
            data-sidebar="menu-sub"
            data-state={effectiveState}
            className={cn(
                "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-sidebar-border px-2.5 py-0.5",
                className
            )}
            {...props}
        />
    )
})
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}

// Keep other exports if they exist and are needed
export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(() => null);
export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(() => null);
export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(() => null);
export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(() => null);
export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(() => null);
export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(() => null);
export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(() => null);
export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(() => null);
export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(() => null);
export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean, showOnHover?: boolean }
>(() => null);
export const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(() => null);
export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { showIcon?: boolean }
>(() => null);
export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(() => null);
