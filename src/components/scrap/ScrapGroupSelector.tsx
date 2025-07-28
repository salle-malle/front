"use client";

import { useState, memo, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";

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
  onGroupNameUpdate?: (groupId: number, newName: string) => Promise<void>; // 그룹 이름 수정 콜백 추가
  onGroupDelete?: (groupId: number) => Promise<void>; // 그룹 삭제 콜백 추가
}

export const ScrapGroupSelector = memo(({
  groups,
  selectedGroupId,
  onGroupSelect,
  onAddGroup,
  unifiedStocks,
  onStockClick,
  selectedStockCode,
  onGroupNameUpdate,
  onGroupDelete,
}: ScrapGroupSelectorProps) => {
  // 길게 누르기 관련 상태
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressingGroupId, setLongPressingGroupId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 길게 누르기 핸들러
  const handleMouseDown = (groupId: number) => {
    setLongPressingGroupId(groupId);
    const timer = setTimeout(() => {
      setEditingGroupId(groupId);
      setNewGroupName(groups.find(g => g.id === groupId)?.scrapGroupName || "");
      setIsEditDialogOpen(true);
      setLongPressingGroupId(null);
    }, 1000);
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    setLongPressingGroupId(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    setLongPressingGroupId(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  const cleanup = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
  };

  // 그룹 이름 수정 핸들러
  const handleUpdateGroupName = async () => {
    if (!editingGroupId || !newGroupName.trim() || !onGroupNameUpdate) {
      return;
    }

    setIsUpdating(true);
    try {
      await onGroupNameUpdate(editingGroupId, newGroupName.trim());
      setIsEditDialogOpen(false);
      setEditingGroupId(null);
      setNewGroupName("");
      toast.success("그룹 이름이 수정되었습니다.");
    } catch (error) {
      toast.error("그룹 이름 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 그룹 삭제 핸들러
  const handleDeleteGroup = async () => {
    if (!editingGroupId || !onGroupDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await onGroupDelete(editingGroupId);
      setIsEditDialogOpen(false);
      setIsDeleteDialogOpen(false);
      setEditingGroupId(null);
      setNewGroupName("");
      toast.success("그룹이 삭제되었습니다.");
    } catch (error) {
      toast.error("그룹 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center h-full rounded-xl select-none relative">
        {/* 스크롤 가능한 그룹 버튼 영역 */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide flex-1 pr-12">
          {/* 전체 버튼 */}
          <button
            onClick={() => {
              onGroupSelect(null);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
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
              onClick={() => {
                onGroupSelect(group.id as number);
              }}
              onMouseDown={() => handleMouseDown(group.id as number)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleMouseDown(group.id as number)}
              onTouchEnd={handleMouseUp}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 border-2 ${
                selectedGroupId === group.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : longPressingGroupId === group.id
                  ? "bg-blue-100 text-blue-700 border-blue-500 shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
              }`}
            >
              {group.scrapGroupName}
            </button>
          ))}
        </div>

        {/* 고정된 그룹 추가 버튼 */}
        {onAddGroup && (
          <button
            onClick={onAddGroup}
            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors absolute right-0 flex-shrink-0"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* 그룹 이름 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>그룹 관리</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="새 그룹 이름을 입력하세요"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdateGroupName();
                }
              }}
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingGroupId(null);
                setNewGroupName("");
              }}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              삭제
            </Button>
            <Button
              onClick={handleUpdateGroupName}
              disabled={!newGroupName.trim() || isUpdating}
            >
              {isUpdating ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 그룹 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>그룹 삭제</DialogTitle>
            <br></br>
            <DialogDescription>
              이 그룹을 삭제하시겠습니까? 그룹에 포함된 스크랩들은 그룹에서만 제거되고 스크랩 자체는 삭제되지 않습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setIsEditDialogOpen(true);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
