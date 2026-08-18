import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { StorySection } from "@/components/app/story-section";

test("StorySection shows title, subtitle, and the CockroachDB badge when set", () => {
  render(
    <StorySection title="How it remembers" subtitle="the graph" cockroach>
      <div>child</div>
    </StorySection>,
  );
  expect(screen.getByText("How it remembers")).toBeInTheDocument();
  expect(screen.getByText("the graph")).toBeInTheDocument();
  expect(screen.getByText(/Powered by CockroachDB vector memory/i)).toBeInTheDocument();
  expect(screen.getByText("child")).toBeInTheDocument();
});

test("StorySection hides the badge when cockroach is not set", () => {
  render(
    <StorySection title="Proof">
      <div>c</div>
    </StorySection>,
  );
  expect(screen.queryByText(/Powered by CockroachDB vector memory/i)).toBeNull();
});
