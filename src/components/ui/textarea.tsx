import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      suppressHydrationWarning
      className={cn(
        "min-h-24 w-full resize-none rounded-md bg-transparent px-0 py-0 text-base leading-relaxed text-fg placeholder:text-subtle",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
