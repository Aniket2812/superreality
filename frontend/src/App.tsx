import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { AppShell } from "@/components/app/app-shell";
import { DashboardShell } from "@/components/app/dashboard-shell";
import { clerkEnabled } from "@/lib/clerk-config";

const LandingPage = lazy(() => import("@/components/marketing/landing-page"));
const Agents = lazy(() => import("@/routes/agents"));
const Buyers = lazy(() => import("@/routes/buyers"));
const Call = lazy(() => import("@/routes/call"));
const Listings = lazy(() => import("@/routes/listings"));
const Overview = lazy(() => import("@/routes/overview"));
const Settings = lazy(() => import("@/routes/settings"));

function RouteFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

// The realtor console requires a signed-in user (an active organization = the tenant is
// gated inside DashboardShell). The landing and the buyer call widget stay public.
function Protected({ children }: { children: ReactNode }) {
  if (!clerkEnabled) return children;
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

// Signed-out visitors see the marketing landing; a signed-in realtor goes to the dashboard.
function Landing() {
  if (!clerkEnabled) return <LandingPage />;
  return (
    <>
      <SignedIn>
        <Navigate to="/overview" replace />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        {/* Embed: chrome-less widget loaded in an iframe by public/embed.js on a realtor's
            own site. Standalone (outside AppShell) so no console/marketing header shows. */}
        <Route path="/embed/:tenantSlug" element={<Call embed />} />

        {/* Public: slim chrome */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/call" element={<Call />} />
          {/* A realtor's public buyer line: the tenant slug scopes the agent's memory. */}
          <Route path="/call/:tenantSlug" element={<Call />} />
        </Route>

        {/* Console: left-sidebar dashboard */}
        <Route
          element={
            <Protected>
              <DashboardShell />
            </Protected>
          }
        >
          <Route path="/overview" element={<Overview />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/pipeline" element={<Navigate to="/overview" replace />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Keep the removed v1 path alive, and never dead-end on an unknown URL. */}
        <Route path="/onboard" element={<Navigate to="/listings" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
