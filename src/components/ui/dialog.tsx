import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { DialogContentProps } from "@/types/ui";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  OctagonXIcon,
  Loader2,
} from "lucide-react";

const dialogVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 grid max-w-[calc(100%-2rem)] gap-6 rounded-xl p-6 text-sm duration-100 sm:max-w-md fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
  {
    variants: {
      variant: {
        default: " bg-background  ",
        success: " bg-background  ",
        destructive: " bg-destructive/5  ",
        info: "bg-background  ",
        warning: " bg-background ",
        error: " bg-background ",
        promise: " bg-background ",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/10 duration-100 fixed inset-0 isolate z-50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  variant,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  const renderIcon = () => {
    const iconClass =
      "w-8 h-8 text-black animate-in fade-in zoom-in duration-300";

    switch (variant) {
      case "success":
        return <CheckCircle2 className={iconClass} />;
      case "info":
        return <Info className={iconClass} />;
      case "warning":
        return <AlertTriangle className={iconClass} />;
      case "error":
        return <OctagonXIcon className={iconClass} />;
      case "promise":
        return (
          <Loader2 className="w-8 h-8 text-black animate-spin duration-1000" />
        );
      default:
        return null;
    }
  };

  const isSpecialVariant =
    variant &&
    ["success", "info", "warning", "error", "promise"].includes(variant);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          event.preventDefault();
        }}
        className={cn(dialogVariants({ variant, className }))}
        {...props}
      >
        <div
          className={cn(
            "flex h-full min-h-0 gap-4",
            isSpecialVariant ? "items-center" : "flex-col",
          )}
        >
          {isSpecialVariant && <div className="shrink-0">{renderIcon()}</div>}

          <div className="flex-1 flex min-h-0 flex-col gap-2">{children}</div>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "gap-1.5 flex flex-col text-left justify-center",
        className,
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "leading-none font-normal text-[19px] flex items-center pt-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
