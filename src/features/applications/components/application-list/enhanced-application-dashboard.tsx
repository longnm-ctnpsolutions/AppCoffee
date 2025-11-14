"use client"

import * as React from "react"

import { useGenericDashboard } from "@/shared/hooks/use-generic-dashboard"
import { ListLayout } from "@/shared/components/custom-ui/list-layout"

import { useApplicationsActions } from "@/shared/context/applications-context" 
import { applicationDashboardConfig } from "@/features/applications/config/application-dashboard.config"

import { ApplicationActions } from "@/features/applications/components/application-actions"
import { ApplicationEmptyState } from "./application-empty-state"
import { TablePagination } from "@/shared/components/custom-ui/pagination"
import { ExternalLink } from "lucide-react"

import Image from "next/image"
import { accessClient, getClients } from "@/shared/api/services/clients/clients.service"
import { Application } from "../../types/application.types"

export function EnhancedApplicationDashboard() {
  // ✅ Use existing application context actions
  const applicationContext = useApplicationsActions()
  
  // ✅ Create adapter to match EntityActions interface
  const applicationActions = React.useMemo(() => ({
    entities: applicationContext.applications,
    isLoading: applicationContext.isLoading,
    isActionLoading: applicationContext.isActionLoading,
    error: applicationContext.error,
    totalCount: applicationContext.totalCount,
    hasMore: applicationContext.hasMore,
    searchTerm: applicationContext.searchTerm,
    isSearching: applicationContext.isSearching,
    setSearchTerm: applicationContext.setSearchTerm,
    clearSearch: applicationContext.clearSearch,
    fetchEntities: applicationContext.fetchApplications,
    addEntity: undefined as any,
    removeEntity: undefined as any,
    removeMultipleEntities: undefined as any,
  }), [applicationContext])
  
  // ✅ Generic dashboard logic
  const dashboardState = useGenericDashboard(applicationActions, applicationDashboardConfig)
  
  const {
    entities: applications,
    isLoading,
    totalCount,
    stablePaginationData,
    setStablePaginationData,
    isAddDialogOpen,
    setAddDialogOpen,
    isMounted,
    isSidebarExpanded,
    form: addApplicationForm,
    handleRefreshData,
    handleSearchTermChange,
    isEmpty,
    searchTerm,
    isActionLoading,
  } = dashboardState

const SkeletonCard = () => (
  <div className="rounded-xl border p-6 shadow flex items-center gap-4 justify-between animate-pulse">
    {/* Logo skeleton */}
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 bg-gray-300 rounded-md" />

      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 bg-gray-300 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>

    {/* Icon skeleton */}
    <div className="h-7 w-7 bg-gray-300 rounded" />
  </div>
);

const handleClick = async (app: Application) => {
    const res = await accessClient(app.identifier);
    window.open(app.callbackUrl + "?token="  + res.accessToken, "_blank");
};

const listComponent = React.useMemo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 m-4">
    {isLoading ? (
      // render 4 skeleton cards
      Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
    ) : (
      applications.map(app => (
        <a
          key={app.id || app.name}
          href={app.homePageUrl}
          onClick={(e) => { e.preventDefault(); handleClick(app); }}
          target="_blank"
          rel="noopener noreferrer"
          title={app.homePageUrl} 
          className="rounded-xl border p-6 shadow transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg flex items-center gap-4 justify-between cursor-pointer"
        >
          {/* Logo + Text */}
          <div className="flex items-center gap-4">
              <Image
                src={app.logoUrl || "/images/ctnp-logo.png"}
                alt={"Default logo"}
                className="h-15 w-15 object-contain"
                width={50}
                height={50}
              />
            <div className="flex flex-col">
              <h3 className="font-semibold">{app.name}</h3>
              <p className="text-sm text-gray-500">{app.description}</p>
            </div>
          </div>

        <ExternalLink className="w-7 h-7 text-blue-500 flex-shrink-0" />

        </a>
      ))
    )}
  </div>
), [applications, isLoading])

  const actionsComponent = React.useMemo(() => (
    <ApplicationActions 
      isLoading={!isMounted || isActionLoading}
      searchTerm={searchTerm}
      setSearchTerm={handleSearchTermChange}
      onRefreshData={handleRefreshData}
      isSidebarExpanded={isSidebarExpanded}
    />
  ), [
    isMounted,
    isActionLoading,
    isAddDialogOpen,
    setAddDialogOpen,
    addApplicationForm,
    searchTerm,
    handleSearchTermChange,
    handleRefreshData,
    isSidebarExpanded,
    applications,
  ])

  const emptyStateComponent = React.useMemo(() => {
    if (!isEmpty) return undefined
    
    return (
      <ApplicationEmptyState
        isSearching={applicationContext.isSearching}
        hasFilters={false} // ❌ bỏ filter table vì không dùng columnFilters nữa
        onAddApplication={() => setAddDialogOpen(true)}
      />
    )
  }, [isEmpty, applicationContext.isSearching, setAddDialogOpen])

  return (
    <ListLayout
      actions={actionsComponent}
      tableContent={listComponent}
      emptyState={emptyStateComponent}
    />
  )
}
