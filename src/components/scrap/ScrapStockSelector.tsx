"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SnapshotCard, UnifiedStockItem } from "@/src/types/SnapshotCard";
import Image from "next/image";

interface ScrapStockSelectorProps {
  snapshots: SnapshotCard[];
  selectedSnapshotId?: number;
  onStockSelect: (snapshotId: number) => void;
  onEdge?: (direction: "left" | "right") => void;
  portfolio?: { [pdno: string]: UnifiedStockItem };
}

export const ScrapStockSelector = ({
  snapshots,
  selectedSnapshotId,
  onStockSelect,
  onEdge,
  portfolio,
}: ScrapStockSelectorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logoError, setLogoError] = useState(false);

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

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="bg-gray-100 p-2 flex items-center justify-center h-full rounded-xl shadow-sm">
        <p className="text-sm text-gray-500">해당 날짜의 스크랩이 없습니다.</p>
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
    <div className="bg-gray-100 p-2 flex items-center space-x-2 h-full rounded-xl shadow-sm select-none">
      <button
        onClick={() => changeStock("left")}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>

      <div className="flex-1 bg-white p-2.5 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 relative flex-shrink-0">
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
                {/* {currentSnapshot.stockName.charAt(0)} */}
              </div>
            )}
          </div>

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
