import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

function withParams(path: string, params?: Record<string, string>) {
  if (!params) return path;
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`$${key}`, encodeURIComponent(value)),
    path,
  );
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-[13px]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {item.to && !last ? (
                <Link
                  to={withParams(item.to, item.params)}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate ${last ? "font-medium text-foreground" : ""}`}>
                  {item.label}
                </span>
              )}
              {last ? null : <ChevronRight className="size-3.5 shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}