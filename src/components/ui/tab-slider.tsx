
export default function TabSelector({
    tab,
    setTab,
  }: {
    tab: "공시" | "어닝콜";
    setTab: (tab: "공시" | "어닝콜") => void;
  }) {
    return (
      <div className="flex justify-center items-center px-4 pt-1 pb-0.5 border-b border-t border-gray-100 bg-gray-50 rounded-b-xl w-full" style={{ minHeight: "32px", borderTopColor: "#f3f4f6" }}>
        <div className="flex w-full max-w-xs">
          <button
            className={`flex-1 text-[11px] px-2 py-1 rounded-none ${
              tab === "공시" ? "text-gray-600 font-bold bg-gray-200 rounded-sm" : "text-gray-500"
            } hover:text-black hover:bg-gray-200 hover:rounded-sm focus:bg-gray-200 transition-colors border-r border-gray-200 first:border-l-0`}
            onClick={() => setTab("공시")}
            type="button"
          >
            공시
          </button>
          <button
            className={`flex-1 text-[11px] px-2 py-1 rounded-none ${
              tab === "어닝콜" ? "text-gray-600 font-bold bg-gray-200 rounded-sm" : "text-gray-500"
            } hover:text-black hover:bg-gray-200 hover:rounded-sm focus:bg-gray-200 transition-colors border-gray-200`}
            onClick={() => setTab("어닝콜")}
            type="button"
          >
            어닝콜
          </button>
        </div>
      </div>
    );
  }