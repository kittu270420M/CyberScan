import Link from "next/link";
import { Container } from "@/components/common/Container";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-[#050d1b]/85">
      <Container className="flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          &copy; {new Date().getFullYear()} CyberScan. Continuous malware
          defense.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/awareness"
            className="transition-colors hover:text-foreground"
          >
            Awareness
          </Link>
          <Link
            href="/docs"
            className="transition-colors hover:text-foreground"
          >
            Documentation
          </Link>
          <Link
            href="/about"
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
        </div>
      </Container>
    </footer>
  );
}
