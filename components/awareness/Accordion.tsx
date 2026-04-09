"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionItem = {
  title: string;
  detail: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export default function Accordion({ items }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;

        return (
          <div
            key={`${item.title}-${i}`}
            className={`rounded-xs border border-white/10 bg-white/[0.03] transition ${
              isOpen ? "bg-white/[0.05]" : "hover:bg-white/[0.04]"
            }`}
          >
            {/* Header */}
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm font-medium text-white/90">
                {item.title}
              </span>

              <ChevronDown
                className={`size-4 transition-transform ${
                  isOpen ? "rotate-180 text-cyan-400" : "text-white/50"
                }`}
              />
            </button>

            {/* Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed">
                {item.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
