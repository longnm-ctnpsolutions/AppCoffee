"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Filter } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

interface TableFilterDropdownProps<T> {
  column: Column<T, unknown>
}

export function TableFilterDropdown<T>({ column }: TableFilterDropdownProps<T>) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    (column.getFilterValue() as string[]) || []
  );
  const [isOpen, setIsOpen] = React.useState(false);

  // Vì bạn dùng manual filtering, cần tự extract unique values từ current data
  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>();
    const table = (column as any).table;
    if (!table) return [];
    
    const rows = table.getCoreRowModel().rows;
    const columnId = column.id;
    
    rows.forEach((row: any) => {
      const cellValue = row.getValue(columnId);
      if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
        // Xử lý đặc biệt cho status column
        if (columnId === 'status') {
          const status = (cellValue === 1 || cellValue === "1") ? 'active' : 'inactive';
          values.add(status);
        } else {
          values.add(String(cellValue));
        }
      }
    });

    return Array.from(values).sort();
  }, [column]);

  // Debug log
  React.useEffect(() => {
    console.log(`Column ${column.id} unique values:`, uniqueValues);
  }, [column.id, uniqueValues]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedValues(uniqueValues);
    } else {
      setSelectedValues([]);
    }
  };

  const handleValueChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelectedValues((prev) => [...prev, value]);
    } else {
      setSelectedValues((prev) => prev.filter((v) => v !== value));
    }
  };

  const handleOk = () => {
    if (selectedValues.length === 0 || selectedValues.length === uniqueValues.length) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue(selectedValues);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedValues((column.getFilterValue() as string[]) || []);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedValues([]);
    column.setFilterValue(undefined);
    setIsOpen(false);
  };

  const isAllSelected = selectedValues.length === uniqueValues.length;
  const isFiltered = column.getFilterValue() !== undefined;

  // Không hiển thị nếu không có data
  if (uniqueValues.length === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-6 w-6 ml-2 ${isFiltered ? 'text-blue-600' : ''}`}
          title={`Filter ${column.id}`}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 px-2 py-1">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              <Label htmlFor="select-all" className="font-medium">Select All</Label>
            </div>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                Clear
              </Button>
            )}
          </div>
          <Separator className="my-2" />
        </div>
        
        <ScrollArea className="h-48">
          <div className="space-y-1 p-2">
            {uniqueValues.map((value) => (
              <div key={value} className="flex items-center space-x-2 px-2 py-1">
                <Checkbox
                  id={value}
                  checked={selectedValues.includes(value)}
                  onCheckedChange={(checked) => handleValueChange(value, !!checked)}
                />
                <Label htmlFor={value} className="font-normal text-sm truncate">
                  {value}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="my-2" />
        <div className="flex justify-end gap-2 p-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleOk}>
            OK
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}