import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Card } from "@/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Upload File",
    description:
      "You upload a file through the interface. The system safely sends it to the backend for analysis.",
  },
  {
    step: "02",
    title: "Identify File",
    description:
      "The system checks what the file really is by reading its content and generating a unique fingerprint (hash).",
  },
  {
    step: "03",
    title: "Check Threats",
    description:
      "The file is compared with known threats using security services like VirusTotal.",
  },
  {
    step: "04",
    title: "Show Result",
    description:
      "You get a clear result with risk level, summary, and what you should do next.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Architecture
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            How the frontend connects to the security engine
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((item) => (
            <Card key={item.step} className="space-y-3">
              <p className="font-mono text-xs tracking-wider text-primary">
                STEP {item.step}
              </p>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

