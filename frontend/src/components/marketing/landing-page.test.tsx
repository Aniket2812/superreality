import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";

vi.mock("@clerk/clerk-react", () => ({
  SignUpButton: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/clerk-config", () => ({ clerkEnabled: true }));

import LandingPage from "@/components/marketing/landing-page";

function renderPage() {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

test("product headline renders", () => {
  renderPage();
  expect(screen.getByText(/Turn missed calls into booked showings\./i)).toBeInTheDocument();
});

test("product story renders without infrastructure-heavy copy", () => {
  renderPage();
  expect(screen.getByText(/Buyer intent disappears into voicemail/i)).toBeInTheDocument();
  expect(screen.getByText(/Returning buyers never start over/i)).toBeInTheDocument();
  expect(screen.queryByText(/ccloud CLI|Distributed Vector Indexing/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/pricing|per month|free week/i)).not.toBeInTheDocument();
});

test("buyer memory story renders", () => {
  renderPage();
  expect(screen.getByText(/The next call begins with the buyer's saved needs/i)).toBeInTheDocument();
  expect(screen.getByText(/CockroachDB keeps buyer history/i)).toBeInTheDocument();
});

test("primary and secondary CTAs render", () => {
  renderPage();
  expect(screen.getAllByRole("link", { name: /Try the live concierge/i }).length).toBeGreaterThan(0);
  const liveLinks = screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("href") === "/call/demo");
  expect(liveLinks.length).toBeGreaterThan(0);
});
