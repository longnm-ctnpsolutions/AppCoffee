"use client";

import { useMemo, memo, useEffect } from "react";
import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface TablePaginationProps<T> {
    table: Table<T>;
    pageSizeOptions?: number[];
    totalCount?: number; // ✅ Support for server-side pagination with OData
    isTableLoading?: boolean; // ✅ Loading state support
}

// ✅ MEMOIZED PAGE SIZE CONTROLS - chỉ re-render khi pageSize hoặc handler thay đổi
// PageSizeControls.tsx
const PageSizeControls = memo(({
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    totalCount,
    isShowingAll = false
}: {
    pageSize: number;
    pageSizeOptions: (number | "all")[];
    onPageSizeChange: (size: number) => void;
    totalCount?: number;
    isShowingAll?: boolean;
}) => {
    return (
        <div className="flex items-center gap-4 text-muted-foreground">
            {pageSizeOptions.map((pageSizeOption) => {
                // const isAll = pageSizeOption === "all";
                // const value = isAll ? (totalCount ?? pageSize) : pageSizeOption;

                // const isSelected = isAll
                //     ? (totalCount !== undefined && pageSize === totalCount)
                //     : pageSize === value;

                // return (
                //     <Button
                //         key={pageSizeOption.toString()}
                //         variant={isSelected ? "default" : "ghost"}
                //         onClick={() => onPageSizeChange(value)}
                //         className={cn("h-8 w-8 p-0", isSelected ? "rounded-full" : "")}
                //     >
                //         {isAll ? "All" : pageSizeOption}
                //     </Button>
                // );

                const isAll = pageSizeOption === "all";
                const value = isAll ? (totalCount ?? pageSize) : pageSizeOption;

                // Fix logic này
                const isSelected = isAll
                    ? isShowingAll
                    : (pageSize === value && !isShowingAll);

                return (
                    <Button
                        key={pageSizeOption.toString()}
                        variant={isSelected ? "default" : "ghost"}
                        onClick={() => onPageSizeChange(value)}
                        className={cn("h-8 w-8 p-0", isSelected ? "rounded-full" : "")}
                    >
                        {isAll ? "All" : pageSizeOption}
                    </Button>
                );
            })}
        </div>
    );
});

// ✅ MEMOIZED PAGINATION INFO - chỉ re-render khi pagination data thay đổi
const PaginationInfo = memo(({
    currentPage,
    totalPages,
    totalCount
}: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
}) => {
    if (totalCount === 0) {
        return <span className="text-muted-foreground hidden sm:block">No items</span>;
    }

    return (
        <div className="text-muted-foreground hidden sm:block">
            Page {currentPage + 1} of {totalPages} ({totalCount} items)
        </div>
    );
});
PaginationInfo.displayName = "PaginationInfo";

// ✅ MEMOIZED PAGE NUMBERS - chỉ re-render khi currentPage hoặc totalPages thay đổi
const PageNumbers = memo(({
    currentPage,
    totalPages,
    onPageChange
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (pageIndex: number) => void;
}) => {
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pages.push(0, 1, 2, 3, -1, totalPages - 1);
            } else if (currentPage >= totalPages - 3) {
                pages.push(0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
            } else {
                pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1);
            }
        }

        return pages;
    }, [currentPage, totalPages]);

    return (
        <>
            {pageNumbers.map((pageIndex, index) => {
                if (pageIndex === -1) {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    );
                }

                return (
                    <Button
                        key={pageIndex}
                        variant={currentPage === pageIndex ? "default" : "ghost"}
                        className={cn(
                            "h-8 w-8 p-0",
                            currentPage === pageIndex ? "rounded-full" : ""
                        )}
                        onClick={() => onPageChange(pageIndex)}
                        aria-label={`Go to page ${pageIndex + 1}`}
                    >
                        {pageIndex + 1}
                    </Button>
                );
            })}
        </>
    );
});
PageNumbers.displayName = "PageNumbers";

// ✅ MEMOIZED NAVIGATION CONTROLS - chỉ re-render khi navigation state thay đổi
const NavigationControls = memo(({
    currentPage,
    totalPages,
    canPreviousPage,
    canNextPage,
    onPageChange,
    onPreviousPage,
    onNextPage
}: {
    currentPage: number;
    totalPages: number;
    canPreviousPage: boolean;
    canNextPage: boolean;
    onPageChange: (pageIndex: number) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}) => {
    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onPreviousPage}
                disabled={!canPreviousPage}
                aria-label="Go to previous page"
                title="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <PageNumbers
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onNextPage}
                disabled={!canNextPage}
                aria-label="Go to next page"
                title="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </>
    );
});
NavigationControls.displayName = "NavigationControls";

export function TablePagination<T>({
    table,
    pageSizeOptions = [5, 10, 20],   // mặc định
    totalCount,
    isTableLoading = false
}: TablePaginationProps<T>) {
    const currentPage = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;

    const actualTotalCount = totalCount ?? table.getFilteredRowModel().rows.length;
    const totalPages = totalCount
        ? Math.ceil(totalCount / pageSize)
        : table.getPageCount();

    useEffect(() => {
        if (totalPages > 0 && currentPage >= totalPages) {
            table.setPageIndex(totalPages - 1);
        }
    }, [totalPages, currentPage, table]);

    // 👉 Nếu chọn All thì set pageSize = actualTotalCount
    const handlePageSizeChange = useMemo(() => (newPageSize: number | "all") => {
        if (newPageSize === "all") {
            table.setPageSize(actualTotalCount);
        } else {
            table.setPageSize(newPageSize);
        }
    }, [table, actualTotalCount]);

    const handlePageChange = useMemo(() => (pageIndex: number) => {
        table.setPageIndex(pageIndex);
    }, [table]);

    const handlePreviousPage = useMemo(() => () => {
        table.previousPage();
    }, [table]);

    const handleNextPage = useMemo(() => () => {
        table.nextPage();
    }, [table]);

    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();

    if (totalPages === 0) {
        return (
            <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                No data available
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-between p-2 text-sm transition-opacity duration-200 ${isTableLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
            }`}>
            {/* ✅ Page size controls */}
            <PageSizeControls
                pageSize={pageSize}
                pageSizeOptions={[...pageSizeOptions, "all"]}
                onPageSizeChange={handlePageSizeChange}
                totalCount={actualTotalCount}   // ✅ truyền actualTotalCount
            />

            <div className="flex items-center gap-4">
                <PaginationInfo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={actualTotalCount}
                />

                <div className="flex items-center gap-1">
                    <NavigationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        canPreviousPage={canPreviousPage}
                        canNextPage={canNextPage}
                        onPageChange={handlePageChange}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage}
                    />
                </div>
            </div>
        </div>
    );
}
