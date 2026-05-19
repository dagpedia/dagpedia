export const NAV_ITEMS = [
  { label: "DAGs", href: "/dags" },
  { label: "Nodes", href: "/nodes" },
  { label: "About", href: "/about" },
] as const;

export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True for `/dags/[slug]` detail pages (not `/dags` index). */
export function isDagDetailPage(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 2 && segments[0] === "dags";
}
