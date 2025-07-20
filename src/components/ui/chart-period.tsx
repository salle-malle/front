export default function ChartPeriodSelector() {
    const periods = ["1주", "1개월", "6개월", "1년"];
    return (
      <div className="flex justify-center items-center px-4 pt-1 pb-0.5 border-b border-t border-gray-100 bg-gray-50 rounded-b-xl w-full" style={{ minHeight: "32px", borderTopColor: "#f3f4f6" }}>
        <div className="flex w-full max-w-xs">
          {periods.map((period, idx) => (
            <button
              key={period}
              className={`flex-1 text-[11px] px-2 py-1 rounded-none text-gray-500 hover:text-black hover:bg-gray-200 focus:bg-gray-200 transition-colors${idx !== periods.length - 1 ? " border-r border-gray-200" : ""}${idx === 0 ? " first:border-l-0" : ""}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    );
  }
  ``