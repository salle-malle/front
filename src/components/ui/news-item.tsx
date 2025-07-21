import type { NewsItem as NewsItemType } from "@/src/app/home/page";
export default function NewsItem({ item }: { item?: NewsItemType }) {

  if (!item || typeof item.title !== "string") {
    return (
      <div className="flex items-center w-full" style={{ height: 30 }}>
        <span className="font-medium text-xs text-[#9e9e9e] truncate" style={{ maxWidth: "70%" }}>
          뉴스 정보 없음
        </span>
        <span className="ml-auto flex items-center">
          <svg
            className="w-4 h-4 text-[#b0b8c1]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full" style={{ height: 30 }}>
      <span
        className="font-semibold text-xs text-[#222] truncate"
        style={{
          maxWidth: "70%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: "1.2",
        }}
      >
        {item.title}
      </span>
      <span className="ml-auto text-[11px] text-[#6b7684] whitespace-nowrap">
        {item.time ?? ""}
      </span>
      <span className="ml-auto flex items-center">
        <svg
          className="w-4 h-4 text-[#b0b8c1]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </div>
  );
}
