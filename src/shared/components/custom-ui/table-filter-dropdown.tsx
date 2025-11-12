
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

  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>();
    column.getFacetedUniqueValues().forEach((value, key) => {
        if(key !== undefined && key !== null) {
            values.add(key as string);
        }
    });
    return Array.from(values).sort();
  }, [column.getFacetedUniqueValues()]);

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
    if (selectedValues.length === 0) {
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

  const isAllSelected = selectedValues.length === uniqueValues.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <div className="p-2">
           <div className="flex items-center space-x-2 px-2 py-1">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
              <Label htmlFor="select-all" className="font-medium">Select All</Label>
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
                <Label htmlFor={value} className="font-normal">{value}</Label>
              </div>
            ))}
          </div>
        </ScrollArea>
         <Separator className="my-2" />
        <div className="flex justify-end gap-2 p-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" onClick={handleOk}>OK</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

    

    