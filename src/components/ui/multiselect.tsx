import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { MultiselectOption, MultiselectProps } from "@/types/ui";
import { ChevronsUpDown, X } from "lucide-react";
export type { MultiselectOption };

export function Multiselect({
  options,
  selectedValues,
  onSelectedValuesChange,
  placeholder = "Select",
  className,
  maxDisplayCount = 1,
  searchQuery,
  onSearchQueryChange,
}: MultiselectProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const displayedOptions = selectedOptions.slice(0, maxDisplayCount);
  const remainingCount = Math.max(
    0,
    selectedOptions.length - displayedOptions.length,
  );

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectedValuesChange(
        selectedValues.filter((selectedValue) => selectedValue !== value),
      );
      return;
    }

    onSelectedValuesChange([...selectedValues, value]);
  };

  const clearAll = () => {
    onSelectedValuesChange([]);
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
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {displayedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="bg-primary text-primary-foreground inline-flex h-5 items-center rounded-full px-2 text-xs"
                  >
                    {option.label}
                    <X className="ml-1 size-3" />
                  </span>
                ))}

                {remainingCount > 0 && (
                  <span className="bg-primary text-primary-foreground inline-flex h-5 items-center rounded-full px-2 text-xs">
                    +{remainingCount}
                  </span>
                )}
              </>
            )}
          </span>

          <span className="text-muted-foreground ml-2 inline-flex shrink-0 items-center gap-1">
            <ChevronsUpDown className="size-3.5" />
            <span
              role="button"
              aria-label="Clear selected options"
              tabIndex={0}
              className={cn(
                "inline-flex items-center",
                selectedOptions.length > 0
                  ? "cursor-pointer"
                  : "cursor-default opacity-60",
              )}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (selectedOptions.length > 0) {
                  clearAll();
                }
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }

                event.preventDefault();
                event.stopPropagation();

                if (selectedOptions.length > 0) {
                  clearAll();
                }
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
          {onSearchQueryChange !== undefined && (
            <input
              type="text"
              className="border-input mb-1 w-full rounded-md border bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search..."
              value={searchQuery ?? ""}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            />
          )}
          {options.length === 0 && onSearchQueryChange !== undefined ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              {(searchQuery ?? "").trim() ? "No results" : "Type to search"}
            </p>
          ) : (
            options.map((option) => {
              const checked = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleValue(option.value)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Multiselect;
