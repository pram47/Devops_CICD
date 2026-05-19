import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, CircleDot, X } from "lucide-react";
import { useState } from "react";

export type ToggleSelectOption = {
  label: string;
  value: string;
};

export type ToggleSelectProps = {
  options: ToggleSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function ToggleSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  className,
}: ToggleSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue === value ? "" : nextValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            {!selectedOption ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="bg-primary text-primary-foreground inline-flex h-5 items-center rounded-full px-2 text-xs">
                {selectedOption.label}
                <X className="ml-1 size-3" />
              </span>
            )}
          </span>

          <span className="text-muted-foreground ml-2 inline-flex shrink-0 items-center gap-1">
            <ChevronsUpDown className="size-3.5" />
            <span
              role="button"
              aria-label="Clear selected option"
              tabIndex={0}
              className={cn(
                "inline-flex items-center",
                selectedOption ? "cursor-pointer" : "cursor-default opacity-60",
              )}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (selectedOption) onValueChange("");
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                if (selectedOption) onValueChange("");
              }}
            >
              <X className="size-3.5" />
            </span>
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-2"
        align="start"
      >
        <div className="space-y-1">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleSelect(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted",
                  isSelected && "bg-muted",
                )}
              >
                <CircleDot
                  className={cn(
                    "size-4 shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
