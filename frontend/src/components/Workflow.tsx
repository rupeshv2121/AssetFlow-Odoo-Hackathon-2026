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

      <div className="relative mt-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-4">
        <div className="absolute left-7 right-7 top-7 hidden h-0.5 bg-gradient-to-r from-sky-200 via-indigo-200 to-sky-200 sm:block" />
        {STEPS.map((s, idx) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="relative z-10 flex flex-1 flex-col items-center gap-3 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-md">
              {idx + 1}
            </div>
            <div className="text-sm font-medium text-gray-800">{s}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
