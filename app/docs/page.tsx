"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { GoogleIcon } from "@/components/ui/google-icon";

/* ================= DATA ================= */

const sections = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "setup", label: "Setup" },
  { id: "api", label: "API Reference" },
  { id: "interactive", label: "Interactive Docs" },
  { id: "response", label: "Response Format" },
  { id: "errors", label: "Error Handling" },
];

const architectureItems = [
  {
    name: "Frontend (Next.js)",
    description:
      "React-based UI with Tailwind CSS, handles file uploads and displays analysis results.",
  },
  {
    name: "Backend (FastAPI)",
    description:
      "Python async API that processes files, computes hashes, and orchestrates analysis.",
  },
  {
    name: "VirusTotal API",
    description:
      "External threat intelligence service for multi-engine file reputation.",
  },
];

const setupSteps = [
  "Clone the repository and install frontend dependencies with `npm install`",
  "Create `backend/.env` with your VirusTotal API key",
  "Install backend dependencies: `pip install -r requirements.txt`",
  "Start the backend: `uvicorn main:app --reload --port 8000`",
  "Start the frontend: `npm run dev`",
  "Visit `http://localhost:3000` to test the application",
];

const endpoints = [
  {
    method: "POST",
    path: "/api/scan",
    description: "Upload a file for malware analysis",
    request: "multipart/form-data with 'file' field",
    response: "Analysis verdict, confidence score, and threat details",
  },
  {
    method: "GET",
    path: "/api/health",
    description: "Check backend service status",
    request: "None",
    response: "Service health status and timestamp",
  },
];

const errorCodes = [
  { code: 400, meaning: "Bad Request - Invalid file or missing data" },
  { code: 413, meaning: "File Too Large - Exceeds size limit" },
  { code: 429, meaning: "Too Many Requests - Rate limit exceeded" },
  { code: 500, meaning: "Internal Server Error - Backend failure" },
];

/* ================= COMPONENTS ================= */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/40 hover:text-cyan-400 transition"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative rounded-lg border border-white/10 bg-[#0a0a0f] p-4">
      <div className="absolute top-3 right-3">
        <CopyButton text={code} />
      </div>
      <pre className="text-sm text-cyan-400 font-mono overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}

/* ================= PAGE ================= */

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const backendBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  const swaggerUrl = `${backendBase}/docs`;

  useEffect(() => {
    const handler = () => {
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 150 && rect.bottom > 150) {
            setActive(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Section className="pt-16">
      <Container className="grid lg:grid-cols-[260px_1fr] gap-12">
        {/* SIDEBAR */}
        <aside className="hidden lg:block sticky top-20 h-fit">
          <div className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm transition ${
                  active === s.id
                    ? "bg-white/[0.04] text-cyan-400 font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="space-y-16">
          {/* Overview */}
          <section id="overview" className="space-y-4 scroll-mt-20">
            <Badge className="bg-white/5 border border-white/10">
              Documentation
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight">
              CyberScan Developer Guide
            </h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Complete reference for integrating with the CyberScan malware
              analysis platform.
            </p>
          </section>

          {/* Architecture */}
          <section id="architecture" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">Architecture Overview</h2>
            <p className="text-white/60">
              CyberScan follows a modern client-server architecture with
              external threat intelligence integration.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {architectureItems.map((item) => (
                <div
                  key={item.name}
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02]"
                >
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Setup */}
          <section id="setup" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">Setup Instructions</h2>
            <div className="space-y-3">
              {setupSteps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-cyan-400 font-mono text-sm w-6">
                    {idx + 1}.
                  </span>
                  <p className="text-white/70 text-sm">{step}</p>
                </div>
              ))}
            </div>
            <CodeBlock
              code={`# .env example
VIRUSTOTAL_API_KEY=your_api_key_here
MAX_FILE_SIZE=10485760`}
            />
          </section>

          {/* API Reference */}
          <section id="api" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">API Reference</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="border border-white/10 rounded-xl overflow-hidden"
                >
                  <div className="bg-white/[0.02] px-5 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-white/80">
                        {endpoint.path}
                      </code>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-white/70 text-sm">
                      {endpoint.description}
                    </p>
                    <p className="text-xs text-white/40">
                      <span className="font-medium">Request:</span>{" "}
                      {endpoint.request}
                    </p>
                    <p className="text-xs text-white/40">
                      <span className="font-medium">Response:</span>{" "}
                      {endpoint.response}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Docs */}
          <section id="interactive" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">
              Interactive API Documentation
            </h2>
            <p className="text-white/60">
              FastAPI generates interactive Swagger documentation automatically.
              Once your backend is running, access it at:
            </p>
            <a
              href={swaggerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/5 px-5 py-3 hover:bg-cyan-400/10 transition group"
            >
              <code className="text-cyan-400 font-mono text-sm">
                {swaggerUrl}
              </code>
              <span className="text-cyan-400/60 group-hover:text-cyan-400">
                →
              </span>
            </a>
            <p className="text-sm text-white/40">
              The interactive docs allow you to test endpoints directly from
              your browser. Try the{" "}
              <code className="text-cyan-400">/api/scan</code> endpoint with a
              test file.
            </p>
            <CodeBlock
              code={`# Start your backend first
cd backend
uvicorn main:app --reload --port 8000

# Then open in browser
open http://127.0.0.1:8000/docs`}
            />
          </section>

          {/* Response Format */}
          <section id="response" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">Response Format</h2>
            <p className="text-white/60">
              Successful scan requests return the following structure:
            </p>
            <CodeBlock
              language="json"
              code={`{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "verdict": "malicious",
    "confidence_score": 87,
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "summary": "High-confidence malicious indicators detected",
    "scan_timestamp": "2024-01-15T10:30:00Z"
  }
}`}
            />
            <div className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
              <p className="text-sm">
                <span className="text-cyan-400">verdict</span> — One of:{" "}
                <code className="text-xs">clean</code>,{" "}
                <code className="text-xs">suspicious</code>,{" "}
                <code className="text-xs">malicious</code>
              </p>
              <p className="text-sm mt-2">
                <span className="text-cyan-400">confidence_score</span> —
                Integer from 0 to 100 indicating detection confidence
              </p>
            </div>
          </section>

          {/* Error Handling */}
          <section id="errors" className="space-y-5 scroll-mt-20">
            <h2 className="text-2xl font-semibold">Error Handling</h2>
            <div className="space-y-2">
              {errorCodes.map((err) => (
                <div
                  key={err.code}
                  className="flex flex-wrap gap-3 border-b border-white/5 py-3"
                >
                  <span className="text-red-400 font-mono text-sm w-16">
                    {err.code}
                  </span>
                  <span className="text-white/60 text-sm">{err.meaning}</span>
                </div>
              ))}
            </div>
            <CodeBlock
              code={`{
  "success": false,
  "error": {
    "code": 413,
    "message": "File too large. Maximum size is 10MB."
  }
}`}
            />
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/30">
            CyberScan — Educational malware analysis platform
          </div>
        </main>
      </Container>
    </Section>
  );
}
