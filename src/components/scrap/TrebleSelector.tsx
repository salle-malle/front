"use client";

import { useDrag } from "react-use-gesture";
import { useTransition, animated } from "react-spring";
import { ScrapGroupSelector } from "./ScrapGroupSelector";
import { ScrapDateSelector } from "./ScrapDateSelector";
import { ScrapStockSelector } from "./ScrapStockSelector";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";
import { ScrapGroup } from "@/src/types/ScrapGroup";
import { UnifiedStockResponse } from "@/src/types/ApiResponse";

interface TrebleSelectorProps {
  activeView: "date" | "stock";
  onViewChange: (view: "date" | "stock") => void;
  selectedGroupId?: number | null;
  onGroupSelect: (groupId: number | null) => void;
  groups: ScrapGroup[];
  onAddGroup?: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  snapshotsForDate: SnapshotCard[];
  selectedSnapshotId?: number;
  onStockChange: (snapshotId: number) => void;
  allowedDates?: string[];
  onStockEdge?: (direction: "left" | "right") => void;
  portfolio: { [stockCode: string]: UnifiedStockItem };
  onScrap: (snapshotId: number) => void;
  unifiedStocks?: UnifiedStockResponse | null;
  onStockClick?: (stockCode: string) => void;
}

const SELECTOR_HEIGHT = 90;

export const TrebleSelector = ({
  activeView,
  onViewChange,
  selectedGroupId,
  onGroupSelect,
  groups,
  onAddGroup,
  selectedDate,
  onDateChange,
  snapshotsForDate,
  selectedSnapshotId,
  onStockChange,
  allowedDates = [],
  onStockEdge,
  portfolio,
  onScrap,
  unifiedStocks,
  onStockClick,
}: TrebleSelectorProps) => {
  const dragDirection = useRef(1);



  const transitions = useTransition(activeView, {
    from: { y: dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: -dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  const bind = useDrag(
    ({ down, movement: [, my], direction: [, dy], cancel }) => {
      // '전체'가 선택되었을 때는 드래그 비활성화
      if (selectedGroupId === null) {
        console.log("=== TrebleSelector Drag Disabled ===");
        console.log("selectedGroupId is null, drag disabled");
        return;
      }
      
      if (!down && Math.abs(my) > SELECTOR_HEIGHT / 3) {
        console.log("=== TrebleSelector Drag ===");
        console.log("activeView:", activeView);
        console.log("selectedGroupId:", selectedGroupId);
        
        dragDirection.current = dy > 0 ? 1 : -1;
        
        if (dy > 0) {
          // 아래로 드래그: 다음 뷰로 (순환)
          if (activeView === "date") {
            console.log("Dragging to stock view");
            onViewChange("stock");
          } else if (activeView === "stock") {
            console.log("Dragging to date view");
            onViewChange("date"); // 순환
          }
        } else {
          // 위로 드래그: 이전 뷰로 (순환)
          if (activeView === "stock") {
            console.log("Dragging to date view");
            onViewChange("date");
          } else if (activeView === "date") {
            console.log("Dragging to stock view");
            onViewChange("stock"); // 순환
          }
        }
        if (cancel) cancel();
      }
    },
    { filterTaps: true, taps: true }
  );

  return (
    <div className="relative">
      {/* 뷰 전환 버튼 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => {
            // '전체'가 선택되었을 때는 뷰 전환 비활성화
            if (selectedGroupId === null) {
              return;
            }
            
            if (activeView === "date") {
              onViewChange("stock");
            } else {
              onViewChange("date");
            }
          }}
          className={`w-8 h-2 rounded-full transition-colors ${
            selectedGroupId === null
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
          }`}
          title={selectedGroupId === null ? "전체 선택 시 비활성화" : "뷰 전환"}
          disabled={selectedGroupId === null}
        />
      </div>
      
      <div
        className="relative bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ 
          height: SELECTOR_HEIGHT,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
        data-treble-selector="true"
        {...bind()}
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
              (() => {
                console.log("=== TrebleSelector DateSelector ===");
                console.log("selectedGroupId:", selectedGroupId);
                console.log("disabled:", selectedGroupId === null);
                return (
                  <ScrapDateSelector
                    selectedDate={selectedDate}
                    onDateSelect={onDateChange}
                    allowedDates={allowedDates}
                    disabled={selectedGroupId === null}
                  />
                );
              })()
            ) : (
              <ScrapStockSelector
                snapshots={snapshotsForDate}
                selectedSnapshotId={selectedSnapshotId}
                onStockSelect={onStockChange}
                onEdge={onStockEdge}
                portfolio={portfolio}
              />
            )}
          </animated.div>
        ))}
      </div>
    </div>
  );
};
