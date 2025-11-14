import type { Permission } from "@/types/permissions.types";
import type { ODataResponse, TableState } from "@/types/odata.types";
import { ODataQueryBuilder } from "@/lib/odata-builder";
import { odataApiCall } from '@/lib/response-handler';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export interface PermissionsQueryResult {
    permissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

export const getPermissionsWithOData = async (
    clientId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<PermissionsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();

        const filterConditions: string[] = [];

        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                // ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("name", searchTerm),
                ODataQueryBuilder.contains("description", searchTerm),
            ].filter(Boolean);

            if (searchConditions.length > 0) {
                filterConditions.push(`(${searchConditions.join(" or ")})`);
            }
        }

        // Xử lý columnFilters từ tableState
        tableState.columnFilters.forEach((filter) => {
            const { id, value } = filter;

            if (value === undefined || value === null || value === '') return;

            // multi-select array
            if (Array.isArray(value)) {
                if (value.length === 0) return;
                filterConditions.push(ODataQueryBuilder.equalsOr(id, value));
                return;
            }

            // single value
            switch (id) {
                case "name":
                    filterConditions.push(ODataQueryBuilder.contains("name", value));
                    break;
                case "description":
                    filterConditions.push(ODataQueryBuilder.contains("description", value));
                    break;
                default:
                    filterConditions.push(ODataQueryBuilder.contains(id, String(value)));
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
            queryBuilder.orderBy(sort.id, sort.desc ? "desc" : "asc");
        }

        // Xử lý pagination
        const skip =
            tableState.pagination.pageIndex * tableState.pagination.pageSize;
        queryBuilder.skip(skip).top(tableState.pagination.pageSize);

        // Thêm count
        queryBuilder.count(true);

        // Xây dựng và gọi API
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/clients/${clientId}/permissions/${
            queryString ? `?${queryString}` : ""
        }`;
        const data: ODataResponse<Permission> = await odataApiCall<Permission>(url);
        
            return {
              permissions: data.value || [],
              totalCount: data['@odata.count'] || data.value?.length || 0,
              hasMore: !!data['@odata.nextLink'],
            };
          } catch (error) {
            console.error('OData API call failed:', error);
            throw error;
          }
};

export const searchClientPermissionByFieldWithOData = async (
    field?: string,
    searchTerm?: string,
    clientId?: string
): Promise<PermissionsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();

        if (field) {
            queryBuilder.select([field]);
        }

        if (field && searchTerm) {
            if (Array.isArray(searchTerm)) {
                queryBuilder.filter([ODataQueryBuilder.equalsOr(field, searchTerm)]);
            } else {
                queryBuilder.filter([ODataQueryBuilder.equals(field, searchTerm)]);
            }
        }

        // Xây dựng và gọi API
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/clients/${clientId}/permissions/${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Permission> = await odataApiCall<Permission>(url);
        
        return {
              permissions: data.value || [],
              totalCount: data['@odata.count'] || data.value?.length || 0,
              hasMore: !!data['@odata.nextLink'],
            };
        } catch (error) {
            console.error('OData API call failed:', error);
            throw error;
        }
};
