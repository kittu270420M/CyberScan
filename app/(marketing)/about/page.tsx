"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";

const pillars = [
  {
    title: "Academic Purpose",
    icon: "school",
    text: "Build a practical end-to-end malware detection workflow that demonstrates frontend/backend integration and security engineering fundamentals.",
  },
  {
    title: "Technical Stack",
    icon: "deployed_code",
    text: "Next.js + Tailwind + Framer Motion on the frontend, connected to FastAPI with Axios, SHA256 hashing, python-magic, and VirusTotal intelligence.",
  },
  {
    title: "Learning Outcomes",
    icon: "workspace_premium",
    text: "Understand real-world triage tradeoffs: false positives, confidence scoring, explainability, and responsible handling of suspicious artifacts.",
  },
];

const timeline = [
  {
    phase: "Phase 1",
    focus: "Frontend Design System",
    detail:
      "Built reusable UI components and a modern interface for consistent scan/report flows.",
  },
  {
    phase: "Phase 2",
    focus: "API Contract & Integration",
    detail:
      "Connected scan upload UX to FastAPI endpoints through a centralized Axios client.",
  },
  {
    phase: "Phase 3",
    focus: "Threat Intelligence",
    detail:
      "Mapped VirusTotal responses into student-friendly but technically accurate result summaries.",
  },
];

export default function AboutPage() {
  return (
    <Section className="pt-10 sm:pt-14">
      <Container className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-3"
        >
          <Badge className="inline-flex items-center gap-1.5">
            <GoogleIcon name="lab_profile" className="!text-sm" />
            Student Cybersecurity Project
          </Badge>
          <h1 className="max-w-4xl text-3xl font-semibold sm:text-4xl">
            CyberScan is an educational malware-detection prototype focused on
            practical security engineering.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            We are not offering this as a commercial security service. This
            project is built for learning, portfolio development, and
            demonstrating how modern frontend systems can communicate with
            malware analysis pipelines in a structured and explainable way.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Card className="h-full space-y-2">
                <p className="inline-flex items-center gap-2 text-primary">
                  <GoogleIcon name={pillar.icon} />
                  <span className="text-sm font-semibold">{pillar.title}</span>
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pillar.text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Project Roadmap</h2>
          <div className="space-y-3">
            {timeline.map((item) => (
              <div
                key={item.phase}
                className="rounded-xs border border-border/80 bg-[#081325] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {item.phase}
                </p>
                <p className="mt-1 text-base font-semibold">{item.focus}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </Section>
  );
}
