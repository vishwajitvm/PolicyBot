import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { DashboardPageFeature } from "./features/dashboard/DashboardPage";
import { ChatPageFeature } from "./features/chat/ChatPage";
import { SourcesPageFeature } from "./features/sources/SourcesPage";

function renderWithProviders(ui: React.ReactElement) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe("PolicyBot frontend", () => {
  it("renders dashboard", () => {
    renderWithProviders(<DashboardPageFeature />);
    expect(screen.getByText("Documents Indexed")).toBeInTheDocument();
  });

  it("renders chat page", () => {
    renderWithProviders(<ChatPageFeature />);
    expect(screen.getByText(/Select a chat to start/i)).toBeInTheDocument();
  });

  it("renders sources page", () => {
    renderWithProviders(<SourcesPageFeature />);
    expect(screen.getByText("Local Folder Source")).toBeInTheDocument();
  });
});
