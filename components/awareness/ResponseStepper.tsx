"use client";

import { useState } from "react";

type ResponseStep = {
  title: string;
  detail: string;
};

type ResponseStepperProps = {
  steps: ResponseStep[];
};

export default function ResponseStepper({ steps }: ResponseStepperProps) {
  const [active, setActive] = useState(0);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative flex items-center justify-between">
        {steps.map((step, i) => {
          const isActive = i === active;
          const isCompleted = i < active;

          return (
            <div
              key={step.title}
              className="relative z-10 flex flex-col items-center cursor-pointer flex-1"
              onClick={() => setActive(i)}
            >
              {/* Circle */}
              <div
                className={`size-8 flex items-center justify-center rounded-xs text-xs font-semibold transition
                ${
                  isActive
                    ? "bg-cyan-500 text-black border border-cyan-400/40"
                    : isCompleted
                      ? "bg-white/10 text-white"
                      : "bg-white/[0.05] text-white/40"
                }`}
              >
                {i + 1}
              </div>

              {/* Label */}
              <p
                className={`mt-2 text-xs text-center transition ${
                  isActive ? "text-white" : "text-white/50"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Content */}
      <div className="rounded-xs border border-white/10 bg-white/[0.03] p-6 space-y-3">
        <p className="text-xs text-cyan-400 font-medium">
          Step {active + 1} of {steps.length}
        </p>

        <h3 className="text-lg font-semibold text-white">
          {steps[active].title}
        </h3>

        <p className="text-sm text-white/60 leading-relaxed">
          {steps[active].detail}
        </p>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setActive((prev) => Math.max(prev - 1, 0))}
            disabled={active === 0}
            className="px-4 py-2 text-sm rounded-xs border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-30"
          >
            Previous
          </button>

          <button
            onClick={() =>
              setActive((prev) => Math.min(prev + 1, steps.length - 1))
            }
            disabled={active === steps.length - 1}
            className="px-4 py-2 text-sm rounded-xs bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
