"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/shared/hooks/use-toast";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { useTableState } from "@/hooks/use-state-table";
import { useStablePagination } from "@/shared/hooks/use-stable-pagination";

import type {
    BaseEntity,
    DashboardConfig,
    EntityActions,
    DashboardState,
} from "@/shared/types/dashboard.types";

export function useGenericDashboard<T extends BaseEntity>(
    entityActions: EntityActions<T>,
    config: DashboardConfig<T>
): DashboardState<T> {
    const { toast } = useToast();
    const { state: sidebarState } = useSidebar();

    // ✅ Table state management
    const tableState = useTableState();
    const {
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        columnVisibility,
        setColumnVisibility,
        rowSelection,
        setRowSelection,
        pagination,
        setPagination,
    } = tableState;

    // ✅ Pagination management
    const {
        isTableDataLoading,
        stablePaginationData,
        setStablePaginationData,
    } = useStablePagination(
        entityActions.isLoading,
        entityActions.totalCount,
        pagination
    );

    // ✅ UI state
    const [isAddDialogOpen, setAddDialogOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // ✅ Form management
    const form = useForm({
        resolver: zodResolver(config.formSchema),
        defaultValues: config.defaultFormValues,
    });

    // ✅ Memoized table state
    const memoizedTableState = React.useMemo(
        () => ({
            pagination,
            sorting,
            columnFilters,
            globalFilter: entityActions.searchTerm,
        }),
        [pagination, sorting, columnFilters, entityActions.searchTerm]
    );

    // ✅ Data fetching logic
    const hasInitialized = React.useRef(false);
    const lastTableStateRef = React.useRef<string>("");

    const [reload, setReload] = React.useState(0);

    React.useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            console.log(
                `🚀 ${config.entityName} Dashboard initialized, fetching initial data...`
            );
            entityActions.fetchEntities(memoizedTableState);
            return;
        }

        const tableStateForComparison = { pagination, sorting, columnFilters };
        const currentStateStr = JSON.stringify(tableStateForComparison);

        if (lastTableStateRef.current !== currentStateStr) {
            console.log(`📊 ${config.entityName} table state changed:`, {
                previous: lastTableStateRef.current,
                current: currentStateStr,
            });

            lastTableStateRef.current = currentStateStr;
            entityActions.fetchEntities(memoizedTableState);
        }

        if (reload > 0) {
            console.log(`🗑️ ${config.entityName} reload triggered by delete`);
            entityActions.fetchEntities(memoizedTableState);
            return;
        }
    }, [
        entityActions.fetchEntities,
        pagination,
        sorting,
        columnFilters,
        memoizedTableState,
        config.entityName,
        reload,
    ]);

    // ✅ CRUD handlers with generic error handling
    const handleAdd = React.useCallback(
        async (data: any) => {
            try {
                const success = await entityActions.addEntity(data);
                if (success) {
                    form.reset();
                    setAddDialogOpen(false);
                    toast({
                        title: "Success",
                        description: `${config.entityName.charAt(0).toUpperCase()}${config.entityName.slice(1)} added successfully.`,
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to add ${config.entityName}.`,
                    variant: "destructive",
                });
            }
        },
        [entityActions.addEntity, form, config.entityName, toast]
    );

    const handleDelete = React.useCallback(
        async (id: string) => {
            try {
                const success = await entityActions.removeEntity(id);
                if (success) {
                    toast({
                        title: "Success",
                        description: `${config.entityName.charAt(0).toUpperCase()}${config.entityName.slice(1)} deleted successfully.`,
                    });
                    setReload((prev) => prev + 1);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to delete ${config.entityName}.`,
                    variant: "destructive",
                });
            }
        },
        [entityActions.removeEntity, config.entityName, toast]
    );

    const handleDeleteMultiple = React.useCallback(
        async (ids: string[]) => {
            try {
                const success = await entityActions.removeMultipleEntities(ids);
                if (success) {
                    setRowSelection({});
                    toast({
                        title: "Success",
                        description: `${ids.length} ${config.entityNamePlural} deleted successfully.`,
                    });
                    setReload((prev) => prev + 1);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: `Failed to delete ${config.entityNamePlural}.`,
                    variant: "destructive",
                });
            }
        },
        [
            entityActions.removeMultipleEntities,
            setRowSelection,
            config.entityNamePlural,
            toast,
        ]
    );

    // ✅ Other handlers
    const handleRefreshData = React.useCallback(() => {
        console.log(`🔄 ${config.entityName} manual refresh triggered`);
        entityActions.fetchEntities(memoizedTableState);
    }, [entityActions.fetchEntities, memoizedTableState, config.entityName]);

    const handleSearchTermChange = React.useCallback(
        (newSearchTerm: string) => {
            console.log(
                `🔍 ${config.entityName} search term changing:`,
                newSearchTerm
            );
            entityActions.setSearchTerm(newSearchTerm);
        },
        [entityActions.setSearchTerm, config.entityName]
    );

    // ✅ Error handling
    React.useEffect(() => {
        if (entityActions.error) {
            toast({
                title: "An error occurred",
                description: entityActions.error,
                variant: "destructive",
            });
        }
    }, [entityActions.error, toast]);

    // ✅ Computed values
    const isEmpty = React.useMemo(
        () =>
            !entityActions.isLoading &&
            entityActions.entities.length === 0 &&
            entityActions.totalCount === 0,
        [
            entityActions.isLoading,
            entityActions.entities.length,
            entityActions.totalCount,
        ]
    );

    return {
        // Data
        entities: entityActions.entities,
        isLoading: isTableDataLoading,
        isActionLoading: entityActions.isActionLoading,
        totalCount: entityActions.totalCount,
        searchTerm: entityActions.searchTerm,
        isSearching: entityActions.isSearching,

        // State
        tableState,
        stablePaginationData,
        setStablePaginationData,
        isAddDialogOpen,
        setAddDialogOpen,
        isMounted,
        isSidebarExpanded: sidebarState === "expanded",
        form,

        // Handlers
        handleAdd,
        handleDelete,
        handleDeleteMultiple,
        handleRefreshData,
        handleSearchTermChange,

        // Computed
        isEmpty,
    };
}
