"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard"; // 공통 타입 import
import { StockLogo } from "./StockLogo";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface StockSelectorProps {
  snapshots: SnapshotCard[];
  selectedSnapshotId?: number;
  onStockSelect: (snapshotId: number) => void;
  onEdge?: (direction: "left" | "right") => void;
  portfolio?: { [pdno: string]: UnifiedStockItem };
}

export const StockSelector = ({
  snapshots,
  selectedSnapshotId,
  onStockSelect,
  onEdge,
  portfolio,
}: StockSelectorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();
  
  // 드래그 감지 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // 선택된 스냅샷이 변경되면 내부 인덱스를 업데이트합니다.
  useEffect(() => {
    if (!snapshots || snapshots.length === 0) return;

    const index = snapshots.findIndex(
      (snapshot) => snapshot.snapshotId === selectedSnapshotId
    );

    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      // 선택된 ID가 없거나 목록에 없으면 첫번째 항목을 기본값으로 설정
      setCurrentIndex(0);
    }

    setLogoError(false);
  }, [selectedSnapshotId, snapshots]);

  // 좌/우 버튼 클릭 시 이전/다음 스냅샷을 선택하는 함수
  const changeStock = (direction: "left" | "right") => {
    if (!snapshots || snapshots.length === 0) return;

    let newIndex = currentIndex + (direction === "left" ? -1 : 1);
    
    if (newIndex < 0) {
      if (onEdge) onEdge("left");
      return;
    }
    if (newIndex >= snapshots.length) {
      if (onEdge) onEdge("right");
      return;
    }

    onStockSelect(snapshots[newIndex].snapshotId);
  };

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    setDragStartY(e.clientY);
    setDragStartTime(Date.now());
    setHasDragged(false);
    setIsDragging(true);
  };

  // 드래그 중 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = Math.abs(e.clientY - dragStartY);
    if (deltaY > 5) {
      setHasDragged(true);
    }
  };

  // 드래그 종료 핸들러
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dragDuration = Date.now() - dragStartTime;
    const deltaY = Math.abs(e.clientY - dragStartY);
    
    // 드래그가 아닌 클릭으로 간주하는 조건
    const isClick = deltaY < 10 && dragDuration < 200 && !hasDragged;
    
    setIsDragging(false);
    setHasDragged(false);
    
    // 클릭으로 간주되는 경우에만 라우팅
    if (isClick) {
      handleStockClick(e);
    }
  };

  // 종목 상세 페이지로 이동하는 함수
  const handleStockClick = (e: React.MouseEvent) => {
    // 드래그 중이거나 버튼 클릭이 아닌 경우에만 라우팅
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    if (currentSnapshot.stockCode) {
      router.push(`/stock/${currentSnapshot.stockCode}`);
    }
  };

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bg-gray-100 pt-9 flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">해당 날짜의 종목이 없습니다.</p>
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex];
  if (!currentSnapshot) return null;

  const stockInfo =
    portfolio && currentSnapshot.stockCode
      ? portfolio[currentSnapshot.stockCode.trim().toString()]
      : undefined;

  const evaluationAmount = stockInfo?.evaluation_amount || "---";
  const profitLossAmount = stockInfo?.profit_loss_amount || "---";
  const rateStr = stockInfo?.profit_loss_rate;
  const profitLossRate =
    rateStr && !isNaN(+rateStr) ? Math.floor(+rateStr * 100) / 100 : "---";

  const getProfitColor = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue === 0) return "text-gray-500";
    return numValue > 0 ? "text-red-600" : "text-blue-600";
  };
  const profitColor = getProfitColor(profitLossAmount);

  return (
    <div className="bg-gray-100 p-2.5 flex items-center space-x-2 h-full select-none">
      <button
        onClick={() => changeStock("left")}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      <div 
        className="flex-1 bg-white p-2.5 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHasDragged(false);
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 relative flex-shrink-0">
            {snapshots.map((snapshot)=>{
              const isSelected = snapshot.snapshotId === selectedSnapshotId;
              return (
                <Image
                  key={snapshot.snapshotId}
                  src={`/ticker-icon/${snapshot.stockCode}.png`}
                  alt={`${snapshot.stockName} logo`}
                  fill
                  loading="lazy"
                  style={{ objectFit: "contain", display: isSelected ? "block" : "none" }}
                  onError={() => setLogoError(true)}
                />    
              )
            })}
            {/* {
              snapshots.length > 1 ? (
            } */}
            {/* <Image
              src={`/ticker-icon/${currentSnapshot.stockCode}.png`}
              alt={`${currentSnapshot.stockName} logo`}
              fill
              style={{ objectFit: "contain" }}
              onError={() => setLogoError(true)}
            /> */}
          </div>
          {/* <div className="w-9 h-9 relative flex-shrink-0">
            {!logoError && currentSnapshot.stockCode ? (
              <Image
                src={`/ticker-icon/${currentSnapshot.stockCode}.png`}
                alt={`${currentSnapshot.stockName} logo`}
                fill
                style={{ objectFit: "contain" }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                 {currentSnapshot.stockName.charAt(0)}
              </div>
            )}
          </div> */}

          <div className="flex-1 text-left overflow-hidden">
            <p className="font-bold text-base truncate">
              {currentSnapshot.stockName}
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {evaluationAmount}
            </p>
            <p className="text-xs text-gray-500 truncate"></p>
          </div>
          <div className="text-right">
            {/* 손익금액 표시 */}
            <p
              className={`font-semibold text-base whitespace-nowrap ${profitColor}`}
            >
              {profitLossAmount}
            </p>
            {/* 손익률 표시 */}
            <p className={`text-sm ${profitColor}`}>({profitLossRate}%)</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => changeStock("right")}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  );
};
