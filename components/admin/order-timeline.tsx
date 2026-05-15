"use client";

import { motion } from "framer-motion";

const steps = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Dikonfirmasi" },
  { status: "shipped", label: "Dikirim" },
  { status: "done", label: "Selesai" },
];

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="flex items-start justify-between gap-1 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.status} className="flex items-center flex-1 min-w-0 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold sm:h-9 sm:w-9 ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2" : ""}`}
              >
                {i + 1}
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className={`mt-1.5 text-[10px] uppercase tracking-wider sm:text-xs ${
                  isCompleted ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </motion.span>
            </div>

            {!isLast && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.05, duration: 0.3 }}
                className={`mx-1 mb-5 h-0.5 flex-1 origin-left sm:mx-2 ${
                  i < currentIndex ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
