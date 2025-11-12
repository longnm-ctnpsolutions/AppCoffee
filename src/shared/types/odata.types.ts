export interface ODataResponse<T> {
  '@odata.context': string;
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: T[];
}

export interface TableState {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: Array<{
    id: string;
    desc: boolean;
  }>;
  columnFilters: Array<{
    id: string;
    value: any;
  }>;
  globalFilter: string;
}

export interface ODataQueryParams {
  $select?: string;
  $filter?: string;
  $orderby?: string;
  $skip?: number;
  $top?: number;
  $count?: boolean;
}