import { cn } from "@/lib/utils";

export function PanelCard({
  title,
  children,
  className,
  divided = false,
  fill = false,
  bare = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
  fill?: boolean;
  bare?: boolean;
}) {
  if (bare) {
    return <div className={cn("px-4 py-3", className)}>{children}</div>;
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        divided && "border-t",
        fill && "h-full min-h-0",
        className
      )}
    >
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className={cn(fill && "flex min-h-0 flex-1 flex-col")}>{children}</div>
    </section>
  );
}
