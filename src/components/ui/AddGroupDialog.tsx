"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupName: string) => void;
  isLoading?: boolean;
}

export const AddGroupDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: AddGroupDialogProps) => {
  const [groupName, setGroupName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onSubmit(groupName.trim());
      setGroupName("");
    }
  };

  const handleClose = () => {
    setGroupName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">새 그룹 추가</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름을 입력하세요"
              className="mt-1"
              disabled={isLoading}
              autoFocus
              maxLength={20}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {groupName.length}/20
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!groupName.trim() || groupName.length > 20 || isLoading}
              className="flex-1"
            >
              {isLoading ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 