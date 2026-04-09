"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { GoogleIcon } from "@/components/ui/google-icon";

// ✅ New Components
import MalwareModal from "@/components/awareness/MalwareModal";
import ThreatTabs from "@/components/awareness/ThreatTabs";
import Accordion from "@/components/awareness/Accordion";
import ResponseStepper from "@/components/awareness/ResponseStepper";

/* ===================== DATA (UNCHANGED) ===================== */

const malwareTypes = [
  {
    title: "Virus",
    summary:
      "Attaches itself to legitimate files and spreads when those files are executed.",
    behavior:
      "Often modifies files, corrupts data, or triggers payloads based on user actions.",
    risk: "Can silently spread across shared drives and removable media.",
  },
  {
    title: "Worm",
    summary:
      "Self-replicating malware that spreads over networks without user interaction.",
    behavior:
      "Exploits vulnerabilities in services or operating systems to move laterally.",
    risk: "Fast network-wide outbreaks and service disruption.",
  },
  {
    title: "Trojan",
    summary:
      "Malicious software disguised as a legitimate installer, update, or file.",
    behavior:
      "Creates backdoors, steals credentials, or downloads secondary payloads.",
    risk: "High social-engineering success because it appears trustworthy.",
  },
  {
    title: "Ransomware",
    summary: "Encrypts files/systems and demands payment for decryption keys.",
    behavior:
      "Targets backups, shares, and domain resources; may exfiltrate data first.",
    risk: "Severe operational downtime and data breach exposure.",
  },
  {
    title: "Spyware",
    summary: "Collects sensitive information without user consent.",
    behavior:
      "Monitors keystrokes, browser sessions, files, and system activity.",
    risk: "Credential theft, privacy loss, and account compromise.",
  },
  {
    title: "Rootkit",
    summary:
      "Stealth malware that hides malicious processes at deep system levels.",
    behavior: "Alters system calls, logs, or drivers to avoid detection.",
    risk: "Difficult remediation; often requires reimaging affected systems.",
  },
  {
    title: "Bot / Botnet Agent",
    summary: "Infected device becomes remotely controlled by an attacker.",
    behavior:
      "Used for DDoS, spam campaigns, credential stuffing, or crypto mining.",
    risk: "Turns many devices into coordinated attack infrastructure.",
  },
  {
    title: "Adware / Potentially Unwanted Programs",
    summary: "Displays aggressive ads or injects unwanted browser behavior.",
    behavior:
      "Bundles with free software and may alter browser/search settings.",
    risk: "Lower direct destruction, but can open paths to more serious malware.",
  },
];

type MalwareType = (typeof malwareTypes)[number];

const vectors = [
  "Phishing links and malicious attachments",
  "Drive-by downloads from compromised websites",
  "Fake software updates and cracked software bundles",
  "Unpatched operating systems and exposed services",
  "Infected USB/removable devices",
  "Weak credentials and brute-force remote access",
];

const indicators = [
  "Unexpected CPU, memory, or network spikes",
  "Unknown startup entries or scheduled tasks",
  "Disabled antivirus/EDR services",
  "Frequent crashes, freezes, or missing files",
  "Outbound connections to suspicious domains/IPs",
  "Unauthorized account activity or privilege changes",
];

const prevention = [
  {
    title: "Keep systems patched",
    detail:
      "Regularly update operating systems and applications to fix known vulnerabilities attackers exploit.",
  },
  {
    title: "Use MFA",
    detail:
      "Multi-factor authentication prevents unauthorized access even if credentials are compromised.",
  },
  {
    title: "Email filtering & training",
    detail:
      "Filter phishing emails and train users to recognize malicious attachments and links.",
  },
  {
    title: "Network segmentation",
    detail:
      "Limit lateral movement by isolating critical systems within separate network zones.",
  },
  {
    title: "Secure backups",
    detail:
      "Maintain offline or immutable backups to recover quickly from ransomware attacks.",
  },
  {
    title: "Layered detection",
    detail:
      "Combine signature-based, behavioral, and threat intelligence detection methods.",
  },
];

const responseSteps = [
  {
    title: "Identify",
    detail:
      "Confirm suspicious behavior, collect logs/artifacts, and classify severity.",
  },
  {
    title: "Contain",
    detail:
      "Isolate hosts/accounts, block known indicators, and stop lateral movement.",
  },
  {
    title: "Eradicate",
    detail:
      "Remove persistence mechanisms, malicious binaries, and compromised credentials.",
  },
  {
    title: "Recover",
    detail:
      "Restore clean systems from trusted backups and monitor for reinfection.",
  },
  {
    title: "Lessons Learned",
    detail:
      "Document root cause, improve controls, and update playbooks/training.",
  },
];

/* ===================== PAGE ===================== */

export default function AwarenessPage() {
  const [selected, setSelected] = useState<MalwareType | null>(null);

  return (
    <Section className="pt-16">
      <Container className="space-y-16">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 max-w-3xl"
        >
          <Badge className="bg-white/5 border border-white/10 gap-2">
            <GoogleIcon name="awareness" className="!size-4" />
            Cybersecurity Awareness
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight">
            Understanding Malware & Response Strategy
          </h1>

          <p className="text-white/60">
            Explore malware types, how attacks happen, and how to respond using
            structured cybersecurity workflows.
          </p>
        </motion.div>

        {/* MALWARE TYPES (CLICK → MODAL) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Malware Types</h2>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {malwareTypes.map((item) => (
              <div
                key={item.title}
                onClick={() => setSelected(item)}
                className="cursor-pointer rounded-xs border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition"
              >
                <p className="font-semibold text-cyan-400">{item.title}</p>
                <p className="text-sm text-white/60 mt-1 line-clamp-2">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <MalwareModal
          open={!!selected}
          setOpen={(open) => {
            if (!open) setSelected(null);
          }}
          data={selected}
        />

        {/* VECTORS + INDICATORS (TABS) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Attack Flow & Detection</h2>

          <ThreatTabs vectors={vectors} indicators={indicators} />
        </div>

        {/* PREVENTION (ACCORDION) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Prevention Strategies</h2>

          <Accordion items={prevention} />
        </div>

        {/* RESPONSE (STEPPER) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            Incident Response Lifecycle
          </h2>

          <ResponseStepper steps={responseSteps} />
        </div>

        {/* TAKEAWAY */}
        <div className="max-w-5xl space-y-3">
          <h2 className="text-xl font-semibold">Key Takeaway</h2>
          <p className="text-white/60 leading-relaxed">
            Effective cybersecurity is not just detection - it’s a continuous
            cycle of prevention, monitoring, response, and improvement.
          </p>
        </div>
      </Container>
    </Section>
  );
}
