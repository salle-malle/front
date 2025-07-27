"use client";

import { useTransition, animated } from "react-spring";
import { ScrapDateSelector } from "./ScrapDateSelector";
import { ScrapStockSelector } from "./ScrapStockSelector";
import { ScrapGroupSelector } from "./ScrapGroupSelector";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";
import { ScrapGroup } from "@/src/types/ScrapGroup";
import { UnifiedStockResponse } from "@/src/types/ApiResponse";

const SELECTOR_HEIGHT = 85;

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
  onIndexChange?: (newIndex: number) => void; // 추가: 인덱스 변경 콜백
  isStockDetail?: boolean; // 추가: 종목별 카드인지 구분
}

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
  onIndexChange,
  isStockDetail = false,
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
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // 드래그 비활성화 조건 확인
    if (isSelectorDisabled) {
      return;
    }
    
    // 버튼 클릭 시 드래그 방지
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setDragStartTime(Date.now());
    setHasDragged(false);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = Math.abs(clientY - startY);
    
    // 드래그 거리가 5px 이상이면 드래그로 간주
    if (deltaY > 5) {
      setHasDragged(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - startY;
    const dragDuration = Date.now() - dragStartTime;
    
    // 드래그 거리가 30px 이상이고, 드래그 시간이 100ms 이상이며, 실제로 드래그가 발생했을 때만 처리
    if (Math.abs(deltaY) > 30 && dragDuration > 100 && hasDragged) {
      dragDirection.current = deltaY > 0 ? 1 : -1;
      
      // 종목이 선택된 상태에서는 ScrapDateSelector와 ScrapStockSelector만 번갈아가며 전환
      if (selectedStockCode !== null) {
        if (deltaY > 0) {
          // 아래로 드래그: 이전 뷰로 (위에서 아래로 내려옴)
          dragDirection.current = 1;
          if (activeView === "stock") {
            onViewChange("date");
          } else if (activeView === "date") {
            onViewChange("stock");
          }
        } else {
          // 위로 드래그: 다음 뷰로 (아래에서 위로 올라옴)
          dragDirection.current = -1;
          if (activeView === "date") {
            onViewChange("stock");
          } else if (activeView === "stock") {
            onViewChange("date");
          }
        }
      } else {
        // 종목이 선택되지 않은 상태에서는 date와 stock만 번갈아가며 전환
        if (deltaY > 0) {
          // 아래로 드래그: 이전 뷰로 (위에서 아래로 내려옴)
          dragDirection.current = 1;
          if (activeView === "stock") {
            onViewChange("date");
          } else if (activeView === "date") {
            onViewChange("stock"); // 순환
          }
        } else {
          // 위로 드래그: 다음 뷰로 (아래에서 위로 올라옴)
          dragDirection.current = -1;
          if (activeView === "date") {
            onViewChange("stock");
          } else if (activeView === "stock") {
            onViewChange("date");
          }
        }
      }
    }
    setIsDragging(false);
    setHasDragged(false);
  };

  // 드래그 중일 때 하위 컴포넌트 클릭 방지
  const handleChildClick = (e: React.MouseEvent) => {
    if (isDragging || hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing select-none">
      {/* 뷰 전환 버튼 */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30">
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
        style={{ height: SELECTOR_HEIGHT }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => {
          setIsDragging(false);
          setHasDragged(false);
        }}
        onClick={(e) => {
          // 클릭 이벤트가 드래그 영역에서 발생했을 때만 처리
          if (isDragging || hasDragged) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {transitions((style, view) => (
          <animated.div
            style={{
              ...style,
              position: "absolute",
              width: "100%",
              height: "90%",
            }}
          >
            {view === "date" ? (
              <div onClick={handleChildClick}>
                <ScrapDateSelector
                  selectedDate={selectedDate}
                  onDateSelect={onDateChange}
                  allowedDates={allowedDates}
                  disabled={selectedGroupId === null && selectedStockCode === null}
                />
              </div>
            ) : (
              <div onClick={handleChildClick}>
                <ScrapStockSelector
                  snapshots={snapshotsForDate}
                  selectedSnapshotId={selectedSnapshotId}
                  onStockSelect={onStockChange}
                  onEdge={onStockEdge}
                  portfolio={portfolio}
                  selectedStockCode={selectedStockCode}
                  selectedStockName={selectedStockCode ? unifiedStocks?.stocks?.find(stock => stock.pdno === selectedStockCode)?.prdt_name || selectedStockCode : null}
                  onIndexChange={onIndexChange}
                  isStockDetail={isStockDetail}
                />
              </div>
            )}
          </animated.div>
        ))}
      </div>
    </div>
  );
};
