import { Link, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Brand } from "@/components/app/brand";
import { Button } from "@/components/ui/button";
import { clerkEnabled } from "@/lib/clerk-config";

const GITHUB_URL = "https://github.com/Aniket2812/superreality";

// Slim public chrome for the marketing landing and the buyer call page. The realtor console
// has its own left-sidebar layout (DashboardShell); a signed-in realtor gets a shortcut in.
export function AppShell() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="bg-[#201e1b] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.13em] text-white sm:text-xs">
          Built for the Agentic Memory Hackathon
        </div>
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-5 px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a href="/#problem" className="transition-colors hover:text-foreground">The problem</a>
            <a href="/#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="/#memory" className="transition-colors hover:text-foreground">What it remembers</a>
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
                  <Button asChild size="sm">
                    <Link to="/call/demo">Live demo</Link>
                  </Button>
                </SignedOut>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/call/demo">Try voice demo</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="ghost" className="hidden lg:inline-flex">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">Source</a>
            </Button>
            <span className="hidden sm:block"><ThemeToggle /></span>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
