"use client";

import { useTransition, animated } from "react-spring";
import { DateSelector } from "./DateSelector";
import { StockSelector } from "./StockSelector";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";

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
  portfolio: { [stockCode: string]: UnifiedStockItem };
  onScrap: (snapshotId: number) => void;
  onNextView?: () => void; // 다음 뷰로 이동
  onPrevView?: () => void; // 이전 뷰로 이동
  isViewTransitioning?: boolean; // 뷰 전환 중인지 여부
}

const SELECTOR_HEIGHT = 85;

export const DualSelector = ({
  activeView,
  onViewChange,
  selectedDate,
  onDateChange,
  snapshotsForDate,
  selectedSnapshotId,
  onStockChange,
  allowedDates = [],
  onStockEdge,
  portfolio,
  onScrap,
  onNextView,
  onPrevView,
  isViewTransitioning = false,
}: DualSelectorProps) => {
  const dragDirection = useRef(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const transitions = useTransition(activeView, {
    from: { y: dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    enter: { y: 0, opacity: 1 },
    leave: { y: -dragDirection.current * SELECTOR_HEIGHT, opacity: 0 },
    config: { tension: 300, friction: 30 },
  });

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // CardViewer 영역에서는 DualSelector 드래그 비활성화
    if (target.closest('[data-card-viewer]')) {
      return;
    }
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = clientY - startY;
    
    if (Math.abs(deltaY) > 30) {
      if (deltaY < 0) {
        // 위로 드래그: 다음 뷰로 (아래에서 위로 올라옴)
        dragDirection.current = -1; // 아래에서 위로
        if (onNextView) {
          onNextView();
        } else {
          onViewChange("stock");
        }
      } else {
        // 아래로 드래그: 이전 뷰로 (위에서 아래로 내려옴)
        dragDirection.current = 1; // 위에서 아래로
        if (onPrevView) {
          onPrevView();
        } else {
          onViewChange("date");
        }
      }
    }
    setIsDragging(false);
  };

  // 드래그 중일 때 하위 컴포넌트 클릭 방지
  const handleChildClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="relative">
      {/* 뷰 전환 버튼 */}
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation(); // 이벤트 버블링 방지
            // 버튼 클릭 시에는 항상 밑에서 위로 올라오는 애니메이션
            dragDirection.current = 1;
            if (onNextView) {
              onNextView();
            } else {
              onViewChange(activeView === "date" ? "stock" : "date");
            }
          }}
          onTouchStart={(e) => e.stopPropagation()} // 터치 이벤트 버블링 방지
          onMouseDown={(e) => e.stopPropagation()} // 마우스 이벤트 버블링 방지
          className="w-8 h-2 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-pointer"
          title="뷰 전환"
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
        onClick={(e) => {
          // 클릭 이벤트가 드래그 영역에서 발생했을 때만 처리
          if (isDragging) {
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
            height: "100%",
          }}
        >
          {view === "date" ? (
            <div onClick={handleChildClick}>
              <DateSelector
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  // 뷰 전환 중이 아닐 때만 날짜 선택 함수 호출
                  if (!isViewTransitioning) {
                    onDateChange(date);
                  }
                }}
                allowedDates={allowedDates} // 추가
              />
            </div>
          ) : (
            <div onClick={handleChildClick}>
              <StockSelector
                snapshots={snapshotsForDate}
                selectedSnapshotId={selectedSnapshotId}
                onStockSelect={onStockChange}
                onEdge={onStockEdge} // 추가
                portfolio={portfolio}
              />
            </div>
          )}
        </animated.div>
      ))}
      </div>
    </div>
  );
};
