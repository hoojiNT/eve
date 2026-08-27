import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary: "bg-surface-2 text-fg hover:bg-surface-2/80 shadow-[var(--shadow-border)]",
        outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-surface-2",
        ghost: "bg-transparent text-fg hover:bg-surface-2",
        danger: "bg-danger text-danger-fg hover:bg-danger/90",
      },
      size: {
        default: "h-11 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    static?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  static: isStatic,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        !isStatic && "transition-[scale,background-color,color,box-shadow] duration-150 ease-out active:not-disabled:scale-[0.96]",
        className,
      )}
      {...props}
    />
  );
}
