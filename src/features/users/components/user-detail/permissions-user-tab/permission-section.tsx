import React, { memo, useState, useMemo } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from "@/shared/components/ui/table";
import { Trash } from "lucide-react";
import { TablePagination } from "@/shared/components/custom-ui/pagination";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";

import type { Permission } from "@/types/permissions.types";

const PermissionsSection = memo(() => {
    console.log("🔄 PermissionsSection re-render");

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [newPermission, setNewPermission] = useState({
        name: "",
        description: "",
        clientName: "",
    });

    const [sorting, setSorting] = useState<SortingState>([
        { id: "name", desc: false },
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [rowSelection, setRowSelection] = useState({});

    const columns: ColumnDef<Permission>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    const icon =
                        sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↑";
                    return (
                        <div
                            className="flex items-center gap-1 cursor-pointer select-none"
                            onClick={() =>
                                column.toggleSorting(sorted === "asc")
                            }
                        >
                            Permission Name {icon}
                        </div>
                    );
                },
                enableSorting: true,
                cell: ({ getValue }) => getValue(),
            },
            {
                accessorKey: "description",
                enableSorting: true,
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    const icon =
                        sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↑";
                    return (
                        <div
                            className="flex items-center gap-1 cursor-pointer select-none"
                            onClick={() =>
                                column.toggleSorting(sorted === "asc")
                            }
                        >
                            Description {icon}
                        </div>
                    );
                },
                cell: ({ getValue }) => getValue() ?? "No description",
            },
            {
                accessorKey: "clientName",
                enableSorting: true,
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    const icon =
                        sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↑";
                    return (
                        <div
                            className="flex items-center gap-1 cursor-pointer select-none"
                            onClick={() =>
                                column.toggleSorting(sorted === "asc")
                            }
                        >
                            Client Name {icon}
                        </div>
                    );
                },
                cell: ({ getValue }) => getValue() ?? "No client",
            },
        ],
        []
    );

    const table = useReactTable({
        data: permissions,
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        autoResetPageIndex: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    React.useEffect(() => {
        if (table.getState().columnFilters.length > 0) {
            table.setPageIndex(0);
        }
    }, [table, columnFilters]);

    const handleAddPermission = () => {
        if (newPermission.name.trim()) {
            const newPerm: Permission = {
                id: Date.now().toString(),
                name: newPermission.name.trim(),
                description: newPermission.description.trim(),
                clientName: newPermission.clientName?.trim(),
            };

            setPermissions((prev) => [...prev, newPerm]);
            setNewPermission({ name: "", description: "", clientName: "" });

            console.log("✅ Added new permission:", newPerm);
        }
    };

    const handleDeletePermission = (permissionId: string) => {
        setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
        console.log("🗑️ Deleted permission:", permissionId);
    };

    return (
        <>
            <Card className="rounded-[8px] border pt-[20px] pb-[20px] px-[24px] space-y-4 shadow-lg border-gray-200 bg-background flex-shrink-0">
                <div className="text-lg font-semibold">Add Permission</div>

                <div className="flex flex-col md:flex-row w-full gap-4 md:items-end">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1 font-medium">
                            Permission Name{" "}
                            <span className="text-red-500">*</span>
                        </p>
                        <Input
                            className="bg-transparent w-full"
                            placeholder="Enter permission name"
                            value={newPermission.name}
                            onChange={(e) =>
                                setNewPermission((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1 font-medium">Description</p>
                        <Input
                            className="bg-transparent w-full"
                            placeholder="Enter description"
                            value={newPermission.description}
                            onChange={(e) =>
                                setNewPermission((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm mb-1 font-medium">Client Name</p>
                        <Input
                            className="bg-transparent w-full"
                            placeholder="Enter client name"
                            value={newPermission.clientName}
                            onChange={(e) =>
                                setNewPermission((prev) => ({
                                    ...prev,
                                    clientName: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex-shrink-0 flex justify-end md:justify-start">
                        <Button
                            size="sm"
                            className="w-auto md:w-[70px] bg-[#0f6cbd] text-white hover:bg-[#084c91]"
                            onClick={handleAddPermission}
                            disabled={!newPermission.name.trim()}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="flex flex-col flex-shrink-0 rounded-[8px] border pt-[20px] pb-[20px] px-[24px] space-y-4 shadow-lg border-gray-200 bg-background">
                <div className="text-lg font-semibold flex-shrink-0">
                    List of Permissions ({permissions.length})
                </div>

                <Card className="flex flex-col h-[350px] overflow-hidden shadow-md border-gray-100 mt-2">
                    <CardContent className="flex-1 p-0 min-h-0 flex flex-col">
                        <div className="border rounded-md flex flex-col h-full">
                            <div className="bg-muted/50 border-b flex-shrink-0">
                                <Table className="border-collapse">
                                    <TableHeader>
                                        {table
                                            .getHeaderGroups()
                                            .map((headerGroup) => (
                                                <TableRow
                                                    key={headerGroup.id}
                                                    className="border-0 hover:bg-transparent"
                                                >
                                                    {headerGroup.headers.map(
                                                        (header) => (
                                                            <TableHead
                                                                key={header.id}
                                                                className="h-12 px-4 border-0 font-semibold"
                                                                style={{
                                                                    width:
                                                                        header.id ===
                                                                            "name"
                                                                            ? "30%"
                                                                            : header.id ===
                                                                                "description"
                                                                                ? "40%"
                                                                                : header.id ===
                                                                                    "clientName"
                                                                                    ? "20%"
                                                                                    : "auto",
                                                                }}
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header
                                                                            .column
                                                                            .columnDef
                                                                            .header,
                                                                        header.getContext()
                                                                    )}
                                                            </TableHead>
                                                        )
                                                    )}
                                                    <TableHead className="h-12 px-4 w-[60px] border-0 font-semibold">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            ))}
                                    </TableHeader>
                                </Table>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-background">
                                <Table className="border-collapse">
                                    <TableBody>
                                        {table.getRowModel().rows.length > 0 ? (
                                            table
                                                .getRowModel()
                                                .rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        className="border-b transition-colors hover:bg-muted/50"
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
                                                                <TableCell
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                    className="p-4 border-0"
                                                                    style={{
                                                                        width:
                                                                            cell
                                                                                .column
                                                                                .id ===
                                                                                "name"
                                                                                ? "30%"
                                                                                : cell
                                                                                    .column
                                                                                    .id ===
                                                                                    "description"
                                                                                    ? "40%"
                                                                                    : cell
                                                                                        .column
                                                                                        .id ===
                                                                                        "clientName"
                                                                                        ? "20%"
                                                                                        : "auto",
                                                                    }}
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
                                                                        cell.getContext()
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        <TableCell className="p-4 w-[60px] border-0">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                className="h-8 w-8 hover:bg-red-50 hover:border-red-200"
                                                                onClick={() =>
                                                                    handleDeletePermission(
                                                                        row
                                                                            .original
                                                                            .id
                                                                    )
                                                                }
                                                            >
                                                                <Trash className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={columns.length + 1}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    No permissions found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex-shrink-0">
                    <TablePagination table={table} />
                </div>
            </Card>
        </>
    );
});

PermissionsSection.displayName = "PermissionsSection";

export default PermissionsSection;
