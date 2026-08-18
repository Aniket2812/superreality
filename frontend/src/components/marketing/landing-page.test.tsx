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

test("agentic memory headline renders", () => {
  renderPage();
  expect(screen.getByText(/An agent that remembers—and acts\./i)).toBeInTheDocument();
});

test("hackathon stack renders without commercial pricing", () => {
  renderPage();
  expect(screen.getByText("Distributed Vector Indexing")).toBeInTheDocument();
  expect(screen.getByText("Agent-ready ccloud CLI")).toBeInTheDocument();
  expect(screen.queryByText(/pricing|per month|free week/i)).not.toBeInTheDocument();
});

test("buyer memory story renders", () => {
  renderPage();
  expect(screen.getByText(/Every call improves the next action/i)).toBeInTheDocument();
  expect(screen.getByText(/durable identity, history, semantic recall/i)).toBeInTheDocument();
});

test("primary and secondary CTAs render", () => {
  renderPage();
  expect(screen.getAllByRole("link", { name: /Try the live agent/i }).length).toBeGreaterThan(0);
  const liveLinks = screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("href") === "/call/demo");
  expect(liveLinks.length).toBeGreaterThan(0);
});
