import React, { useState } from "react";

export default function ChartPeriodSelector() {
  const periods = ["1주", "1개월", "6개월", "1년"];
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex justify-center items-center px-4 pt-1 pb-0.5 border-b border-t border-gray-100 bg-gray-50 rounded-b-xl w-full" style={{ minHeight: "32px", borderTopColor: "#f3f4f6" }}>
      <div className="flex w-full max-w-xs">
        {periods.map((period, idx) => (
          <button
            key={period}
            onClick={() => setSelected(idx)}
            className={
              `flex-1 text-[11px] px-2 py-1 rounded-sm transition-colors` +
              (selected === idx
                ? " bg-gray-200 font-medium"
                : " text-gray-500 hover:text-gray-700 hover:bg-gray-200 focus:bg-gray-200") +
              (idx !== periods.length - 1 ? " border-r border-gray-200" : "") +
              (idx === 0 ? " first:border-l-0" : "")
            }
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}