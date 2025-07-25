"use client";

import { useState, memo } from "react";
import { Plus } from "lucide-react";

import { ScrapGroup } from "@/src/types/ScrapGroup";
import { UnifiedStockResponse } from "@/src/types/ApiResponse";

interface ScrapGroupSelectorProps {
  groups: ScrapGroup[];
  selectedGroupId?: number | null;
  onGroupSelect: (groupId: number | null) => void; // null은 "전체"를 의미
  onAddGroup?: () => void;
  unifiedStocks?: UnifiedStockResponse | null;
  onStockClick?: (stockCode: string) => void;
  selectedStockCode?: string | null; // 선택된 종목 코드 추가
}

export const ScrapGroupSelector = memo(({
  groups,
  selectedGroupId,
  onGroupSelect,
  onAddGroup,
  unifiedStocks,
  onStockClick,
  selectedStockCode,
}: ScrapGroupSelectorProps) => {
  return (
    <div className="flex items-center space-x-2 h-full rounded-xl select-none">
      {/* <div className="flex-1 bg-white p-1.5 rounded-xl shadow-sm"> */}
        <div className="flex items-center justify-start w-full space-x-2">
          {/* 전체 버튼 */}
          <button
            onClick={() => onGroupSelect(null)}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
              selectedGroupId === null || selectedStockCode !== null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체
          </button>

          {/* 그룹 버튼들 */}
          {groups.map((group) => (
            <button
              key={group.id.toString()}
              onClick={() => onGroupSelect(group.id as number)}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                selectedGroupId === group.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {group.scrapGroupName}
            </button>
          ))}

          {/* 그룹 추가 버튼 */}
          {onAddGroup && (
            <button
              onClick={onAddGroup}
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ml-auto"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      {/* </div> */}
    </div>
  );
});
