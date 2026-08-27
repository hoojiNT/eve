import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "bg-surface text-fg shadow-[var(--shadow-border)] border-0",
          title: "text-fg",
          actionButton: "bg-accent text-accent-fg",
        },
      }}
    />
  );
}
