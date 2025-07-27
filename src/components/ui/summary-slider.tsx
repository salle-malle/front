"use client";

import { useEffect, useState, useRef } from "react";

export type SummaryItem = {
  id: number;
  title: string;
  content: string;
};

interface SummarySliderProps {
  summaries: SummaryItem[];
}

export default function SummarySlider({ summaries }: SummarySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // 각 아이템의 실제 높이 측정
    const heights = itemRefs.current.map(ref => ref?.offsetHeight || 0);
    setItemHeights(heights);
  }, [summaries]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % summaries.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [summaries.length]);

  // 현재 인덱스까지의 누적 높이 계산
  const getTransformValue = () => {
    if (itemHeights.length === 0) return 0;
    return itemHeights.slice(0, currentIndex).reduce((sum, height) => sum + height, 0);
  };

  return (
    <div className="relative w-full min-h-[80px] max-h-[120px] overflow-hidden">
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateY(-${getTransformValue()}px)`,
        }}>
        {summaries.map((summary, index) => (
          <div
            key={summary.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="min-h-[80px] max-h-[120px] px-2 py-3 flex flex-col justify-center">
            <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-1">
              {summary.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-3 leading-relaxed">
              {summary.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
