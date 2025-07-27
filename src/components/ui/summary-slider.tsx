"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % summaries.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [summaries.length]);

  return (
    <div className="relative w-full h-[80px] overflow-hidden">
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateY(-${currentIndex * 80}px)`, // 한 문단 높이만큼 정확히
        }}>
        {summaries.map((summary) => (
          <div
            key={summary.id}
            className="h-[80px] px-2 flex flex-col justify-center">
            <h3 className="text-base font-semibold mb-1">{summary.title}</h3>
            <p className="text-sm text-gray-700">{summary.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
