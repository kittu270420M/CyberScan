import Link from "next/link";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CTA() {
  return (
    <Section className="pb-20">
      <Container>
        <Card className="relative overflow-hidden">
          <div className="absolute -left-10 top-1/2 size-36 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Ready To Deploy
              </p>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Integrate CyberScan into your secure upload pipeline today
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Start with frontend scanning flows now and connect to your FastAPI
                threat engine when backend endpoints are ready.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/scan">
                <Button size="lg">Open Scanner</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  About Project
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
