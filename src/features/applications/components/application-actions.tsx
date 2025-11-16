import * as React from "react"
import { 
  Search,
  RefreshCw,
} from "lucide-react"

import { Input } from "@/shared/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import ActionBar from '@/shared/components/custom-ui/actions-bar'
import { ActionItem } from '@/shared/hooks/use-responsive-actions'

interface ApplicationActionsProps {
  isLoading?: boolean
  isSidebarExpanded: boolean
  onRefreshData?: () => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}


/* ---------------- CLIENT ACTIONS ---------------- */
export const ApplicationActions = React.memo(function ApplicationActions({ 
  isLoading,
  isSidebarExpanded,
  onRefreshData,
  searchTerm,
  setSearchTerm,
}: ApplicationActionsProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [setSearchTerm])

  const actions: ActionItem[] = React.useMemo(() => [
    {
      id: 'refresh',
      label: 'Làm mới dữ liệu',
      icon: RefreshCw,
      type: 'button',
      variant: 'ghost',
      size: 'icon',
      onClick: onRefreshData,
      priority: 1,
    },
  ], [onRefreshData])

  if (!isMounted || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ứng dụng</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Ứng dụng</CardTitle>
            <CardDescription>Quản lý các ứng dụng của bạn.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm ứng dụng..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 w-full md:w-[250px]"
              />
            </div>
            <ActionBar 
              actions={actions}
              isSidebarExpanded={isSidebarExpanded}
              enableDropdown={true}
              dropdownThreshold={1}
              spacing="md"
            />
          </div>
        </div>
      </CardHeader>
    </Card>
  )
})

ApplicationActions.displayName = 'ApplicationActions'
