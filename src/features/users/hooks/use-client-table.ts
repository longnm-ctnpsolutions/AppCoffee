import * as React from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { User } from "../types/user.types";
import { useUserTableColumns } from "../components/user-list/user-table-columns";

export function useUserTable(
    users: User[],
    handleDeleteRow: (id: string) => Promise<void>,
    stablePaginationData: any,
    tableState: any, // This contains the state values
    tableSetters: any, // This contains the setter functions
    setRowSelection: (selection: any) => void,
    setPagination: (updater: any) => void,
    setStablePaginationData: (updater: any) => void,
    originalData?: User[]
) {
    const {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
        pagination,
    } = tableState;

    const { setSorting, setColumnFilters, setColumnVisibility } = tableSetters;

    // ✅ FIX: Memoize columns để tránh recreate table
    // const columns = React.useMemo(
    //     () => createUserTableColumns(handleDeleteRow, originalData),
    //     [handleDeleteRow, originalData]
    // );

    const columns = useUserTableColumns(handleDeleteRow, originalData)

    const handlePaginationChange = React.useCallback(
        (updater: any) => {
            setPagination((prev: any) => {
                const newPagination =
                    typeof updater === "function" ? updater(prev) : updater;

                setStablePaginationData((current: any) => ({
                    ...current,
                    currentPage: newPagination.pageIndex,
                    pageSize: newPagination.pageSize,
                }));

                if (
                    prev.pageIndex !== newPagination.pageIndex ||
                    prev.pageSize !== newPagination.pageSize
                ) {
                    setRowSelection({});
                }

                return newPagination;
            });
        },
        [setPagination, setStablePaginationData, setRowSelection]
    );

    const table = useReactTable({
        data: users,
        columns, // ✅ FIX: Sử dụng memoized columns
        pageCount: Math.ceil(
            stablePaginationData.totalCount / stablePaginationData.pageSize
        ),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: handlePaginationChange,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        autoResetPageIndex: false,
        getRowId: (row) => row.id,
        meta: {
            setPageIndex: (pageIndex: number) => {
                setPagination((prev: any) => {
                    const newPagination = { ...prev, pageIndex };
                    setStablePaginationData((current: any) => ({
                        ...current,
                        currentPage: pageIndex,
                    }));
                    if (prev.pageIndex !== pageIndex) {
                        setRowSelection({});
                    }
                    return newPagination;
                });
            },
            setPageSize: (pageSize: number) => {
                setPagination((prev: any) => {
                    const newPagination = { ...prev, pageSize, pageIndex: 0 };
                    setStablePaginationData((current: any) => ({
                        ...current,
                        pageSize,
                        currentPage: 0,
                    }));
                    setRowSelection({});
                    return newPagination;
                });
            },
        },
    });

    const extendedTable = React.useMemo(
        () => ({
            ...table,
            setPageIndex: (pageIndex: number) => {
                setPagination((prev: any) => {
                    const newPagination = { ...prev, pageIndex };
                    setStablePaginationData((current: any) => ({
                        ...current,
                        currentPage: pageIndex,
                    }));
                    if (prev.pageIndex !== pageIndex) {
                        setRowSelection({});
                    }
                    return newPagination;
                });
            },
            setPageSize: (pageSize: number) => {
                setPagination((prev: any) => {
                    const newPagination = { ...prev, pageSize, pageIndex: 0 };
                    setStablePaginationData((current: any) => ({
                        ...current,
                        pageSize,
                        currentPage: 0,
                    }));
                    setRowSelection({});
                    return newPagination;
                });
            },
            getFilteredRowModel: () => ({
                ...table.getFilteredRowModel(),
                rows: table.getFilteredRowModel().rows.map((row, index) => ({
                    ...row,
                    globalIndex:
                        stablePaginationData.currentPage *
                            stablePaginationData.pageSize +
                        index,
                })),
            }),
        }),
        [
            table,
            stablePaginationData,
            setPagination,
            setStablePaginationData,
            setRowSelection,
        ]
    );

    return { table, extendedTable };
}
