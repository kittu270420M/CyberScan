"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/common/Container";
import { Section } from "@/components/common/Section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GoogleIcon } from "@/components/ui/google-icon";
import { api } from "@/lib/axios";

type ScanResponse = {
  verdict: "clean" | "suspicious" | "malicious";
  score: number;
  summary: string;
  threat_breakdown: {
    malicious: number;
    suspicious: number;
    harmless: number;
  };
  engine_results: {
    engine: string;
    result: string;
  }[];
  recommendations: string[];
  filename?: string;
  size_human?: string;
  file_extension?: string;
  mime_type?: string;
  file_type_description?: string;
  sha256?: string;
  scanned_at?: string;
  indicators?: {
    severity: "low" | "medium" | "high";
    title: string;
    detail: string;
  }[];
  virustotal?: {
    available: boolean;
    source: "hash_lookup" | "uploaded" | "unavailable";
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    timeout: number;
    failure_reason?: string | null;
    permalink?: string | null;
  };
};

type ScanStepState = "pending" | "running" | "done" | "skipped";

type ScanStep = {
  key: "init" | "sha256" | "filetype" | "vt_lookup" | "heuristic" | "report";
  label: string;
  state: ScanStepState;
  reason?: string;
};

type UiStep = 1 | 2 | 3;

type HistoryItem = {
  id: string;
  filename: string;
  verdict: ScanResponse["verdict"];
  score: number;
  scannedAt: string;
  summary: string;
};

const HISTORY_KEY = "cyberscan-local-history-v2";

function loadHistoryFromStorage(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createScanSteps(): ScanStep[] {
  return [
    { key: "init", label: "Initializing scan engine", state: "pending" },
    { key: "sha256", label: "Generating SHA256 hash", state: "pending" },
    { key: "filetype", label: "Detecting true file type", state: "pending" },
    { key: "vt_lookup", label: "Querying threat intelligence", state: "pending" },
    { key: "heuristic", label: "Running heuristic analysis", state: "pending" },
    { key: "report", label: "Building detailed report", state: "pending" },
  ];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(iso: string) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString();
}

function errorMessage(error: unknown): { title: string; reason: string } {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detailRaw = error.response?.data as { detail?: unknown } | undefined;
    const detail =
      typeof detailRaw?.detail === "string"
        ? detailRaw.detail
        : Array.isArray(detailRaw?.detail)
          ? detailRaw.detail.map((d) => JSON.stringify(d)).join(" | ")
          : "No backend detail provided.";

    if (status === 413) {
      return {
        title: "File rejected: size exceeds server limit.",
        reason: detail,
      };
    }

    if (status === 422) {
      return {
        title: "Upload payload was invalid (422).",
        reason:
          `${detail} Check whether the request includes multipart form field named \"file\".`,
      };
    }

    if (status === 400) {
      return {
        title: "Bad request sent to scan endpoint.",
        reason: detail,
      };
    }

    if (status && status >= 500) {
      return {
        title: "Backend processing failure.",
        reason: detail,
      };
    }

    if (!error.response) {
      return {
        title: "Backend is unreachable.",
        reason:
          "No response received. Ensure FastAPI is running and NEXT_PUBLIC_API_BASE_URL points to the backend.",
      };
    }

    return {
      title: `Scan failed with HTTP ${status}.`,
      reason: detail,
    };
  }

  return {
    title: "Unexpected scan exception.",
    reason: "Unknown error type was thrown during scan.",
  };
}

export default function ScanPage() {
  const [uiStep, setUiStep] = useState<UiStep>(1);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<{ title: string; reason: string } | null>(null);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>(createScanSteps());
  const [dragActive, setDragActive] = useState(false);
const [history, setHistory] = useState<HistoryItem[]>([]);
useEffect(() => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      setHistory(parsed);
    }
  } catch {
    // ignore
  }
}, []);
  const [mode, setMode] = useState<"file" | "url">("file");
