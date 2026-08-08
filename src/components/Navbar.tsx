"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollToSection, scrollToTop } from "./SmoothScroll";

const links = [
  { href: "#solutions", label: "The Plan" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#experiments", label: "AI in Action" },
  { href: "/blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(href);
  };

  /** Anchor links smooth-scroll on the homepage and route back to it elsewhere. */
  const NavLink = ({
    href,
    className,
    tabIndex,
    style,
    children,
  }: {
    href: string;
    className?: string;
    tabIndex?: number;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }) => {
    if (href.startsWith("/")) {
      return (
        <Link
          href={href}
          onClick={() => setOpen(false)}
          className={className}
          tabIndex={tabIndex}
          style={style}
        >
          {children}
        </Link>
      );
    }
    if (onHome) {
      return (
        <a
          href={href}
          onClick={(e) => go(e, href)}
          className={className}
          tabIndex={tabIndex}
          style={style}
        >
          {children}
        </a>
      );
    }
    return (
      <a
        href={`/${href}`}
        onClick={() => setOpen(false)}
        className={className}
        tabIndex={tabIndex}
        style={style}
      >
        {children}
      </a>
    );
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
        scrolled && !open
          ? "border-line bg-ink/70 backdrop-blur-md"
          : "border-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="relative z-50 mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:h-[72px] md:px-10"
      >
        {onHome ? (
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              scrollToTop();
            }}
            className="font-display text-lg font-semibold tracking-tight"
          >
            beltowski<span className="text-accent">®</span>
          </a>
        ) : (
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-lg font-semibold tracking-tight"
          >
            beltowski<span className="text-accent">®</span>
          </Link>
        )}

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                className="group relative text-[13px] tracking-[0.18em] text-muted uppercase transition-colors hover:text-paper"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                />
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <p className="hidden items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:flex">
            <span aria-hidden className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
            Open for Q3 2026
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <span
              aria-hidden
              className={cn(
                "h-px w-6 bg-paper transition-transform duration-300",
                open && "translate-y-[3.5px] rotate-45"
              )}
            />
            <span
              aria-hidden
              className={cn(
                "h-px w-6 bg-paper transition-transform duration-300",
                open && "-translate-y-[3.5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu. Full-bleed rather than offset by the header
          height: the header is transparent while open, so anything it doesn't
          cover shows the page underneath. The nav above sits at z-50 to stay
          legible and clickable on top of this. */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-ink transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ul className="flex h-full flex-col justify-center gap-2 px-6 pt-16">
          {links.map((link, i) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                tabIndex={open ? 0 : -1}
                style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
                className={cn(
                  "block py-2 font-display text-4xl font-medium tracking-tight transition-all duration-500",
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                )}
              >
                <span className="mr-4 font-mono text-sm text-accent">
                  0{i + 1}
                </span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
