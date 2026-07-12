import { CircleDot, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  "Register Asset",
  "Allocate Asset",
  "Transfer",
  "Maintenance",
  "Audit & Reports",
];

export default function Workflow() {
  return (
    <div id="workflow">
      <h2 className="text-lg font-semibold text-gray-900">Workflow</h2>
      <p className="mt-2 text-sm text-gray-600">Simple, auditable lifecycle for every asset.</p>

      <div className="mt-6 -mx-3 flex w-full flex-col items-center gap-6 overflow-x-auto px-3 sm:flex-row sm:items-start">
        {STEPS.map((s, idx) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="flex w-full max-w-xs flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <CircleDot className="text-sky-600" />
            </div>
            <div className="text-center text-sm font-medium text-gray-800">{s}</div>
            {idx < STEPS.length - 1 && (
              <div className="mt-2 hidden sm:block">
                <ArrowDown className="text-gray-300" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
