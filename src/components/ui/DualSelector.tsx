"use client";

import { useDrag } from "react-use-gesture";
import { useTransition, animated } from "react-spring";
import { DateSelector } from "./DateSelector";
import { StockSelector } from "./StockSelector";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";
import { SnapshotCard } from "@/src/types/SnapshotCard";

interface DualSelectorProps {
  activeView: "date" | "stock";
  onViewChange: (view: "date" | "stock") => void;
  selectedDate: string;
  onDateChange: (date: string) => void; // 부모에서 내려오는 prop 이름은 onDateChange
  snapshotsForDate: SnapshotCard[];
  selectedSnapshotId?: number;
  onStockChange: (snapshotId: number) => void;
  allowedDates?: string[]; // 추가: 선택 가능한 날짜 목록
  onStockEdge?: (direction: "left" | "right") => void; // 추가
}

const SELECTOR_HEIGHT = 90;

export const DualSelector = ({
  activeView,
  onViewChange,
  selectedDate,
  onDateChange, // onDateChange를 받아서
  snapshotsForDate,
  selectedSnapshotId,
  onStockChange,
  allowedDates = [], // 기본값 빈 배열
  onStockEdge,
}: DualSelectorProps) => {
  // ... (내부 로직은 변경 없음) ...
  const dragDirection = useRef(1);

  const transitions = useTransition(activeView, {
    from: { y: dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: -dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  const bind = useDrag(
    ({ down, movement: [, my], direction: [, dy], cancel }) => {
      if (!down && Math.abs(my) > SELECTOR_HEIGHT / 3) {
        dragDirection.current = dy > 0 ? 1 : -1;
        if (dy > 0) {
          onViewChange("stock"); // 아래로 드래그: 종목
        } else {
          onViewChange("date"); // 위로 드래그: 달력
        }
        if (cancel) cancel();
      }
    },
    { filterTaps: true, taps: true }
  );

  return (
    <div
      {...bind()}
      className="relative bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ height: SELECTOR_HEIGHT }}
    >
      {transitions((style, view) => (
        <animated.div
          style={{
            ...style,
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          {view === "date" ? (
            <DateSelector
              selectedDate={selectedDate}
              onDateSelect={onDateChange} // DateSelector의 onDateSelect prop으로 전달
              allowedDates={allowedDates} // 추가
            />
          ) : (
            <StockSelector
              snapshots={snapshotsForDate}
              selectedSnapshotId={selectedSnapshotId}
              onStockSelect={onStockChange}
              onEdge={onStockEdge} // 추가
            />
          )}
        </animated.div>
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
        <MoreHorizontal />
      </div>
    </div>
  );
};
