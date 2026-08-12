import { useMemo, useState } from "react";
import { Eye, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Report, Tab } from "@/lib/store";

export function TabManager({
  tabs,
  reports,
  selectedTabId,
  onSelect,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: {
  tabs: Tab[];
  reports: Report[];
  selectedTabId: string | null;
  onSelect: (tabId: string | null) => void;
  onAdd: () => void;
  onView: (tab: Tab) => void;
  onEdit: (tab: Tab) => void;
  onDelete: (tab: Tab) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tabs;
    return tabs.filter((t) => t.name.toLowerCase().includes(q));
  }, [tabs, query]);

  const countFor = (tabId: string) => reports.filter((r) => r.tabId === tabId).length;

  return (
    <section className="flex w-full min-w-0 max-w-full flex-col rounded-xl border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Layers className="size-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold sm:text-base lg:text-sm">Tab Management</h2>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tabs…"
              className="w-full pl-9 text-sm"
              aria-label="Search tabs"
            />
          </div>
          <Button size="sm" className="shrink-0" onClick={onAdd}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </header>

      {/* mobile: vertical list below the header */}
      <MobileList
        tabs={filtered}
        reports={reports}
        selectedTabId={selectedTabId}
        onSelect={onSelect}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <div className="hidden flex-col lg:flex">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
            selectedTabId === null
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          <span className="font-medium">All tabs</span>
          <span className="text-xs opacity-70">{reports.length}</span>
        </button>

        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No tabs yet — add your first tab.
          </p>
        ) : (
          <ul className="grid grid-cols-4 gap-3 p-4">
            {filtered.map((tab) => {
              const active = tab.id === selectedTabId;
              return (
                <li key={tab.id} className="min-w-0">
                  <div
                    className={`flex items-center gap-2 rounded-md border bg-card px-3 py-2 transition-colors ${
                      active ? "border-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(tab.id)}
                      className="min-w-0 flex-1 text-left"
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="block truncate text-sm font-medium text-foreground uppercase">
                        {tab.name.toUpperCase()}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {countFor(tab.id)} report{countFor(tab.id) === 1 ? "" : "s"}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={`View ${tab.name}`}
                        onClick={() => onView(tab)}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        aria-label={`Edit ${tab.name}`}
                        onClick={() => onEdit(tab)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        aria-label={`Delete ${tab.name}`}
                        onClick={() => onDelete(tab)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function MobileList({
  tabs,
  reports,
  selectedTabId,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: {
  tabs: Tab[];
  reports: Report[];
  selectedTabId: string | null;
  onSelect: (tabId: string | null) => void;
  onView: (tab: Tab) => void;
  onEdit: (tab: Tab) => void;
  onDelete: (tab: Tab) => void;
}) {
  const countFor = (tabId: string) => reports.filter((r) => r.tabId === tabId).length;

  return (
    <div className="flex flex-col lg:hidden">
      <button
        onClick={() => onSelect(null)}
        className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors border-b border-border ${
          selectedTabId === null
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <span className="font-medium">All tabs</span>
        <span className="text-xs opacity-70">{reports.length}</span>
      </button>

      {tabs.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No tabs yet — add your first tab.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          {tabs.map((tab) => {
            const active = tab.id === selectedTabId;
            const count = countFor(tab.id);
            return (
              <li key={tab.id} className="min-w-0">
                <div
                  className={`flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm transition-colors ${
                    active ? "border-foreground" : "border-border hover:border-primary/50"
                  }`}
                >
                  <button
                    onClick={() => onSelect(tab.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-current={active ? "true" : undefined}
                  >
                    <span
                      className={`block truncate text-sm font-medium uppercase ${active ? "text-primary" : "text-foreground"}`}
                    >
                      {tab.name.toUpperCase()}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {count} report{count === 1 ? "" : "s"}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label={`View ${tab.name}`}
                      onClick={() => onView(tab)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label={`Edit ${tab.name}`}
                      onClick={() => onEdit(tab)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:text-destructive"
                      aria-label={`Delete ${tab.name}`}
                      onClick={() => onDelete(tab)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
