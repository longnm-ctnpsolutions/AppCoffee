import type { AuditLog } from "@/features/audit-logs/types/audit-log.types";
import type { ODataResponse, TableState } from "@/types/odata.types";
import { ODataQueryBuilder } from "@/lib/odata-builder";
import { odataApiCall } from "@/lib/response-handler";
import { usePermissions } from "@/shared/context/auth-context";
import React from "react";
import { CORE_PERMISSIONS } from "@/shared/types/auth.types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

export interface AuditLogsQueryResult {
    auditLogs: AuditLog[];
    totalCount: number;
    hasMore: boolean;
}

export const getAuditLogsWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<AuditLogsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();
        const filterConditions: string[] = [];

        // --- searchTerm global ---
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("action", searchTerm),
                ODataQueryBuilder.contains("actorName", searchTerm),
            ].filter(Boolean);

            if (searchConditions.length > 0) {
                filterConditions.push(`(${searchConditions.join(" or ")})`);
            }
        }

        // --- column filters ---
        tableState.columnFilters.forEach((filter) => {
            const { id, value } = filter;

            if (value === undefined || value === null || value === "") return;

            if (id === "timestamp") {
                const timestampValue = value as {
                    from?: string | Date;
                    to?: string | Date;
                };
                const { from, to } = timestampValue;

                if (from && to) {
                    const fromIso = new Date(from)
                        .toISOString()
                        .replace(".000", "");
                    const toIso = new Date(to)
                        .toISOString()
                        .replace(".000", "");
                    filterConditions.push(
                        `(timestamp ge ${fromIso} and timestamp le ${toIso})`
                    );
                } else if (from) {
                    const fromIso = new Date(from)
                        .toISOString()
                        .replace(".000", "");
                    filterConditions.push(`(timestamp ge ${fromIso})`);
                } else if (to) {
                    const toIso = new Date(to)
                        .toISOString()
                        .replace(".000", "");
                    filterConditions.push(`(timestamp le ${toIso})`);
                }
                return;
            }

            if (Array.isArray(value)) {
                if (value.length === 0) return;

                if (id === "result") {
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

            switch (id) {
                case "action":
                    filterConditions.push(
                        ODataQueryBuilder.equals("action", value)
                    );
                    break;
                case "result":
                    filterConditions.push(
                        ODataQueryBuilder.equals("result", value)
                    );
                    break;
                case "actorName":
                    filterConditions.push(
                        ODataQueryBuilder.contains("actorName", value)
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

        const skip =
            (tableState.pagination.pageIndex || 0) *
            (tableState.pagination.pageSize || 10);

        queryBuilder.skip(skip).top(tableState.pagination.pageSize || 10);
        // --- count ---
        queryBuilder.count(true);

        const queryString = queryBuilder.build();
        const url = `${API_BASE_URL}/audit-logs${
            queryString ? `?${queryString}` : ""
        }`;

        // 🔄 Fetch dữ liệu qua OData
        const data: ODataResponse<AuditLog> = await odataApiCall<AuditLog>(url);

        return {
            auditLogs: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};

export const getAuditLogsMeWithOData = async (
    tableState: TableState,
    searchTerm?: string
): Promise<AuditLogsQueryResult> => {
    try {
        const queryBuilder = new ODataQueryBuilder();
        const filterConditions: string[] = [];

        // --- searchTerm global ---
        if (searchTerm && searchTerm.trim()) {
            const searchConditions = [
                ODataQueryBuilder.equals("id", searchTerm),
                ODataQueryBuilder.contains("action", searchTerm),
                ODataQueryBuilder.contains("actorName", searchTerm),
            ].filter(Boolean);

            if (searchConditions.length > 0) {
                filterConditions.push(`(${searchConditions.join(" or ")})`);
            }
        }

        // --- column filters ---
        tableState.columnFilters.forEach((filter) => {
            const { id, value } = filter;

            if (value === undefined || value === null || value === "") return;

            if (id === "timestamp") {
    const timestampValue = value as
        | { from?: string | Date; to?: string | Date }
        | string
        | Date
        | (string | Date)[];

    const conditions: string[] = [];

    // 🔹 1️⃣ Nếu là mảng nhiều timestamp cụ thể
    if (Array.isArray(timestampValue)) {
        timestampValue.forEach((v) => {
            const base = new Date(v);
            const fromIso = new Date(base.getTime() - 1000).toISOString();
            const toIso = new Date(base.getTime() + 1000).toISOString();
            conditions.push(`(timestamp ge ${fromIso} and timestamp le ${toIso})`);
        });
    }

    // 🔹 2️⃣ Nếu là object { from, to }
    if (
        typeof timestampValue === "object" &&
        !Array.isArray(timestampValue) &&
        ("from" in timestampValue || "to" in timestampValue)
    ) {
        const { from, to } = timestampValue as { from?: string | Date; to?: string | Date };
        if (from && to) {
            const fromIso = new Date(from).toISOString();
            const toIso = new Date(to).toISOString();
            conditions.push(`(timestamp ge ${fromIso} and timestamp le ${toIso})`);
        } else if (from) {
            const fromIso = new Date(from).toISOString();
            conditions.push(`(timestamp ge ${fromIso})`);
        } else if (to) {
            const toIso = new Date(to).toISOString();
            conditions.push(`(timestamp le ${toIso})`);
        }
    }

    // 🔹 3️⃣ Nếu là 1 timestamp đơn lẻ
    if (
        typeof timestampValue === "string" ||
        timestampValue instanceof Date
    ) {
        const base = new Date(timestampValue as any);
        const fromIso = new Date(base.getTime() - 1000).toISOString();
        const toIso = new Date(base.getTime() + 1000).toISOString();
        conditions.push(`(timestamp ge ${fromIso} and timestamp le ${toIso})`);
    }

    // 🔹 Kết hợp tất cả bằng OR
    if (conditions.length > 0) {
        filterConditions.push(`(${conditions.join(" or ")})`);
    }

    return;
}


            if (Array.isArray(value)) {
                if (value.length === 0) return;

                if (id === "result") {
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

            switch (id) {
                case "action":
                    filterConditions.push(
                        ODataQueryBuilder.equals("action", value)
                    );
                    break;
                case "result":
                    filterConditions.push(
                        ODataQueryBuilder.equals("result", value)
                    );
                    break;
                case "actorName":
                    filterConditions.push(
                        ODataQueryBuilder.contains("actorName", value)
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

        const skip =
            (tableState.pagination.pageIndex || 0) *
            (tableState.pagination.pageSize || 10);

        queryBuilder.skip(skip).top(tableState.pagination.pageSize || 10);
        // --- count ---
        queryBuilder.count(true);

        const queryString = queryBuilder.build();
        const me = `${API_BASE_URL}/audit-logs/me${
            queryString ? `?${queryString}` : ""
        }`;

        // 🔄 Fetch dữ liệu qua OData
        const data: ODataResponse<AuditLog> = await odataApiCall<AuditLog>(me);

        return {
            auditLogs: data.value || [],
            totalCount: data["@odata.count"] || data.value?.length || 0,
            hasMore: !!data["@odata.nextLink"],
        };
    } catch (error) {
        console.error("OData API call failed:", error);
        throw error;
    }
};
