import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Columns, Eye, EyeOff } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";

// Define CheckedState type explicitly
type CheckedState = boolean | string | "indeterminate";

interface ColumnChooserDialogProps<TData> {
    table: Table<TData>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    getColumnDisplayName?: (columnId: string) => string;
}

const defaultGetColumnDisplayName = (columnId: string) => {
    const displayNames: Record<string, string> = {
        'name': 'Name',
        'email': 'Email',
        'phone': 'Phone',
        'status': 'Status',
        'description': 'Description',
        'logo': 'Logo',
        'actions': 'Actions',
        'createdAt': 'Created At',
        'updatedAt': 'Updated At',
        'id': 'ID',
        'title': 'Title',
        'role': 'Role',
        'department': 'Department',
        'location': 'Location',
        'address': 'Address',
        'city': 'City',
        'country': 'Country',
        'zipCode': 'Zip Code',
        'website': 'Website',
        'company': 'Company',
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'fullName': 'Full Name',
        'dateOfBirth': 'Date of Birth',
        'age': 'Age',
        'gender': 'Gender',
        'notes': 'Notes',
        'tags': 'Tags',
        'category': 'Category',
        'type': 'Type',
        'priority': 'Priority',
        'amount': 'Amount',
        'price': 'Price',
        'quantity': 'Quantity',
        'total': 'Total',
        'discount': 'Discount',
        'tax': 'Tax',
        'isActive': 'Active',
        'isPublished': 'Published',
        'isArchived': 'Archived',
        'isFeatured': 'Featured',
        'lockoutEnabled': 'Status'
    };
    return displayNames[columnId] || columnId.charAt(0).toUpperCase() + columnId.slice(1).replace(/([A-Z])/g, ' $1').trim();
};

export function ColumnChooserDialog<TData>({
    table,
    open,
    onOpenChange,
    title = "Column Visibility",
    description = "Choose which columns to show or hide in the table.",
    getColumnDisplayName = defaultGetColumnDisplayName
}: ColumnChooserDialogProps<TData>) {
    const [tempColumnVisibility, setTempColumnVisibility] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        if (open) {
            const currentVisibility = table.getState().columnVisibility;
            const allColumns = table.getAllColumns();
            const visibility: Record<string, boolean> = {};
            allColumns.forEach(column => {
                if (column.getCanHide()) {
                    visibility[column.id] = currentVisibility[column.id] ?? true;
                }
            });
            setTempColumnVisibility(visibility);
        }
    }, [open, table]);

    const handleToggleColumn = (columnId: string, value: CheckedState) => {
        const isVisible = value !== "indeterminate" && !!value;
        setTempColumnVisibility(prev => ({
            ...prev,
            [columnId]: isVisible
        }));
    };

    const handleApply = () => {
        table.setColumnVisibility(tempColumnVisibility);
        onOpenChange(false);
    };

    const handleReset = () => {
        const resetVisibility: Record<string, boolean> = {};
        table.getAllColumns().forEach(column => {
            if (column.getCanHide()) {
                resetVisibility[column.id] = true;
            }
        });
        setTempColumnVisibility(resetVisibility);
    };

    const handleHideAll = () => {
        const hideAllVisibility: Record<string, boolean> = {};
        table.getAllColumns().forEach(column => {
            if (column.getCanHide()) {
                hideAllVisibility[column.id] = false;
            }
        });
        setTempColumnVisibility(hideAllVisibility);
    };

    const hideableColumns = table
        .getAllColumns()
        .filter((column) => column.getCanHide() && column.id !== "id");
    const visibleColumns = hideableColumns.filter(
        (col) => tempColumnVisibility[col.id] ?? true
    ).length;

    const totalColumns = Object.keys(tempColumnVisibility).length;
    const hiddenColumns = totalColumns - visibleColumns - 1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Columns className="h-5 w-5" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{visibleColumns} visible</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>{hiddenColumns} hidden</span>
                    </div>
                </div>

                <ScrollArea className="max-h-80 pr-4">
                    <div className="space-y-2">
                        {hideableColumns.map((column, index) => (
                            <div key={column.id}>
                                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                        id={`col-${column.id}`}
                                        checked={tempColumnVisibility[column.id] ?? true}
                                        onCheckedChange={(value) => handleToggleColumn(column.id, value)}
                                    />
                                    <Label
                                        htmlFor={`col-${column.id}`}
                                        className="cursor-pointer flex-1 text-sm font-medium leading-none"
                                    >
                                        {getColumnDisplayName(column.id)}
                                    </Label>
                                    <div className="text-xs text-muted-foreground">
                                        {tempColumnVisibility[column.id] ? (
                                            <Eye className="h-3 w-3" />
                                        ) : (
                                            <EyeOff className="h-3 w-3" />
                                        )}
                                    </div>
                                </div>
                                {index < hideableColumns.length - 1 && <Separator className="my-1" />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2 sm:gap-2">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            size="sm"
                            className="flex-1"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Show All
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleHideAll}
                            size="sm"
                            className="flex-1"
                        >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide All
                        </Button>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            size="sm"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            size="sm"
                            className="flex-1"
                        >
                            <Columns className="h-4 w-4 mr-2" />
                            Apply Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

ColumnChooserDialog.displayName = 'ColumnChooserDialog';
