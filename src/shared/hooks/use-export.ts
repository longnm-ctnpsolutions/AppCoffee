"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

// Export formats
export type ExportFormat = "excel" | "csv" | "pdf" | "json";

// Export scope
export type ExportScope = "all" | "selected" | "visible" | "filtered";

// Export options
export interface ExportOptions {
    format: ExportFormat;
    scope: ExportScope;
    filename?: string;
    includeHeaders?: boolean;
    selectedColumns?: string[];
    customHeaders?: Record<string, string>;
    // PDF specific options
    pdfOptions?: {
        orientation?: "portrait" | "landscape";
        title?: string;
        subtitle?: string;
        pageSize?: "a4" | "a3" | "letter";
        headerStyle?: {
            fontStyle?: string;
            lineWidth?: number;
        };
    };
    // Excel specific options
    excelOptions?: {
        sheetName?: string;
        addTimestamp?: boolean;
        headerStyle?: {
            font?: { bold?: boolean };
            border?: {
                top?: { style: string; color?: { auto?: number } };
                bottom?: { style: string; color?: { auto?: number } };
                left?: { style: string; color?: { auto?: number } };
                right?: { style: string; color?: { auto?: number } };
            };
        };
    };
}

// Hook interface
export interface UseUniversalExportReturn {
    exportData: (options: ExportOptions) => Promise<void>;
    isExporting: boolean;
    error: string | null;
}

