import type { Role, RoleUser } from "@/features/roles/types/role.types";
import type { ODataResponse, TableState } from "@/types/odata.types";
import { ODataQueryBuilder } from "@/lib/odata-builder";
import type { Permission } from "@/types/permissions.types";
import { odataApiCall } from "@/lib/response-handler";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export interface RolesQueryResult {
    roles: Role[];
    totalCount: number;
    hasMore: boolean;
}

export interface RoleUsersQueryResult {
    roles: RoleUser[];
    totalCount: number;
    hasMore: boolean;
}

export interface RolePermissionsQueryResult {
    rolePermissions: Permission[];
    totalCount: number;
    hasMore: boolean;
}

export const getRolesWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<RolesQueryResult> => {
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
                        filterConditions.push(
                            ODataQueryBuilder.equalsOr(id, nums)
                        );
                    }
                } else {
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
                        ODataQueryBuilder.contains("name", value)
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
        const url = `${API_BASE_URL}/roles${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Role> = await odataApiCall<Role>(url);

        return {
            roles: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getRolesByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<RolesQueryResult> => {
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
        const url = `${API_BASE_URL}/roles${
            queryString ? `?${queryString}` : ""
        }`;
        const data: ODataResponse<Role> = await odataApiCall<Role>(url);

        return {
            roles: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const searchRolesByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<RolesQueryResult> => {
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
        const url = `${API_BASE_URL}/roles${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Role> = await odataApiCall<Role>(url);

        return {
            roles: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getRoleUsersWithOData = async (
    roleId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<RoleUsersQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();
        const filterConditions: string[] = [];

        // --- searchTerm global ---
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("email", searchTerm),
                ODataQueryBuilder.contains("connection", searchTerm),
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
                case "email":
                    filterConditions.push(
                        ODataQueryBuilder.contains("email", value)
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
        const url = `${API_BASE_URL}/roles/${roleId}/users${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<RoleUser> = await odataApiCall<RoleUser>(url);

        return {
            roles: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getRolePermissionsWithOData = async (
    roleId: string,
    tableState: TableState,
    searchTerm?: string
): Promise<RolePermissionsQueryResult> => {
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
        const url = `${API_BASE_URL}/roles/${roleId}/permissions${
            queryString ? `?${queryString}` : ""
        }`;

        const data: ODataResponse<Permission> = await odataApiCall<Permission>(
            url
        );

        return {
            rolePermissions: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};
