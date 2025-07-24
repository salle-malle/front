"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";
import { ScrapGroupResponseDto } from "@/src/types/ScrapGroup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ScrapGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  snapshotId: number;
  scrapId?: number; // 스크랩 ID 추가
  onScrapSuccess: () => void;
}

let hasRedirectedToLogin = false;

async function fetchWithAuthCheck(
  input: RequestInfo,
  init: RequestInit = {},
  router: ReturnType<typeof useRouter>
) {
  const res = await fetch(input, init);
  let jsonResponse: any;
  try {
    jsonResponse = await res.json();
  } catch (e) {
    throw new Error("서버 응답이 올바르지 않습니다.");
  }
  if (jsonResponse.code === "AUTH-002") {
    if (!hasRedirectedToLogin) {
      hasRedirectedToLogin = true;
      router.replace("/login");
    }
    throw new Error("인증 오류");
  }
  return jsonResponse;
}

export const ScrapGroupDialog = ({
  isOpen,
  onClose,
  snapshotId,
  scrapId,
  onScrapSuccess,
}: ScrapGroupDialogProps) => {
  const [groups, setGroups] = useState<ScrapGroupResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const router = useRouter();

  // 그룹 목록 가져오기
  const fetchGroups = async () => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response.status && response.data) {
        setGroups(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("그룹 목록을 가져오는데 실패했습니다.");
    }
  };

  // 그룹에 스크랩 추가
  const addToGroup = async (groupId: number) => {
    setIsLoading(true);
    try {
      console.log("=== Add to Group Debug ===");
      console.log("Adding to groupId:", groupId);
      console.log("snapshotId:", snapshotId);
      console.log("scrapId:", scrapId);
      
      // 이미 스크랩 ID가 있으면 그것을 사용, 없으면 새로 생성
      let finalScrapId = scrapId;
      
      if (!finalScrapId) {
        console.log("No scrapId provided, creating new scrap...");
        const scrapResponse = await fetchWithAuthCheck(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ memberStockSnapshotId: snapshotId }),
          },
          router
        );

        console.log("Scrap creation response:", scrapResponse);

        if (!scrapResponse.status) {
          throw new Error("스크랩 생성에 실패했습니다.");
        }

        finalScrapId = scrapResponse.data?.id || scrapResponse.data?.scrapId;
        console.log("Created scrap ID:", finalScrapId);
      }
      
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgrouped/push`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            scrapGroupId: groupId,
            scrapId: finalScrapId
          }),
        },
        router
      );

      console.log("Group add API response:", response);

      if (response.status) {
        console.log("Group add successful");
        toast.success("그룹에 추가되었습니다.");
        onScrapSuccess();
        onClose();
      } else {
        console.error("Group add failed:", response.message);
        toast.error(response.message || "그룹 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to add to group:", error);
      toast.error("그룹 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const handleGroupSelect = (groupId: number) => {
    setSelectedGroupId(groupId);
  };

  const handleConfirm = () => {
    if (selectedGroupId) {
      addToGroup(selectedGroupId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold">
          그룹에 추가하기
        </DialogTitle>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            스크랩을 추가할 그룹을 선택해주세요.
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={selectedGroupId === group.id ? "default" : "outline"}
                className={`w-full justify-start ${
                  selectedGroupId === group.id
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleGroupSelect(group.id)}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {selectedGroupId === group.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{group.scrapGroupName}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedGroupId || isLoading}
              className="flex-1"
            >
              {isLoading ? "추가 중..." : "추가"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 