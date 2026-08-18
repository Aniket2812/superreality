import { Link, NavLink, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { StartFreeButton } from "@/components/marketing/start-free-button";
import { clerkEnabled } from "@/lib/clerk-config";

// Slim public chrome for the marketing landing and the buyer call page. The realtor console
// has its own left-sidebar layout (DashboardShell); a signed-in realtor gets a shortcut in.
export function AppShell() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-5 px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <NavLink to="/#product" className="transition-colors hover:text-foreground">Product</NavLink>
            <NavLink to="/#how" className="transition-colors hover:text-foreground">How it works</NavLink>
            <NavLink to="/#pricing" className="transition-colors hover:text-foreground">Pricing</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {clerkEnabled ? (
              <>
                <SignedIn>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/overview">
                      Dashboard <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="sm" variant="ghost">
                      Sign in
                    </Button>
                  </SignInButton>
                  <StartFreeButton size="sm" />
                </SignedOut>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/call/demo">Try voice demo</Link>
              </Button>
            )}
            <span className="hidden sm:block"><ThemeToggle /></span>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
