"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import type { DatePickerProps } from "@/types/ui";
import { ChevronDownIcon } from "lucide-react";

export function DatePicker({
  date,
  onDateChange,
  pairedDate,
  type = "start",
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange(undefined);
      return;
    }

    if (type === "start" && pairedDate && selectedDate > pairedDate) {
      onDateChange(selectedDate);
      return;
    }

    if (type === "end" && pairedDate && selectedDate < pairedDate) {
      onDateChange(selectedDate);
      return;
    }

    onDateChange(selectedDate);
  };

  const isDisabled = (checkDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable dates before today
    if (checkDate < today) {
      return true;
    }

    if (!pairedDate) return false;

    if (type === "start") {
      return checkDate > pairedDate;
    }

    if (type === "end") {
      return checkDate < pairedDate;
    }

    return false;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={`data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal border-input text-foreground [border-image:none] [background-image:none] ${className || ""}`}
        >
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={isDisabled}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
