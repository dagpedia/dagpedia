import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PanelCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm" className="gap-2 py-3">
      <CardHeader className="px-3 pb-0">
        <CardTitle className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-0">{children}</CardContent>
    </Card>
  );
}
