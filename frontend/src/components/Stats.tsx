import { useEffect, useState } from "react";

function Counter({ end, label }: { end: number; label: string }) {
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
    <div className="rounded-xl bg-white p-6 text-center shadow-sm">
      <div className="text-3xl font-extrabold text-gray-900">{value}{end > 999 ? "+" : ""}</div>
      <div className="mt-2 text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default function Stats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Counter end={500} label="Assets Managed" />
      <Counter end={25} label="Departments" />
      <Counter end={98} label="Allocation Accuracy (%)" />
      <Counter end={24} label="Availability (7/24)" />
    </div>
  );
}
