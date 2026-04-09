"use client";

import { motion } from "framer-motion";
import { Bot, FileDigit, Fingerprint, Layers3, Radar } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Fingerprint,
    title: "File Fingerprinting",
    text: "Each file gets a unique hash, so it can be identified and matched with known threats instantly.",
  },
  {
    icon: Radar,
    title: "Threat Check",
    text: "Files are checked against multiple security engines to see if they have been flagged before.",
  },
  {
    icon: Bot,
    title: "Simple Explanations",
    text: "Technical results are converted into clear summaries so you can understand the risk quickly.",
  },
  {
    icon: Layers3,
    title: "Multiple Checks",
    text: "We combine file details, behavior clues, and reputation data to improve detection accuracy.",
  },
  {
    icon: FileDigit,
    title: "True File Type Detection",
    text: "The system verifies the real file type, even if the extension has been changed.",
  },
];

export function Features() {
  return (
    <Section id="features">
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Product Capabilities
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Detection built for security engineers, not dashboards alone
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="h-full space-y-4">
                <span className="inline-flex rounded-xs bg-primary/15 p-2 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
