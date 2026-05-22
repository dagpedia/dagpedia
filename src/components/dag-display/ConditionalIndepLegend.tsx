export function ConditionalIndepLegendContent() {
  return (
    <dl className="space-y-2 text-sm">
      <div>
        <dt className="font-medium">⊥</dt>
        <dd className="text-muted-foreground">
          The two variables are independent (not associated) in the implied
          model.
        </dd>
      </div>
      <div>
        <dt className="font-medium">|</dt>
        <dd className="text-muted-foreground">
          Independence holds after conditioning on (adjusting for) the
          variables listed to the right.
        </dd>
      </div>
    </dl>
  );
}
