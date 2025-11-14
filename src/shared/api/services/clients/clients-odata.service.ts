import type { Client } from "@/features/clients/types/client.types";
import type { ODataResponse, TableState } from "@/types/odata.types";
import { ODataQueryBuilder } from "@/lib/odata-builder";
import { odataApiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export interface ClientsQueryResult {
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
}

export const getClientsWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<ClientsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();
        const filterConditions: string[] = [];

        // --- searchTerm global ---
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("name", searchTerm),
                ODataQueryBuilder.contains("description", searchTerm),
            ].filter(Boolean);

            if (searchConditions.length > 0) {
                filterConditions.push(`(${searchConditions.join(" or ")})`);
            }
        }

        // --- column filters ---
        tableState.columnFilters.forEach((filter) => {
            const { id, value } = filter;

            if (value === undefined || value === null || value === "") return;

            // multi-select array
            if (Array.isArray(value)) {
                if (value.length === 0) return;

                // Nếu là status thì cast sang số
                if (id === "status") {
                    const nums = value
                        .map((v) => Number(v))
                        .filter((v) => !isNaN(v));
                    if (nums.length > 0) {
                        //filterConditions.push(ODataQueryBuilder.in(id, nums));
                        filterConditions.push(
                            ODataQueryBuilder.equalsOr(id, nums)
                        );
                    }
                } else {
                    //filterConditions.push(ODataQueryBuilder.in(id, value));
                    filterConditions.push(
                        ODataQueryBuilder.equalsOr(id, value)
                    );
                }
                return;
            }

            // single value
            switch (id) {
                case "name":
                    filterConditions.push(
                        ODataQueryBuilder.equals("name", value)
                    );
                    break;
                case "status":
                    filterConditions.push(
                        ODataQueryBuilder.equals("status", value)
                    );
                    break;
                case "description":
                    filterConditions.push(
                        ODataQueryBuilder.contains("description", value)
                    );
                    break;
                default:
                    filterConditions.push(
                        ODataQueryBuilder.contains(id, String(value))
                    );
                    break;
            }
        });

        if (filterConditions.length > 0) {
            queryBuilder.filter(filterConditions);
        }

        // --- sorting ---
        if (tableState.sorting.length > 0) {
            const sort = tableState.sorting[0];
            queryBuilder.orderBy(sort.id, sort.desc ? "desc" : "asc");
        } else {
            queryBuilder.orderBy("createdAt", "desc");
        }

        const skip =
            (tableState.pagination.pageIndex || 0) *
            (tableState.pagination.pageSize || 10);

        queryBuilder.skip(skip).top(tableState.pagination.pageSize || 10);
        // --- count ---
        queryBuilder.count(true);

        // --- build URL ---
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/clients${
            queryString ? `?${queryString}` : ""
        }`;

        // 🔄 Sử dụng odataApiCall thay vì fetch thủ công
        const data: ODataResponse<Client> = await odataApiCall<Client>(url);

        return {
            clients: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getClientsByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<ClientsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();

        if (field) {
            queryBuilder.select([field]);
        }

        if (field && searchTerm) {
            if (Array.isArray(searchTerm)) {
                //queryBuilder.filter([ODataQueryBuilder.in(field, searchTerm)]);
                queryBuilder.filter([
                    ODataQueryBuilder.equalsOr(field, searchTerm),
                ]);
            } else {
                queryBuilder.filter([
                    ODataQueryBuilder.equals(field, searchTerm),
                ]);
            }
        }

        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/clients${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Client> = await odataApiCall<Client>(url);

        return {
            clients: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const searchClientsByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<ClientsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();

        if (field) {
            queryBuilder.select([field]);
        }

        if (field && searchTerm) {
            queryBuilder.filter([
                ODataQueryBuilder.contains(field, searchTerm),
            ]);
        }

        // Xây dựng và gọi API
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/clients${
            queryString ? `?${queryString}` : ""
        }`;

        // 🔄 Sử dụng odataApiCall thay vì fetch thủ công
        const data: ODataResponse<Client> = await odataApiCall<Client>(url);

        return {
            clients: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};
