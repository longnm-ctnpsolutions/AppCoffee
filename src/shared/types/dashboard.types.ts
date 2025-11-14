import * as z from "zod"

export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface DashboardConfig<T extends BaseEntity> {
  entityName: string
  entityNamePlural: string
  formSchema: z.ZodSchema<any>
  defaultFormValues: any
  emptyState: {
    title: string
    description: string
    actionLabel: string
  }
}

export interface EntityActions<T extends BaseEntity> {
  // Data properties - GENERIC
  entities: T[]  // Changed from clients to entities
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  searchTerm: string
  isSearching: boolean
  
  // Action methods - GENERIC 
  setSearchTerm: (term: string) => void
  clearSearch: () => void
  fetchEntities: (state: any) => void  // Generic method name
  addEntity: (data: any) => Promise<boolean>  // Generic method name
  removeEntity: (id: string) => Promise<boolean>  // Generic method name
  removeMultipleEntities: (ids: string[]) => Promise<boolean>  // Generic method name
}

export interface DashboardState<T extends BaseEntity> {
  // Data
  entities: T[]
  isLoading: boolean
  isActionLoading: boolean
  totalCount: number
  searchTerm: string
  isSearching: boolean
  
  // State
  tableState: any
  stablePaginationData: any
  setStablePaginationData: (data: any) => void
  isAddDialogOpen: boolean
  setAddDialogOpen: (open: boolean) => void
  isMounted: boolean
  isSidebarExpanded: boolean
  form: any
  
  // Handlers
  handleAdd: (data: any) => Promise<void>
  handleDelete: (id: string) => Promise<void>
  handleDeleteMultiple: (ids: string[]) => Promise<void>
  handleRefreshData: () => void
  handleSearchTermChange: (term: string) => void
  
  // Computed
  isEmpty: boolean
}
export interface ExpandableFieldConfig {
  key: string
  label: string
  alwaysShow?: boolean // Always show in expanded row regardless of responsive state
  renderValue?: (value: any) => React.ReactNode // Custom renderer
  hideAt?: 'sm' | 'md' | 'lg' | 'xl' // Only hide when this column is hidden due to responsive
}

export interface UseExpandableTableConfig<T> {
  data: T[]
  getRowId: (item: T) => string
  expandableFields: ExpandableFieldConfig[]
  visibleColumns: string[]
}