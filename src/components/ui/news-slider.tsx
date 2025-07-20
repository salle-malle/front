import NewsItem from "@/src/components/ui/news-item";

export interface NewsItemType {
  id: number;
  title: string;
  time: string;
}

interface NewsSliderProps {
  newsItems: NewsItemType[];
  newsIndex: number;
  isAnimating: boolean;
  onClick?: () => void;
}

export default function NewsSlider({
  newsItems,
  newsIndex,
  isAnimating,
  onClick,
}: NewsSliderProps) {
  return (
    <div
      className="relative flex items-center justify-center min-h-[60px] py-1"
      style={{ height: 60 }}
    >
      <div
        className="overflow-hidden w-full bg-white rounded-xl px-3 py-0 flex flex-col justify-center transition hover:scale-[1.03] cursor-pointer mx-auto"
        style={{ height: 40, justifyContent: "center" }}
        onClick={onClick}
      >
        <div className="relative w-full h-full" style={{ height: 30, overflow: "hidden" }}>
          <div
            className="absolute left-0 top-0 w-full"
            style={{
              height: 60,
              transition: isAnimating
                ? "transform 0.3s cubic-bezier(0.4,0,0.2,1)"
                : "none",
              transform: isAnimating ? "translateY(-30px)" : "translateY(0px)",
            }}
          >
            <NewsItem item={newsItems[newsIndex]} showArrow />
            <NewsItem item={newsItems[(newsIndex + 1) % newsItems.length]} />
          </div>
        </div>
      </div>
    </div>
  );
}
