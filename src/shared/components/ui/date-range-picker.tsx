"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
    onChange?: (range: DateRange | undefined) => void;
    initialRange?: DateRange;
    align?: "start" | "center" | "end";
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    onChange,
    initialRange,
    align = "start",
}) => {
     const range = initialRange;
    

      const handleSelect = (value: DateRange | undefined) => {
        onChange?.(value);
    };

    const formatDate = (date?: Date) =>
        date ? date.toLocaleDateString("en-GB") : "";

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant="outline"
                    className={cn(
                        "w-[275px] h-[35px] justify-between text-left font-normal px-3 max-[1477px]:w-full",
                        !range?.from && "text-muted-foreground"
                    )}
                >
                    <span>
                        {range?.from ? (
                            range.to ? (
                                <div className="flex items-center gap-3">
                                    <span>{formatDate(range.from)}</span>
                                    <span className="text-gray-400">→</span>
                                    <span>{formatDate(range.to)}</span>
                                </div>
                            ) : (
                                formatDate(range.from)
                            )
                        ) : (
                            // <div className="flex items-center gap-3">
                            //         <span>{formatDate(new Date())}</span>
                            //         <span className="text-gray-400">→</span>
                            //         <span>{formatDate(new Date())}</span>
                            // </div>

                            <span>All Dates</span>
                        )}

                    </span>
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0" align={align}>
                <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={range}
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
};
