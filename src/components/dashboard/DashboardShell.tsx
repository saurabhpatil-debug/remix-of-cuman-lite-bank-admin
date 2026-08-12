import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Layers, BarChart3, Menu, X, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { clearSession, type Client } from "@/lib/store";
import { useClientContext } from "@/lib/useClientContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const NAV = [
  { label: "Tab Management", to: "/dashboard/tabs", icon: Layers },
  { label: "Report Management", to: "/dashboard/reports", icon: BarChart3 },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { client } = useClientContext();
  const [activeClient, setActiveClient] = useState<Client | null>(client);

  const orgName = activeClient?.name || "Client";
  const email = activeClient?.email || "";
  const userName = "Yu Dai";

  useEffect(() => {
    setActiveClient(client);
  }, [client]);

  const handleLogout = () => {
    clearSession();
    navigate({ to: "/" });
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full max-w-full bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <BrandLogo className="h-12" />
        </div>
        {nav}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-64 border-r border-border bg-sidebar">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <BrandLogo className="h-10" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 max-w-full flex-1 flex-col">
        <header className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/60 px-3 backdrop-blur sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <BrandLogo className="h-7 max-w-full sm:h-9 lg:hidden" />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex shrink-0 items-center gap-2 rounded-md p-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:text-sm"
                aria-label="Open profile menu"
              >
                <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
                  <span className="max-w-[7rem] truncate md:max-w-[10rem]">{orgName}</span>
                  <span className="max-w-[7rem] truncate text-[11px] font-normal text-muted-foreground md:max-w-[10rem]">
                    {userName}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-4" />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="flex items-center gap-3 px-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{email || "—"}</p>
                </div>
              </div>

              <Separator />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span>Sign out</span>
              </button>
            </PopoverContent>
          </Popover>
        </header>

        <main className="min-w-0 max-w-full flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10">
          <div className="w-full max-w-full space-y-4 sm:space-y-6 lg:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