// Main hook
export function useUniversalExport<T extends Record<string, any>>(
    table: Table<T>,
    data?: T[] // Optional external data source
): UseUniversalExportReturn {
    const [isExporting, setIsExporting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Get data based on scope
    const getDataByScope = React.useCallback(
        (scope: ExportScope): T[] => {
            let rawData: T[] = [];

            switch (scope) {
                case "all":
                    rawData =
                        data ||
                        table.getCoreRowModel().rows.map((row) => row.original);
                    break;
                case "selected":
                    rawData = table
                        .getSelectedRowModel()
                        .rows.map((row) => row.original);
                    break;
                case "visible":
                    rawData = table
                        .getRowModel()
                        .rows.map((row) => row.original);
                    break;
                case "filtered":
                    rawData = table
                        .getFilteredRowModel()
                        .rows.map((row) => row.original);
                    break;
                default:
                    rawData =
                        data ||
                        table.getCoreRowModel().rows.map((row) => row.original);
                    break;
            }

            // 🔥 Format lại status cho mọi scope
            return rawData.map((item) => ({
                id: item.id, // export có id
                ...item,
                status: item.status === 1 ? "Active" : "Inactive",
            }));
        },
        [table, data]
    );
    // Get columns based on selection
    const getColumns = React.useCallback(
        (selectedColumns?: string[]) => {
            const allColumns = table
                .getAllColumns()
                .filter((col) => col.getCanHide() !== false);

            if (selectedColumns) {
                return allColumns.filter((col) =>
                    selectedColumns.includes(col.id)
                );
            }

            return allColumns.filter((col) => col.getIsVisible());
        },
        [table]
    );

    // Format data for export
    const formatDataForExport = React.useCallback(
        (
            exportData: T[],
            columns: any[],
            customHeaders?: Record<string, string>,
            format?: ExportFormat
        ) => {
            return exportData.map((row) => {
                const formattedRow: Record<string, any> = {};

                columns.forEach((column) => {
                    let header =
                        customHeaders?.[column.id] ||
                        (typeof column.columnDef.header === "string"
                            ? column.columnDef.header
                            : column.id);

                    // For CSV, uppercase headers for visual distinction
                    if (format === "csv") {
                        header = header.toUpperCase();
                    }

                    let value = row[column.id];

                    // Handle special formatting
                    if (value === null || value === undefined) {
                        value = "";
                    } else if (typeof value === "object") {
                        value = JSON.stringify(value);
                    } else if (typeof value === "boolean") {
                        value = value ? "Inactive" : "Active";
                    }

                    formattedRow[header] = value;
                });

                return formattedRow;
            });
        },
        []
    );

    // Export to Excel
    const exportToExcel = React.useCallback(
        async (
            exportData: any[],
            filename: string,
            options?: ExportOptions["excelOptions"]
        ) => {
            try {
                if (!exportData.length) {
                    throw new Error("Không có dữ liệu để xuất Excel");
                }

                // 👉 Sort trước theo timestamp (mới nhất trước)
                const sortedData = [...exportData].sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );

                // 👉 Sau đó format theo timezone browser + dd/MM/yyyy HH:mm:ss
                const localizedData = sortedData.map((item) => {
                    const newItem = { ...item };
                    if (newItem.timestamp) {
                        try {
                            const date = new Date(newItem.timestamp);

                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(
                                2,
                                "0"
                            );
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(
                                2,
                                "0"
                            );
                            const minutes = String(date.getMinutes()).padStart(
                                2,
                                "0"
                            );
                            const seconds = String(date.getSeconds()).padStart(
                                2,
                                "0"
                            );

                            newItem.timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                        } catch {
                            newItem.timestamp = newItem.timestamp;
                        }
                    }
                    return newItem;
                });

                const worksheet = XLSX.utils.json_to_sheet(localizedData);

                if (localizedData[0]) {
                    const headers = Object.keys(localizedData[0]);
                    worksheet["!cols"] = headers.map((h) => {
                        if (h.toLowerCase() === "description")
                            return { wch: 100 };
                        if (h.toLowerCase() === "id") return { wch: 40 };
                        return { wch: 30 };
                    });

                    const range = XLSX.utils.encode_range({
                        s: { r: 0, c: 0 },
                        e: { r: 0, c: headers.length - 1 },
                    });
                    worksheet["!autofilter"] = { ref: range };

                    for (let col = 0; col < headers.length; col++) {
                        const cellAddress = XLSX.utils.encode_cell({
                            r: 0,
                            c: col,
                        });
                        if (worksheet[cellAddress]) {
                            worksheet[cellAddress].s = {
                                font: {
                                    name: "Arial",
                                    bold:
                                        options?.headerStyle?.font?.bold ||
                                        false,
                                },
                                alignment: {
                                    wrapText: true,
                                    vertical: "center",
                                    horizontal: "center",
                                },
                            };
                        }
                    }

                    const dataRange = XLSX.utils.decode_range(
                        worksheet["!ref"]!
                    );
                    for (let R = 1; R <= dataRange.e.r; ++R) {
                        for (let C = 0; C <= dataRange.e.c; ++C) {
                            const cellAddress = XLSX.utils.encode_cell({
                                r: R,
                                c: C,
                            });
                            const cell = worksheet[cellAddress];
                            if (cell) {
                                cell.s = {
                                    alignment: {
                                        wrapText: true,
                                        vertical: "top",
                                    },
                                };
                            }
                        }
                    }
                }

                const workbook = XLSX.utils.book_new();
                const sheetName = options?.sheetName || "Data";
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

                if (options?.addTimestamp) {
                    const timestamp = new Date()
                        .toISOString()
                        .replace(/[:.]/g, "-");
                    filename = `${filename}_${timestamp}`;
                }

                XLSX.writeFile(workbook, `${filename}.xlsx`, {
                    bookType: "xlsx",
                    cellStyles: true,
                });
            } catch (err) {
                console.error("Excel export error:", err);
                throw new Error(`Xuất Excel thất bại: ${err}`);
            }
        },
        []
    );
    // Export to CSV
    const exportToCSV = React.useCallback(
        async (exportData: any[], filename: string) => {
            try {
                if (!exportData.length) {
                    throw new Error("Không có dữ liệu để xuất CSV");
                }

                // ✅ Sort theo timestamp mới nhất
                const sortedData = [...exportData].sort(
                    (a, b) =>
                        new Date(b.TIMESTAMP).getTime() - new Date(a.TIMESTAMP).getTime()
                );

                // ✅ Format timestamp sang giờ Việt Nam theo dd/MM/yyyy HH:mm:ss
                const localizedData = sortedData.map((item) => {
                    const newItem = { ...item };
                    console.log("Raw item:", item);
                    if (newItem.TIMESTAMP) {

                        const localDate = new Date(newItem.TIMESTAMP);

                        const pad = (n: number) => n.toString().padStart(2, "0");
                        const formatted = `${pad(localDate.getDate())}/${pad(localDate.getMonth() + 1)}/${localDate.getFullYear()} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;

                        newItem.TIMESTAMP = formatted;
                    }

                    return newItem;
                });

                // ✅ Tạo CSV
                const headers = Object.keys(localizedData[0] || {});
                const rows = localizedData.map((item) =>
                    headers
                        .map((h) => {
                            let val = item[h] ?? "";
                            return `"${String(val).replace(/"/g, '""')}"`;
                        })
                        .join(",")
                );

                const csv = [headers.join(","), ...rows].join("\r\n");

                console.log("Check csv");

                // ✅ Xuất file CSV
                const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = `${filename}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                console.error("CSV export error:", err);
                throw new Error(`Xuất CSV thất bại: ${err}`);
            }
        },
        []
    );

    // Export to PDF
    const exportToPDF = async (
        exportData: any[],
        filename: string,
        options?: ExportOptions["pdfOptions"]
    ) => {
        try {
            if (!exportData.length) {
                throw new Error("Không có dữ liệu để xuất PDF");
            }
            const sortedData = [...exportData].sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            );

            const localizedData = sortedData.map((item) => {
                const newItem = { ...item };
                if (newItem.timestamp) {
                    try {
                        const date = new Date(newItem.timestamp);

                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                        );
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                            2,
                            "0"
                        );
                        const seconds = String(date.getSeconds()).padStart(
                            2,
                            "0"
                        );

                        newItem.timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                    } catch {
                        newItem.timestamp = newItem.timestamp;
                    }
                }
                return newItem;
            });

            const orientation = options?.orientation || "landscape";

            const doc = new jsPDF({
                orientation,
                unit: "mm",
                format: options?.pageSize || "a4",
            });

            // Add title
            if (options?.title) {
                doc.setFontSize(18);
                doc.text(options.title, 14, 20);
            }

            // Add subtitle
            if (options?.subtitle) {
                doc.setFontSize(12);
                doc.text(options.subtitle, 14, options?.title ? 30 : 20);
            }

            // Prepare table data
            const headers = Object.keys(localizedData[0] || {});
            const rows = localizedData.map((item) =>
                headers.map((header) => item[header] || "")
            );

            // ✅ Chọn columnStyles theo orientation
            const columnStyles: Record<number, any> = {};
            headers.forEach((header, index) => {
                if (header === "id") {
                    columnStyles[index] = {
                        cellWidth: orientation === "landscape" ? 50 : 40,
                    };
                } else if (header === "description") {
                    columnStyles[index] = {
                        cellWidth: orientation === "landscape" ? 120 : 80,
                    };
                } else if (header === "status") {
                    columnStyles[index] = {
                        cellWidth: orientation === "landscape" ? 40 : 30,
                    };
                } else if (header === "timestamp") {
                    // ✅ timestamp thường dài hơn, cho rộng hơn một chút
                    columnStyles[index] = {
                        cellWidth: orientation === "landscape" ? 60 : 50,
                    };
                } else {
                    columnStyles[index] = {
                        cellWidth: orientation === "landscape" ? 50 : 40,
                    };
                }
            });

            autoTable(doc, {
                head: [headers],
                body: rows,
                startY: options?.title || options?.subtitle ? 40 : 20,
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    overflow: "linebreak",
                },
                columnStyles,
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: 255,
                    fontStyle:
                        (options?.headerStyle?.fontStyle as
                            | "bold"
                            | "normal"
                            | "italic"
                            | "bolditalic") || "bold",
                    lineWidth: options?.headerStyle?.lineWidth || 0.5,
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
            });

            // ✅ Add timestamp cuối trang
            const now = new Date();
            const day = String(now.getDate()).padStart(2, "0");
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            const formatted = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

            doc.setFontSize(8);
            doc.text(
                `Tạo vào: ${formatted}`,
                14,
                doc.internal.pageSize.height - 10
            );

            doc.save(`${filename}.pdf`);
        } catch (err) {
            console.error("Xuất PDF thất bại:", err);
            throw new Error(`Xuất PDF thất bại: ${err}`);
        }
    };

    // Export to JSON
    const exportToJSON = React.useCallback(
        async (exportData: any[], filename: string) => {
            try {
                if (!exportData.length) {
                    throw new Error("Không có dữ liệu để xuất JSON");
                }

                const sortedData = [...exportData].sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );

                const localizedData = sortedData.map((item) => {
                    const newItem = { ...item };
                    if (newItem.timestamp) {
                        try {
                            const date = new Date(newItem.timestamp);
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(
                                2,
                                "0"
                            );
                            const year = date.getFullYear();
                            const hours = String(date.getHours()).padStart(
                                2,
                                "0"
                            );
                            const minutes = String(date.getMinutes()).padStart(
                                2,
                                "0"
                            );
                            const seconds = String(date.getSeconds()).padStart(
                                2,
                                "0"
                            );

                            newItem.timestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                        } catch {
                            newItem.timestamp = newItem.timestamp;
                        }
                    }
                    return newItem;
                });

                // ✅ Thêm metadata header
                const headers = Object.keys(localizedData[0] || {});
                const dataWithMetadata = [
                    {
                        _metadata: {
                            headers,
                            timezone:
                                Intl.DateTimeFormat().resolvedOptions()
                                    .timeZone,
                        },
                    },
                    ...localizedData,
                ];

                // ✅ Convert to JSON
                const jsonData = JSON.stringify(dataWithMetadata, null, 2);

                const blob = new Blob([jsonData], { type: "application/json" });
                const link = document.createElement("a");

                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", `${filename}.json`);
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (err) {
                console.error("JSON export error:", err);
                throw new Error(`Xuất JSON thất bại: ${err}`);
            }
        },
        []
    );

    // Main export function
    const exportData = React.useCallback(
        async (options: ExportOptions) => {
            setIsExporting(true);
            setError(null);

            try {
                // Get data based on scope
                const rawData = getDataByScope(options.scope);

                if (!rawData.length) {
                    throw new Error("Không có dữ liệu để xuất");
                }

                // Get columns
                const columns = getColumns(options.selectedColumns);

                if (!columns.length) {
                    throw new Error("Không có cột nào được chọn để xuất");
                }

                // Format data
                const formattedData = formatDataForExport(
                    rawData,
                    columns,
                    options.customHeaders,
                    options.format
                );

                // Generate filename
                const timestamp = new Date().toISOString().split("T")[0];
                const defaultFilename = `export_${options.scope}_${timestamp}`;
                const filename = options.filename || defaultFilename;

                // Export based on format
                switch (options.format) {
                    case "excel":
                        await exportToExcel(
                            formattedData,
                            filename,
                            options.excelOptions
                        );
                        break;

                    case "csv":
                        await exportToCSV(formattedData, filename);
                        break;

                    case "pdf":
                        await exportToPDF(
                            formattedData,
                            filename,
                            options.pdfOptions
                        );
                        break;

                    case "json":
                        await exportToJSON(formattedData, filename);
                        break;

                    default:
                        throw new Error(
                            `Định dạng xuất không hỗ trợ: ${options.format}`
                        );
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Xuất dữ liệu thất bại";
                setError(errorMessage);
                throw err;
            } finally {
                setIsExporting(false);
            }
        },
        [
            getDataByScope,
            getColumns,
            formatDataForExport,
            exportToExcel,
            exportToCSV,
            exportToPDF,
            exportToJSON,
        ]
    );

    return {
        exportData,
        isExporting,
        error,
    };
}
