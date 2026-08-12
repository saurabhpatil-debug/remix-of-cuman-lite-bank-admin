import type { ReactNode } from "react";

export function InlineFormPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full min-w-0 max-w-full rounded-xl border border-border bg-card p-4 sm:p-6">
      <header className="mb-4 border-b border-border pb-4">
        <h2 className="font-display text-lg leading-tight text-foreground sm:text-xl">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </header>
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}