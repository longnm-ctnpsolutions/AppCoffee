import { User, UserRole } from "@/features/users/types/user.types";
import { ODataQueryBuilder } from "@/shared/lib/odata-builder";
import { ODataResponse, TableState } from "@/shared/types/odata.types";
import { Permission } from "@/shared/types/permissions.types";
import { odataApiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export interface UsersQueryResult {
    users: User[];
    totalCount: number;
    hasMore: boolean;
}

export interface UserPermissionsQueryResult {
    userPermissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

export interface UserRolesQueryResult {
    users: UserRole[];
    totalCount: number;
    hasMore: boolean;
}

export const getUsersWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<UsersQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();
        const filterConditions: string[] = [];

        // --- searchTerm global ---
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("email", searchTerm),
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

                // Nếu là lockoutEnabled thì cast sang boolean
                if (id === "lockoutEnabled") {
                    const bools = value.map((v) => v === "true" || v === true);
                    filterConditions.push(
                        ODataQueryBuilder.equalsOr(id, bools)
                    );
                } else {
                    filterConditions.push(
                        ODataQueryBuilder.equalsOr(id, value)
                    );
                }
                return;
            }

            // single value
            switch (id) {
                case "email":
                    filterConditions.push(
                        ODataQueryBuilder.contains("email", value)
                    );
                    break;
                case "lockoutEnabled":
                    filterConditions.push(
                        ODataQueryBuilder.equals("lockoutEnabled", value)
                    );
                    break;
                case "connection":
                    filterConditions.push(
                        ODataQueryBuilder.contains("connection", value)
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
        const url = `${API_BASE_URL}/users${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<User> = await odataApiCall<User>(url);

        return {
            users: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getUsersByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<UsersQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();

        if (field) {
            queryBuilder.select([field]);
        }

        if (field && searchTerm) {
            if (Array.isArray(searchTerm)) {
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
        const url = `${API_BASE_URL}/users${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<User> = await odataApiCall<User>(url);

        return {
            users: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const searchUsersByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<UsersQueryResult> => {
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
        const url = `${API_BASE_URL}/users${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<User> = await odataApiCall<User>(url);

        return {
            users: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getUserPermissionsWithOData = async (
    userId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<UserPermissionsQueryResult> => {
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
                filterConditions.push(ODataQueryBuilder.equalsOr(id, value));
                return;
            }

            // single value
            switch (id) {
                case "name":
                    filterConditions.push(
                        ODataQueryBuilder.contains("name", value)
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
        }

        const hasAnyFilter =
            filterConditions.length > 0 || (searchTerm && searchTerm.trim());
        // --- pagination ---
        const skip = hasAnyFilter
            ? 0 // Reset to first page when filtering
            : (tableState.pagination.pageIndex || 0) *
              (tableState.pagination.pageSize || 10);

        queryBuilder.skip(skip).top(tableState.pagination.pageSize || 10);

        // --- count ---
        queryBuilder.count(true);

        // --- build URL ---
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/users/${userId}/permissions${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Permission> = await odataApiCall<Permission>(
            url
        );

        return {
            userPermissions: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getUserRolesWithOData = async (
    userId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<UserRolesQueryResult> => {
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
                filterConditions.push(ODataQueryBuilder.equalsOr(id, value));
                return;
            }

            // single value
            switch (id) {
                case "name":
                    filterConditions.push(
                        ODataQueryBuilder.contains("name", value)
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
        }

        const hasAnyFilter =
            filterConditions.length > 0 || (searchTerm && searchTerm.trim());
        // --- pagination ---
        const skip = hasAnyFilter
            ? 0 // Reset to first page when filtering
            : (tableState.pagination.pageIndex || 0) *
              (tableState.pagination.pageSize || 10);

        queryBuilder.skip(skip).top(tableState.pagination.pageSize || 10);

        // --- count ---
        queryBuilder.count(true);

        // --- build URL ---
        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/users/${userId}/roles${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<UserRole> = await odataApiCall<UserRole>(url);

        return {
            users: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};
