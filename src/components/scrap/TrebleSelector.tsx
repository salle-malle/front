"use client";

import { useDrag } from "react-use-gesture";
import { useTransition, animated } from "react-spring";
import { ScrapGroupSelector } from "./ScrapGroupSelector";
import { ScrapDateSelector } from "./ScrapDateSelector";
import { ScrapStockSelector } from "./ScrapStockSelector";
import { ScrapStockList } from "./ScrapStockList";
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
  hasStockSnapshots?: boolean; // 종목 스크랩이 있는지 확인하는 prop 추가
  selectedStockCode?: string | null; // 선택된 종목 코드 추가
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
  hasStockSnapshots = false, // 기본값 false
  selectedStockCode = null, // 기본값 null
}: TrebleSelectorProps) => {
  const dragDirection = useRef(1);



  const transitions = useTransition(activeView, {
    from: { y: dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: -dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  // 셀렉터 비활성화 조건 - 종목이 선택되었거나 그룹이 선택되었으면 활성화
  const isSelectorDisabled = selectedGroupId === null && selectedStockCode === null;

  const bind = useDrag(
    ({ down, movement: [, my], direction: [, dy], cancel }) => {
      // 드래그 비활성화 조건 확인
      if (isSelectorDisabled) {
        return;
      }
      
      // 드래그가 끝났고 충분한 거리를 이동했을 때만 뷰 전환
      if (!down && Math.abs(my) > SELECTOR_HEIGHT / 3) {
        dragDirection.current = dy > 0 ? 1 : -1;
        
        // 종목이 선택된 상태에서는 ScrapDateSelector와 ScrapStockSelector만 번갈아가며 전환
        if (selectedStockCode !== null) {
          if (dy > 0) {
            // 아래로 드래그
            if (activeView === "date") {
              onViewChange("stock");
            } else if (activeView === "stock") {
              onViewChange("date");
            }
          } else {
            // 위로 드래그
            if (activeView === "stock") {
              onViewChange("date");
            } else if (activeView === "date") {
              onViewChange("stock");
            }
          }
        } else {
          // 종목이 선택되지 않은 상태에서는 date와 stock만 번갈아가며 전환
          if (dy > 0) {
            // 아래로 드래그: 다음 뷰로 (순환)
            if (activeView === "date") {
              onViewChange("stock");
            } else if (activeView === "stock") {
              onViewChange("date"); // 순환
            }
          } else {
            // 위로 드래그: 이전 뷰로 (순환)
            if (activeView === "date") {
              onViewChange("stock");
            } else if (activeView === "stock") {
              onViewChange("date");
            }
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
            if (isSelectorDisabled) {
              return;
            }
            
            // 종목이 선택된 상태에서는 ScrapDateSelector와 ScrapStockSelector만 번갈아가며 전환
            if (selectedStockCode !== null) {
              if (activeView === "date") {
                onViewChange("stock");
              } else {
                onViewChange("date");
              }
            } else {
              // 종목이 선택되지 않은 상태에서는 date와 stock만 번갈아가며 전환
              if (activeView === "date") {
                onViewChange("stock");
              } else {
                onViewChange("date");
              }
            }
          }}
          className={`w-8 h-2 rounded-full transition-colors ${
            isSelectorDisabled
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400 cursor-pointer"
          }`}
          title={isSelectorDisabled ? "전체 선택 시 비활성화" : "뷰 전환"}
          disabled={isSelectorDisabled}
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
              <ScrapDateSelector
                selectedDate={selectedDate}
                onDateSelect={onDateChange}
                allowedDates={allowedDates}
                disabled={selectedGroupId === null}
              />
            ) : (
              <ScrapStockSelector
                snapshots={snapshotsForDate}
                selectedSnapshotId={selectedSnapshotId}
                onStockSelect={onStockChange}
                onEdge={onStockEdge}
                portfolio={portfolio}
                selectedStockCode={selectedStockCode}
                selectedStockName={selectedStockCode ? unifiedStocks?.stocks?.find(stock => stock.pdno === selectedStockCode)?.prdt_name || selectedStockCode : null}
              />
            )}
          </animated.div>
        ))}
      </div>
    </div>
  );
};
