import { useEffect, useState } from "react";

function Counter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 900;
    const step = Math.max(1, Math.floor(end / (dur / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(id);
      }
      setValue(start);
    }, 16);
    return () => clearInterval(id);
  }, [end]);

  return (
    <div className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-3xl font-extrabold text-transparent">
        {value}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  );
}

// These describe what the system is built to guarantee, not claimed usage
// history — this is a hackathon build with no production traffic yet.
export default function Stats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Counter end={4} label="Role Types, Zero Self-Elevation" />
      <Counter end={7} label="Core Workflows Covered" />
      <Counter end={0} label="Double-Allocations, by Design" />
      <Counter end={24} suffix="/7" label="Real-Time Visibility" />
    </div>
  );
}
