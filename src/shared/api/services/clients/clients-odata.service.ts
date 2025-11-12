import type { Client } from '@/features/clients/types/client.types';
import type { ODataResponse, TableState } from '@/types/odata.types';
import { ODataQueryBuilder } from '@/lib/odata-builder';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.identity.dev.ctnp.com';

export interface ClientsQueryResult {
  clients: Client[];
  totalCount: number;
  hasMore: boolean;
}

export const getClientsWithOData = async (
  tableState: TableState,
  searchTerm?: string,
): Promise<ClientsQueryResult> => {
  try {
    const queryBuilder = new ODataQueryBuilder();

    const filterConditions: string[] = [];

    // Xử lý searchTerm
    if (searchTerm && searchTerm.trim()) {
      const searchConditions = [
        ODataQueryBuilder.equals('id', searchTerm),
        ODataQueryBuilder.contains('name', searchTerm),
        ODataQueryBuilder.contains('description', searchTerm),
      ].filter(Boolean);

      if (searchConditions.length > 0) {
        filterConditions.push(`(${searchConditions.join(' or ')})`);
      }
    }

    // Xử lý columnFilters từ tableState
    tableState.columnFilters.forEach(filter => {
      switch (filter.id) {
        case 'name':
          if (filter.value) {
            filterConditions.push(ODataQueryBuilder.contains('name', filter.value));
          }
          break;
        case 'status':
          if (filter.value !== undefined && filter.value !== '') {
            filterConditions.push(ODataQueryBuilder.equals('status', filter.value));
          }
          break;
        case 'description':
          if (filter.value) {
            filterConditions.push(ODataQueryBuilder.contains('description', filter.value));
          }
          break;
      }
    });

    // Kết hợp tất cả filterConditions
    if (filterConditions.length > 0) {
      queryBuilder.filter(filterConditions);
    }

    // Xử lý sorting
    if (tableState.sorting.length > 0) {
      const sort = tableState.sorting[0];
      queryBuilder.orderBy(sort.id, sort.desc ? 'desc' : 'asc');
    }

    // Xử lý pagination
    const skip = tableState.pagination.pageIndex * tableState.pagination.pageSize;
    queryBuilder.skip(skip).top(tableState.pagination.pageSize);

    // Thêm count
    queryBuilder.count(true);

    // Xây dựng và gọi API
    const queryString = queryBuilder.build();
    const url = `${API_BASE_URL}/clients${queryString ? `?${queryString}` : ''}`;

    console.log('OData URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ODataResponse<Client> = await response.json();

    return {
      clients: data.value || [],
      totalCount: data['@odata.count'] || data.value?.length || 0,
      hasMore: !!data['@odata.nextLink'],
    };

  } catch (error) {
    console.error('OData API call failed:', error);
    throw error;
  }
};