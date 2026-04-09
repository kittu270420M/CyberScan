"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, FileCheck2, ShieldAlert, Zap } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Scan response time", value: "3–8 sec" },
  { label: "Hash detection coverage", value: "70+ engines" },
  { label: "File size supported", value: "Up to 100MB" },
];

const alerts = [
  { icon: ShieldAlert, label: "Ransomware markers", severity: "High" },
  { icon: FileCheck2, label: "Suspicious script behavior", severity: "Medium" },
  { icon: Activity, label: "Macro execution chain", severity: "Low" },
];

export function Hero() {
  return (
    <Section className="relative overflow-hidden pt-16 sm:pt-20">
      <motion.div
        className="aurora-bg"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Badge>Security Intelligence Platform</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Enterprise malware detection with a{" "}
            <span className="headline-gradient">forensic-first workflow</span>.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload suspicious files, fingerprint with SHA256, enrich with
            VirusTotal intelligence, and surface explainable risk signals your
            SOC can act on fast.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/scan">
              <Button size="lg">Scan a File</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                Read API Docs
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + index * 0.1 }}
                className="rounded-xs border border-border/80 bg-white/4 p-3"
              >
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="noise-overlay"
        >
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">
                Live Detection Signals
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="size-3.5 text-primary" /> Real-time
              </span>
            </div>
            {alerts.map(({ icon: Icon, label, severity }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xs border border-border/80 bg-[#081325] p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-xs bg-primary/15 p-1.5 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {severity}
                </span>
              </div>
            ))}
            <div className="rounded-xs border border-primary/25 bg-primary/12 p-3">
              <p className="text-sm font-medium text-primary">
                93% confidence: likely malicious payload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Triggered by multi-engine consensus + behavior signature
                overlap.
              </p>
            </div>
          </Card>
        </motion.div>
      </Container>
    </Section>
  );
}
