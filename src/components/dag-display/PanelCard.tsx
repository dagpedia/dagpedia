import { cn } from "@/lib/utils";

export function PanelCard({
  title,
  children,
  className,
  divided = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  divided?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-2 px-4 py-3",
        divided && "border-t",
        className
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
