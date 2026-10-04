"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, THEME_KEY, type ThemeChoice } from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
  { value: "system", label: "Match system theme", Icon: Monitor },
];

const readChoice = (): ThemeChoice => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

// Segmented light / dark / system control. The first paint is already
// correct (inline script in layout); this only changes and remembers it.
export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => setChoice(readChoice()), []);

  // In "system" mode, follow OS changes live.
  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [choice]);

  const choose = (value: ThemeChoice) => {
    setChoice(value);
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      // Private mode: the choice still applies for this page view.
    }
    applyTheme(value);
  };

  // Phones: one button cycling light → dark → system saves header room.
  const index = OPTIONS.findIndex((option) => option.value === choice);
  const current = OPTIONS[index === -1 ? 2 : index];
  const next = OPTIONS[((index === -1 ? 2 : index) + 1) % OPTIONS.length];

  return (
    <>
      <button
        aria-label={`${current.label}. Switch to ${next.label.toLowerCase()}`}
        className="inline-flex size-8 items-center justify-center rounded-full border border-line bg-surface-2 text-fg sm:hidden"
        onClick={() => choose(next.value)}
        type="button"
      >
        <current.Icon size={15} />
      </button>
      <fieldset className="hidden items-center gap-0.5 rounded-full border border-line bg-surface-2 p-0.5 sm:inline-flex">
        <legend className="sr-only">Theme</legend>
        {OPTIONS.map(({ value, label, Icon }) => (
          <button
            aria-label={label}
            aria-pressed={choice === value}
            className={`inline-flex size-7 items-center justify-center rounded-full transition ${
              choice === value
                ? "bg-surface text-fg shadow-soft"
                : "text-muted hover:text-fg"
            }`}
            key={value}
            onClick={() => choose(value)}
            title={label}
            type="button"
          >
            <Icon size={14} />
          </button>
        ))}
      </fieldset>
    </>
  );
}
