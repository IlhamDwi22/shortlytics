"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

export interface FaqItem {
  id: string;
  index: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-pricing",
    index: "01",
    question: "Is Shortlytics free to use?",
    answer:
      "Yes — Shortlytics is 100% free and open source, with no hidden paywall or paid tiers. Every core feature, from instant link shortening to real-time analytics streaming, is fully accessible for free, whether you use it without an account or with a registered one.",
  },
  {
    id: "faq-analytics",
    index: "02",
    question: "What analytics can I see for each link?",
    answer:
      "You get granular telemetry covering total clicks, daily clicks, top referrer domains (direct, X, Instagram, WhatsApp, etc.), operating system and device-type breakdowns (mobile, desktop, tablet), and visitor country of origin. Every metric is presented interactively with live counters and comprehensive bar charts.",
  },
  {
    id: "faq-realtime",
    index: "03",
    question: "How real-time is the analytics? Is there any delay?",
    answer:
      "Analytics run live with ~0.0s latency thanks to a Server-Sent Events (SSE) architecture that pushes straight from the server to your browser. No manual polling or page refreshes — the moment a link is clicked anywhere in the world, the metrics on your dashboard update automatically.",
  },
  {
    id: "faq-privacy",
    index: "04",
    question: "Are visitor IP addresses safe and kept private?",
    answer:
      "Yes. Shortlytics applies strict privacy masking to every IP address before it is stored, so individual visitors cannot be personally tracked. Public data only shows country, device, and referrer aggregates and never exposes PII (Personally Identifiable Information).",
  },
  {
    id: "faq-limits",
    index: "05",
    question: "Is there a limit on how many links I can create?",
    answer:
      "There is no artificial quota on the total number of links you can keep in your account. To keep infrastructure available and guard against spam or abuse, we apply smart rate limiting backed by Upstash Redis per IP (up to 20 new-link requests per minute).",
  },
  {
    id: "faq-security",
    index: "06",
    question: "How does Shortlytics prevent redirect loops and malicious links?",
    answer:
      "The system validates protocol schemes (only http:// and https:// are allowed, blocking dangerous schemes like javascript:) and automatically rejects URLs pointing back to Shortlytics' own domain to prevent infinite looping. Every short code is generated with a 7-character Base62 CSPRNG, giving 62⁷ (3.5 trillion) collision-free combinations.",
  },
];

interface FaqAccordionProps {
  className?: string;
  defaultValue?: string[];
}

export function FaqAccordion({
  className,
  defaultValue = ["faq-pricing"],
}: FaqAccordionProps) {
  return (
    <Accordion
      defaultValue={defaultValue}
      className={cn("w-full space-y-3.5", className)}
    >
      {FAQ_ITEMS.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="group rounded-xl border border-border/70 bg-card/40 backdrop-blur-sm px-5 sm:px-6 transition-all duration-200 hover:border-lime-400/40 hover:bg-card/70 data-[panel-open]:border-lime-400/40 data-[panel-open]:bg-card/80"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex items-center gap-3.5 text-left pr-4">
              <span
                className={cn(
                  MONO,
                  "text-xs font-semibold text-lime-400/80 shrink-0 select-none group-hover:text-lime-300"
                )}
              >
                [{item.index}]
              </span>
              <span className="font-display text-base sm:text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-lime-300">
                {item.question}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-5 pl-7 sm:pl-9 text-sm sm:text-base leading-relaxed text-muted-foreground/90">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
