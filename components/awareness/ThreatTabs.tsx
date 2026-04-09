"use client";

import { useState } from "react";

type ThreatTabsProps = {
  vectors: string[];
  indicators: string[];
};

type ThreatTab = "vectors" | "indicators";

export default function ThreatTabs({ vectors, indicators }: ThreatTabsProps) {
  const [tab, setTab] = useState<ThreatTab>("vectors");

  const data = tab === "vectors" ? vectors : indicators;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setTab("vectors")}
          className={`px-4 py-2 rounded-xs text-sm transition ${
            tab === "vectors"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-white/60 hover:text-white"
          }`}
        >
          Vectors
        </button>

        <button
          onClick={() => setTab("indicators")}
          className={`px-4 py-2 rounded-xs text-sm transition ${
            tab === "indicators"
              ? "bg-cyan-500/20 text-cyan-300"
              : "text-white/60 hover:text-white"
          }`}
        >
          Indicators
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item) => (
          <div
            key={item}
            className="flex items-center justify-center rounded-xs lg:h-[10vh] border border-white/10 bg-white/[0.02] p-3 text-sm text-white/70"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
