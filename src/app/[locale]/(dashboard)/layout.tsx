"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarProvider,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Header } from "@/shared/components/layout/header";
import { SidebarNav } from "@/shared/components/layout/sidebar";
import { cn } from "@/shared/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile, isTablet } = useSidebar();

  return (
    <div className="flex h-screen w-screen flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Header />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar */}
        <Sidebar>
          <SidebarNav />
        </Sidebar>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 bg-muted/40 p-4 sm:p-6 transition-all duration-300 ease-in-out overflow-hidden",
            // Desktop: adjust margin based on sidebar state
            !isMobile && !isTablet && (state === "expanded" ? "ml-0" : "ml-0"),
            // Tablet: adjust margin when sidebar is collapsed (icon only), no margin when expanded (overlay)
            isTablet && (state === "collapsed" ? "ml-[3.5rem]" : "ml-0"),
            // Mobile: no margin adjustment as sidebar is overlay
            isMobile && "ml-0"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
