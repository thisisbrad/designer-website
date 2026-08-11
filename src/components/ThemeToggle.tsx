"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint, inlined in the document head. Dark is the house
 * style and the default for everyone; light is opt-in and only applies once
 * someone has chosen it. Stamping <html> here means a visitor who chose
 * light doesn't get a black flash on every navigation.
 *
 * Kept as a string because it has to be a blocking script, not a component.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.setAttribute('data-theme',s==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

function Sun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="12"
          y1="1.8"
          x2="12"
          y2="4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${deg} 12 12)`}
        />
      ))}
    </svg>
  );
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4">
      <path
        d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ThemeToggle({ className }: { className?: string }) {
  /* Starts null so the server render and first client render agree — the
     real value is already on <html> courtesy of the init script. */
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the choice just won't survive the session.
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#fdfcf9" : "#0a0a0b");
    setTheme(next);
  };

  const label =
    theme === null
      ? "Switch colour theme"
      : `Switch to ${theme === "light" ? "dark" : "light"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      data-cursor="hover"
      className={`flex size-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent ${className ?? ""}`}
    >
      {/* Both icons render and CSS picks one from the data-theme attribute,
          so the right icon is on screen from the first paint instead of
          flipping once hydration lands. */}
      <span data-theme-icon="dark">
        <Sun />
      </span>
      <span data-theme-icon="light">
        <Moon />
      </span>
    </button>
  );
}
