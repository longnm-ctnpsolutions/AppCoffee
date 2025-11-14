import * as React from "react"
import {
  useReactTable,
type PaginationState,
} from "@tanstack/react-table"
export function useStablePagination(
    isLoading: boolean,
    totalCount: number,
    pagination: PaginationState
  ) {
    const [isTableDataLoading, setIsTableDataLoading] = React.useState(false)
    const [stablePaginationData, setStablePaginationData] = React.useState({
      totalCount: 0,
      currentPage: 0,
      pageSize: 10
    })
  
    React.useEffect(() => {
      if (!isLoading) {
        setStablePaginationData({
          totalCount,
          currentPage: pagination.pageIndex,
          pageSize: pagination.pageSize
        })
        setIsTableDataLoading(false)
      } else {
        setIsTableDataLoading(true)
      }
    }, [isLoading, totalCount, pagination.pageIndex, pagination.pageSize])
  
    return { isTableDataLoading, stablePaginationData, setStablePaginationData }
  }