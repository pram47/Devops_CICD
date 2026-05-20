import type * as React from "react";
import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type useEmblaCarousel from "embla-carousel-react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import type { Button } from "@/components/ui/button";

export type ToggleProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
};

export type RtfQuillProps = {
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
};

export type MultiselectOption = {
  label: string;
  value: string;
};

export type MultiselectProps = {
  options: MultiselectOption[];
  selectedValues: string[];
  onSelectedValuesChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplayCount?: number;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
};

export type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

export type SectionPaginationProps = {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  perPage: number;
  compact?: boolean;
};

export interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  pairedDate?: Date;
  type?: "start" | "end";
  placeholder?: string;
  className?: string;
}

export type DialogVariant =
  | "default"
  | "success"
  | "destructive"
  | "info"
  | "warning"
  | "error"
  | "promise";

export interface DialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  showCloseButton?: boolean;
  variant?: DialogVariant;
}

export type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export type CarouselApi = UseEmblaCarouselType[1];
export type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type CarouselOptions = UseCarouselParameters[0];
export type CarouselPlugin = UseCarouselParameters[1];

export type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

export type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;
