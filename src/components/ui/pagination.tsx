import * as React from "react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PaginationLinkProps, SectionPaginationProps } from "@/types/ui";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-1 flex items-center", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-2!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-2!", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-9 flex items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  visiblePageCount = 3,
) {
  const visibleStartPage =
    totalPages <= visiblePageCount
      ? 1
      : currentPage >= totalPages - 1
        ? totalPages - (visiblePageCount - 1)
        : 1;

  const visibleEndPage = Math.min(
    visibleStartPage + visiblePageCount - 1,
    totalPages,
  );

  const visiblePages = Array.from(
    { length: Math.max(0, visibleEndPage - visibleStartPage + 1) },
    (_, index) => visibleStartPage + index,
  );

  return { visibleStartPage, visibleEndPage, visiblePages };
}

export default function SectionPagination({
  total,
  currentPage,
  onPageChange,
  perPage,
  compact = false,
}: SectionPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const { visibleStartPage, visibleEndPage, visiblePages } = getVisiblePages(
    currentPage,
    totalPages,
  );

  const displayStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const displayEnd = Math.min(currentPage * perPage, total);
  const iconSizeClassName = compact ? "size-3.5" : "size-5";
  const counterTextClassName = compact ? "text-[10px]" : "text-xs";
  const controlGapClassName = compact ? "gap-1 text-xs" : "gap-2 text-sm";
  const buttonPaddingClassName = compact ? "p-1" : "p-2";
  const pageButtonClassName = compact ? "px-2 py-0.5" : "px-3 py-1";

  return (
    <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-3">
      <p className={`text-muted-foreground ${counterTextClassName}`}>
        Display {displayStart}-{displayEnd} of {total}
      </p>
      <div className={`flex items-center ${controlGapClassName}`}>
        <button
          type="button"
          className={`text-foreground hover:bg-muted rounded-md ${buttonPaddingClassName} disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Previous page"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          <ChevronLeftIcon className={iconSizeClassName} />
        </button>

        {visibleStartPage > 1 && (
          <span className="text-muted-foreground px-2 text-lg font-bold">
            ...
          </span>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={
              page === currentPage
                ? cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-md",
                    pageButtonClassName,
                  )
                : `text-foreground hover:bg-muted rounded-md ${pageButtonClassName}`
            }
          >
            {page}
          </button>
        ))}

        {visibleEndPage < totalPages && (
          <span className="text-muted-foreground px-2 text-lg font-bold">
            ...
          </span>
        )}

        <button
          type="button"
          className={`text-foreground hover:bg-muted rounded-md ${buttonPaddingClassName} disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Next page"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          <ChevronRightIcon className={iconSizeClassName} />
        </button>
      </div>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
