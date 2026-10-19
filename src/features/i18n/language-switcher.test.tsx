import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sessionQueryKey } from "@/hooks/use-session";
import type { SessionUser } from "@/lib/auth/client";
import es from "../../../messages/es.json";
import { LanguageSwitcher } from "./language-switcher";

vi.mock("next/navigation", async (original) => ({
  ...(await original<typeof import("next/navigation")>()),
  usePathname: () => "/es/products/123",
}));
const loadPage = vi.hoisted(() => vi.fn());
vi.mock("./language", async (original) => ({
  ...(await original<typeof import("./language")>()),
  loadPage,
}));
const updateProfile = vi.hoisted(() => vi.fn());
vi.mock("@/lib/catalog", () => ({ updateProfile }));

function renderSwitcher(user: Partial<SessionUser> | null) {
  const client = new QueryClient();
  client.setQueryData(sessionQueryKey, {
    authenticated: Boolean(user),
    user,
  });
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="es" messages={es}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // biome-ignore lint/suspicious/noDocumentCookie: resets the test cookie
  document.cookie = "NEXT_LOCALE=; max-age=0; path=/";
});

describe("LanguageSwitcher", () => {
  it("opens the same page in the other language and remembers it", async () => {
    window.history.replaceState(null, "", "/es/products/123?ref=home");
    renderSwitcher(null);

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    await waitFor(() =>
      expect(loadPage).toHaveBeenCalledWith("/en/products/123?ref=home"),
    );
    expect(document.cookie).toContain("NEXT_LOCALE=en");
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("saves the choice on the account when signed in", async () => {
    updateProfile.mockResolvedValue(null);
    renderSwitcher({ id: "u1", language: "" });

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    await waitFor(() => expect(loadPage).toHaveBeenCalled());
    expect(updateProfile).toHaveBeenCalledWith("u1", { language: "en" });
  });

  it("does nothing for the active language", () => {
    renderSwitcher(null);
    fireEvent.click(screen.getByRole("button", { name: "Español" }));
    expect(loadPage).not.toHaveBeenCalled();
  });
});
