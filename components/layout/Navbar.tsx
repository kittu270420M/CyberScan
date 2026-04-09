"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/awareness", label: "Awareness" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="rounded-xs bg-primary/20 p-1.5 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <span className="inline-flex items-center gap-1.5">CyberScan</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xs px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/scan">
          <Button size="sm">Start Scanning</Button>
        </Link>
      </Container>
    </header>
  );
}