const [url, setUrl] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore history save failures.
    }
  }, [history]);

  const fileInfo = useMemo(() => {
    if (!file) return "No file selected";
    const kb = file.size / 1024;
    const pretty = kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
    return `${file.name} (${pretty})`;
  }, [file]);

  const setStepState = (key: ScanStep["key"], state: ScanStepState, reason?: string) => {
    setScanSteps((prev) => prev.map((s) => (s.key === key ? { ...s, state, reason } : s)));
  };

  const markRemainingSkipped = (reason: string) => {
    setScanSteps((prev) =>
      prev.map((s) => (s.state === "done" ? s : { ...s, state: "skipped", reason: s.reason ?? reason })),
    );
  };

  async function runVisualPipeline() {
    const ordered: Array<ScanStep["key"]> = ["init", "sha256", "filetype", "vt_lookup", "heuristic"];
    for (const key of ordered) {
      setStepState(key, "running");
      await sleep(300);
      if (key !== "vt_lookup") {
        setStepState(key, "done");
      }
    }
  }

  function addToHistory(data: ScanResponse) {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      filename: data.filename ?? file?.name ?? "unknown-file",
      verdict: data.verdict,
      score: data.score,
      scannedAt: data.scanned_at ?? new Date().toISOString(),
      summary: data.summary,
    };
    setHistory((prev) => [item, ...prev].slice(0, 12));
  }

  async function startScan() {
  if (mode === "file" && !file) return;
  if (mode === "url" && !url) return;

  setUiStep(2);
  setError(null);
  setResult(null);
  setScanSteps(createScanSteps());

  try {
    let request;

    if (mode === "file") {
      const formData = new FormData();
      formData.append("file", file!);

      request = api.post("/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      request = api.post("/scan-url", { url });
    }

    const [response] = await Promise.all([
      request,
      runVisualPipeline(),
    ]);

    const data = response.data;

    // same logic continues...
    setResult(data);
    addToHistory(data);
    setUiStep(3);
  } catch (err) {
    const parsed = errorMessage(err);
    markRemainingSkipped(parsed.reason);
    setError(parsed);
  }
}

  function resetToUpload() {
    setUiStep(1);
    setResult(null);
    setError(null);
    setScanSteps(createScanSteps());
    setDragActive(false);
  }

  function scanAnotherFile() {
    setFile(null);
    resetToUpload();
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const verdictColor =
    result?.verdict === "malicious"
      ? "text-red-300 border-red-400/20 bg-red-400/10"
      : result?.verdict === "suspicious"
        ? "text-yellow-300 border-yellow-400/20 bg-yellow-400/10"
        : "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";

  const checkedPoints = [
    "SHA256 fingerprint generation",
    "File type and MIME inspection",
    "Threat-intelligence lookup",
    "Heuristic risk scoring",
    "Multi-engine signal normalization",
  ];

  const likelyNot =
    result?.verdict === "malicious"
      ? ["Not a harmless file", "Not safe to execute in production", "Not suitable for trusted distribution"]
      : result?.verdict === "suspicious"
        ? ["Not confidently clean", "Not safe for immediate allow-listing", "Not ready for production execution"]
        : ["Not strongly linked to known malware signatures", "Not currently flagged as high-risk", "Not requiring emergency containment based on current data"];

  const whatToDo =
    result?.recommendations?.length
      ? result.recommendations
      : [
          "Store SHA256 for future correlation.",
          "Review endpoint/network telemetry around upload origin.",
          "Escalate to deeper sandbox analysis if uncertain.",
        ];

  return (
    <Section className="pt-16">
      <Container className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-3">
          <Badge className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5">
            <GoogleIcon name="science" className="!size-4" />
            Cyber Analysis Engine
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Malware Scan Console</h1>
          <p className="max-w-3xl text-sm text-white/60">
            3-step workflow: upload, scan execution, and detailed report. Local history is shown only at upload stage.
          </p>

<div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 pt-1 text-sm">
            <span className={`rounded-xs border px-4 py-1 ${uiStep === 1 ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/45"}`}>
              1. Upload
            </span>
            <span className={`rounded-xs border px-4 py-1 ${uiStep === 2 ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/45"}`}>
              2. Scan & Validate
            </span>
            <span className={`rounded-xs border px-4 py-1 ${uiStep === 3 ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/45"}`}>
              3. Detailed Result
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <Button
              variant={mode === "file" ? "default" : "outline"}
              onClick={() => setMode("file")}
              className="rounded-xs border px-5 py-0 h-8"
            >
              File
            </Button>

            <Button
              variant={mode === "url" ? "default" : "outline"}
              onClick={() => setMode("url")}
              className="rounded-xs border px-5 py-0 h-8"
            >
              URL
            </Button>
        </div>
</div>
        </div>

        <AnimatePresence mode="wait">
          {uiStep === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    className="space-y-4"
  >
    <Card className="rounded-xs border border-white/10 bg-white/[0.03] p-5">

      {/*FILE MODE */}
      {mode === "file" ? (
        <>
          <div
            className={`rounded-xs border border-dashed p-8 text-center transition ${
              dragActive
                ? "border-cyan-400/40 bg-cyan-500/8"
                : "border-white/15 bg-white/[0.02]"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="scan-file-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="scan-file-upload" className="cursor-pointer">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xs bg-cyan-500/10">
                <GoogleIcon
                  name="upload"
                  className="!size-6 text-cyan-300"
                />
              </div>
              <p className="text-sm font-medium text-white/90">
                {file
                  ? "Change selected file"
                  : "Drop file here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-white/45">
                All file types supported. Max size currently 100 MB.
              </p>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
            <p className="inline-flex items-center gap-2 text-white/60">
              <GoogleIcon name="file" className="!size-4 text-cyan-300" />
              {fileInfo}
            </p>

            <div className="flex gap-2">
              <Button
                className="gap-2"
                onClick={startScan}
                disabled={!file}
              >
                <GoogleIcon name="scan" className="!size-4" />
                Start Scan
              </Button>

              <Button variant="outline" onClick={scanAnotherFile}>
                Reset
              </Button>
            </div>
          </div>
        </>
      ) : (
        /*URL MODE */
        <>
          <div className="rounded-xs border border-white/15 bg-white/[0.02] p-6">
            <p className="text-sm text-white/60 mb-2">
              Enter URL to scan
            </p>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xs bg-black/40 border border-white/10 px-3 py-2 text-sm text-white outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={startScan} disabled={!url}>
                Scan URL
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>

    {/* 🔥 HISTORY (unchanged) */}
    {history.length > 0 ? (
      <Card className="rounded-xs border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Local Scan History</p>
          <div className="flex gap-2">
            <p className="text-xs text-white/45">Browser-only storage</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistory([])}
            >
              <GoogleIcon name="delete" className="!size-4" />
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xs border border-white/8 bg-white/[0.02] p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white/80">
                  {item.filename}
                </p>
                <span className="text-white/55">
                  {item.score}/100
                </span>
              </div>
              <p className="mt-1 text-white/45">
                {formatDate(item.scannedAt)}
              </p>
              <p className="mt-1 text-white/60">{item.summary}</p>
            </div>
          ))}
        </div>
      </Card>
    ) : null}
  </motion.div>
)}

          {uiStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <Card className="rounded-xs border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-cyan-300">Scan Execution</p>
                  <Button variant="outline" size="sm" onClick={resetToUpload}>Back</Button>
                </div>

                <div className="space-y-3">
                  {scanSteps.map((s) => (
                    <div key={s.key} className="rounded-xs border border-white/8 bg-white/[0.02] p-3">
                      <div className="flex items-start gap-2 text-sm">
                        {s.state === "done" ? (
                          <GoogleIcon name="check_circle" className="!size-4 text-emerald-400" />
                        ) : s.state === "running" ? (
                          <GoogleIcon name="analytics" className="!size-4 text-cyan-300" />
                        ) : s.state === "skipped" ? (
                          <GoogleIcon name="warning" className="!size-4 text-yellow-300" />
                        ) : (
                          <GoogleIcon name="flow" className="!size-4 text-white/30" />
                        )}
                        <div className="flex-1">
                          <p className={s.state === "pending" ? "text-white/35" : "text-white/80"}>{s.label}</p>
                          {s.state === "skipped" && s.reason ? (
                            <p className="mt-1 text-xs text-yellow-200/85">Why skipped: {s.reason}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {error ? (
                  <div className="mt-4 rounded-xs border border-red-400/20 bg-red-400/10 p-3 text-sm">
                    <p className="font-medium text-red-300">{error.title}</p>
                    <p className="mt-1 text-red-200/90">Reason: {error.reason}</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={startScan} disabled={!file}>Retry</Button>
                      <Button variant="outline" size="sm" onClick={resetToUpload}>Back To Upload</Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            </motion.div>
          )}

          {uiStep === 3 && result && (
  <motion.div
    key="step3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <Card className="rounded-xs border border-white/10 bg-white/[0.03] p-6">
      {/* Header – unchanged style */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/45">Detailed Results Summary</p>
          <h2 className="mt-1 text-2xl font-semibold">Scan Report</h2>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-xs border px-3 py-1 text-sm font-medium capitalize ${verdictColor}`}
        >
          <GoogleIcon
            name={
              result.verdict === "malicious"
                ? "malware"
                : result.verdict === "suspicious"
                ? "warning"
                : "verified"
            }
            className="!size-4"
          />
          {result.verdict}
        </span>
      </div>

      {/* Summary & Risk Score – side by side, more compact */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-xs border border-white/10 bg-white/[0.02] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-white/45">
          Summary
        </p>
        <p className="mt-1 text-sm text-white/70 leading-relaxed">
          {result.verdict === "malicious"
            ? "This file should be handled as high-risk. Quarantine or isolate systems involved and investigate related indicators immediately."
            : result.verdict === "suspicious"
            ? "This file has risk signals but is not conclusive. Run deeper sandbox or manual triage before trusting execution."
            : "No strong malicious evidence was found in current signals. Continue monitoring and keep telemetry for future correlation."}
        </p>
        </div>
        <div className="rounded-xs border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wide text-white/45">Risk Score</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl font-semibold text-white/90">
              {result.score}
            </span>
            <span className="text-sm text-white/45">/ 100</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-xs bg-white/10">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {result.score >= 70
              ? "High risk – immediate action recommended"
              : result.score >= 30
              ? "Moderate risk – further review advised"
              : "Low risk – no immediate concern"}
          </p>
        </div>
      </div>

      {/* File Profile – compact grid, no extra icons */}
      {mode === "file" ? (
  /* EXISTING FILE PROFILE (keep your current one) */
  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xs border border-white/10 bg-white/[0.02] p-4 text-sm">
    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">Name</span>
      <span className="text-white/80 truncate max-w-[180px]">
        {result.filename ?? file?.name ?? "Unknown"}
      </span>
    </div>
    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">Size</span>
      <span className="text-white/80">{result.size_human ?? "N/A"}</span>
    </div>
    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">MIME</span>
      <span className="text-white/80">{result.mime_type ?? "N/A"}</span>
    </div>
    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">Type</span>
      <span className="text-white/80">
        {result.file_type_description ?? "N/A"}
      </span>
    </div>
    <div className="flex justify-between pt-1">
      <span className="text-white/45">SHA-256</span>
      <span className="font-mono text-white/80">
        {result.sha256 ? `${result.sha256.slice(0, 12)}...` : "N/A"}
      </span>
    </div>
    <div className="flex justify-between pt-1">
      <span className="text-white/45">Hash</span>
      <span className="font-mono text-white/80">
        {result.sha256 ? `${result.sha256.slice(-8)}` : "N/A"}
      </span>
    </div>
  </div>
) : (
  /* 🔥 URL PROFILE */
  <div className="mt-4 rounded-xs border border-white/10 bg-white/[0.02] p-4 text-sm space-y-2">

    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">URL</span>
      <span className="text-white/80 truncate max-w-[220px]">
        {url}
      </span>
    </div>

    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">Domain</span>
      <span className="text-white/80">
        {(() => {
          try {
            return new URL(url).hostname;
          } catch {
            return "Invalid URL";
          }
        })()}
      </span>
    </div>

    <div className="flex justify-between border-b border-white/10 pb-1">
      <span className="text-white/45">Protocol</span>
      <span className="text-white/80">
        {url.startsWith("https") ? "HTTPS" : "HTTP"}
      </span>
    </div>

    <div className="flex justify-between pt-1">
      <span className="text-white/45">Scan Type</span>
      <span className="text-white/80">URL Analysis</span>
    </div>

  </div>
)}

      {/* Two-column analysis (checked + likely not) */}
<div className="mt-4 grid gap-4 md:grid-cols-2">
  <div className="rounded-xs border border-white/10 bg-white/[0.02] p-3">
    <p className="text-sm font-medium uppercase tracking-wide text-white/45">
      What we checked
    </p>
    <div className="mt-2 space-y-1 text-sm text-white/65">
      {checkedPoints.map((p) => (
        <p key={p} className="flex items-start gap-1.5">
          <span className="text-cyan-400 select-none">—</span>
          <span>{p}</span>
        </p>
      ))}
    </div>
  </div>

  <div className="rounded-xs border border-white/10 bg-white/[0.02] p-3">
    <p className="text-sm font-medium uppercase tracking-wide text-white/45">
      What it likely is not
    </p>
    <div className="mt-2 space-y-1 text-sm text-white/65">
      {likelyNot.map((p) => (
        <p key={p} className="flex items-start gap-1.5">
          <span className="text-emerald-400 select-none">—</span>
          <span>{p}</span>
        </p>
      ))}
    </div>
  </div>
</div>

{/* What to do next – each point as a separate block */}
<div className="mt-4">
  <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/45">
    What to do next
  </p>
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {whatToDo.map((point) => (
      <div
        key={point}
        className="rounded-xs border border-white/10 bg-white/[0.02] p-3 text-sm text-white/65"
      >
        <span className="text-amber-400 select-none mr-1.5">—</span>
        {point}
      </div>
    ))}
  </div>
</div>
      {/* Buttons – unchanged */}
      <div className="mt-5 flex gap-2">
        <Button onClick={scanAnotherFile} className="gap-2">
          <GoogleIcon name="scan" className="!size-4" />
          Scan Another File
        </Button>
        <Button variant="outline" onClick={resetToUpload}>
          Back To Upload
        </Button>
      </div>
    </Card>
  </motion.div>
)}
        </AnimatePresence>
      </Container>
    </Section>
  );
}
