"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SnapshotCard } from "@/src/types/SnapshotCard"; // 공통 타입 import
import { StockLogo } from "./StockLogo";
import Image from "next/image";

// StockLogo 컴포넌트는 별도로 구현되어 있다고 가정합니다.
// import { StockLogo } from "./StockLogo";

interface StockSelectorProps {
  snapshots: SnapshotCard[]; // events -> snapshots로 이름 및 타입 변경
  selectedSnapshotId?: number; // selectedStock -> selectedSnapshotId로 변경
  onStockSelect: (snapshotId: number) => void; // onStockSelect -> onStockChange로 변경되어 전달될 수 있음
  onEdge?: (direction: "left" | "right") => void; // 추가
}

export const StockSelector = ({
  snapshots,
  selectedSnapshotId,
  onStockSelect,
  onEdge,
}: StockSelectorProps) => {
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
      <div className="bg-gray-100 p-2 flex items-center justify-center h-full">
        <p className="text-sm text-gray-500">해당 날짜의 종목이 없습니다.</p>
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex];
  if (!currentSnapshot) return null; // 데이터가 없는 경우 렌더링하지 않음

  return (
    <div className="bg-gray-100 p-2 flex items-center space-x-2 h-full">
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
                layout="fill"
                objectFit="contain"
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
            <p className="text-xs text-gray-500 truncate"></p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-base whitespace-nowrap">
              {currentSnapshot.stockCode}
            </p>
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
