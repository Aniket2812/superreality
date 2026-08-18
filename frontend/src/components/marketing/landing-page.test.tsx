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

test("hero headline renders", () => {
  renderPage();
  expect(screen.getByText(/Never leave a buyer wondering\./i)).toBeInTheDocument();
});

test("the simplified pricing offer renders", () => {
  renderPage();
  expect(screen.getByText("wondering pro")).toBeInTheDocument();
  expect(screen.getByText("$597")).toBeInTheDocument();
});

test("buyer memory story renders", () => {
  renderPage();
  expect(screen.getByText(/Every call makes the next one better/i)).toBeInTheDocument();
  expect(screen.getByText(/returning buyers never have to start over/i)).toBeInTheDocument();
});

test("primary and secondary CTAs render", () => {
  renderPage();
  expect(screen.getByRole("button", { name: "Put it to work" })).toBeInTheDocument();
  const liveLinks = screen
    .getAllByRole("link")
    .filter((a) => a.getAttribute("href") === "/call/demo");
  expect(liveLinks.length).toBeGreaterThan(0);
});
