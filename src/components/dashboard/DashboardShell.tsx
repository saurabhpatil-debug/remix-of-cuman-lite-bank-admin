import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layers, BarChart3, Menu, X, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { clearSession, getSession, type Client } from "@/lib/store";
import { useClientContext } from "@/lib/useClientContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useUserInfo } from "@/framework/UserContext";
import { AuthService } from "@/framework/auth.service";

const NAV = [
  { label: "Tab Management", to: "/dashboard/tabs", icon: Layers },
  { label: "Report Management", to: "/dashboard/reports", icon: BarChart3 },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { client } = useClientContext();
  const [activeClient, setActiveClient] = useState<Client | null>(client);
  const [userName, setUserName] = useState("Admin");
  const [userRole, setUserRole] = useState("Administrator");

  const orgName = activeClient?.name || "Client";
  const email = activeClient?.email || "";

  useEffect(() => {
    setActiveClient(client);
  }, [client]);

  useEffect(() => {
    const session = getSession();
    setUserName(session?.name || "Admin");
    setUserRole(session?.role === "admin" ? "Administrator" : "Client user");
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const userInfo: any = useUserInfo();
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
        <BrandLogo
  src={userInfo?.LogoURL || "/default-logo.png"}
  className="h-12"
/>
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
            <BrandLogo
  src={userInfo?.LogoURL || "/default-logo.png"}
  className="h-7 max-w-full sm:h-9 lg:hidden"
/>
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
            <BrandLogo
  src={userInfo?.LogoURL || "/default-logo.png"}
  className="h-7 max-w-full sm:h-9 lg:hidden"
/>
          </div>

          <Popover>
          <PopoverTrigger asChild>
  <button
    className="flex shrink-0 items-center gap-2 rounded-md p-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:text-sm"
    aria-label="Open profile menu"
  >
    <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
      <span className="max-w-[7rem] truncate md:max-w-[9rem]">
        {userInfo?.ClientName}
      </span>
    </span>

    {/* User Initials */}
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ffc0a85c] text-xs font-semibold uppercase text-[#E66A3C]">
      {userInfo?.FirstName?.charAt(0)}
      {userInfo?.LastName?.charAt(0)}
    </span>
  </button>
</PopoverTrigger>
            
            <PopoverContent align="end" className="w-72 p-0">
            <div className="flex justify-between items-center gap-3 px-4 py-1">
                <span className=" min-w-0 flex-col items-start text-left sm:flex">
                  <span className="max-w-[7rem] truncate md:max-w-[9rem]">{userInfo?.ClientName}</span>
                 
                </span>
                <button
                onClick={handleLogout}
                className="flex  items-end gap-3 cursor-pointer px-4 py-3 text-sm  transition-colors "
              >
                <span>Sign out</span>
              </button>
            </div>
              
               <div className="flex items-start gap-3 px-5 pb-4">
                <div
                  className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#dce8f8]
            text-lg
            font-medium
            text-[#173b6d]
          "
                >
                  {userInfo?.FirstName?.charAt(0)}
                  {userInfo?.LastName?.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {userInfo?.FirstName} {userInfo?.LastName}
                  </p>

                  <p className="mt-1 truncate text-sm text-gray-700">
                    {userInfo?.Email}
                  </p>


                </div>
              </div>

              <Separator />

              
            </PopoverContent>
          </Popover>
        </header>

        <main className="min-w-0 max-w-full flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-5 lg:py-5">
          <div className="w-full max-w-full space-y-4 sm:space-y-6 lg:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
