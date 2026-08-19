import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/dashboard/Breadcrumbs";
import { PageHeader } from "@/components/dashboard/PageHeader";

export function PageScaffold({
  crumbs,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  crumbs?: Crumb[] | undefined;
  eyebrow?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">
      {crumbs && <Breadcrumbs items={crumbs} />}
      {title && <PageHeader eyebrow={eyebrow} title={title} description={description} action={action} />}
      <div className="w-full min-w-0 max-w-full space-y-4 sm:space-y-6">{children}</div>
    </div>
  );
}

export function NoClientNotice() {
  return (
    <p className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground sm:p-8 sm:text-sm">
      No client selected. Open this workspace from the client portal so the client context is passed
      along.
    </p>
  );
}

export function NotFoundNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground sm:p-8 sm:text-sm">
      {children}
    </p>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-6">
      {children}
    </dl>
  );
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 min-w-0 text-sm break-words text-foreground">{children}</dd>
    </div>
  );
}
