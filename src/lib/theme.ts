// Theme selection (openspec D19). The resolved theme lives on
// <html data-theme="light|dark">; the visitor's choice in localStorage.
export type ThemeChoice = "light" | "dark" | "system";
export const THEME_KEY = "servbo.theme";

// Runs inline in <head> before first paint, so the page never flashes the
// other theme. Kept dependency-free and tiny; failures fall back to light.
export const themeScript = `(()=>{try{var c=localStorage.getItem("${THEME_KEY}")||"system";var d=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.theme=d?"dark":"light";r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export function applyTheme(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
}
