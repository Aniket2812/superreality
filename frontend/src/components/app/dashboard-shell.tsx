import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CreateOrganization,
  OrganizationSwitcher,
  useOrganization,
  UserButton,
} from "@clerk/clerk-react";
import {
  Building2,
  LayoutDashboard,
  Menu,
  Network,
  Settings,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/listings", label: "Listings", icon: Building2 },
  { to: "/buyers", label: "Buyers", icon: Users },
  { to: "/agents", label: "Agent team", icon: Network },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function pageTitle(pathname: string): string {
  return NAV.find((n) => pathname.startsWith(n.to))?.label ?? "Dashboard";
}

// Brand-new signup with no organization yet: a clean full-page first run (no dashboard nav,
// which would only lead to tenant-scoped pages that can't load) that creates their agency and
// previews what happens next.
function FirstRun() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <UserButton />
        <ThemeToggle />
      </div>
      <Brand />
      <div className="max-w-md space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your agency
        </h1>
        <p className="text-sm text-muted-foreground">
          Your agency is your workspace. Create one to connect your listings and
          get your always-on buyer line.
        </p>
      </div>
      <CreateOrganization afterCreateOrganizationUrl="/overview" />
      <ol className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">1.</span> Create your
          agency
        </li>
        <li>
          <span className="font-semibold text-foreground">2.</span> Connect your
          listings
        </li>
        <li>
          <span className="font-semibold text-foreground">3.</span> Share your
          call link
        </li>
      </ol>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-1 bg-sidebar text-sidebar-foreground">
      <div onClick={onNavigate} className="flex h-20 shrink-0 items-center px-5 [&_a]:text-sidebar-foreground">
        <Brand />
      </div>

      <div className="px-5 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/40">Workspace</div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="size-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <UserButton />
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl="/overview"
            afterCreateOrganizationUrl="/overview"
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function DashboardShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { organization, isLoaded } = useOrganization();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Give the mobile drawer the modal contract: Escape closes it, background scroll is
  // locked, focus moves into the drawer on open and back to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const trigger = menuButtonRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  // Wait for Clerk before deciding, so we never flash the dashboard or the first run.
  if (!isLoaded) return <div className="min-h-svh bg-background" />;
  if (!organization) return <FirstRun />;

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-sidebar-border lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarBody />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border shadow-xl"
          >
            <SidebarBody onNavigate={() => setOpen(false)} />
            <Button
              ref={closeButtonRef}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2.5"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-8">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">wondering workspace</div>
            <h1 className="mt-0.5 text-lg font-semibold tracking-[-0.03em]">
            {pageTitle(pathname)}
            </h1>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
