"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:font-bold group-[.toast]:rounded-xl group-[.toast]:shadow-md hover:group-[.toast]:bg-slate-900 transition-all",
          cancelButton: "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:font-bold group-[.toast]:rounded-xl hover:group-[.toast]:bg-slate-200 transition-all",
          success: "group-[.toast]:!bg-emerald-50 group-[.toast]:!text-emerald-900 group-[.toast]:!border-emerald-200 dark:group-[.toast]:!bg-emerald-950 dark:group-[.toast]:!text-emerald-100 dark:group-[.toast]:!border-emerald-800",
          error: "group-[.toast]:!bg-rose-50 group-[.toast]:!text-rose-900 group-[.toast]:!border-rose-200 dark:group-[.toast]:!bg-rose-950 dark:group-[.toast]:!text-rose-100 dark:group-[.toast]:!border-rose-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
