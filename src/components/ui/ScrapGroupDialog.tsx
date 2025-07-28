"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";
import { ScrapGroupResponseDto } from "@/src/types/ScrapGroup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface GroupInclusionStatusDto {
  groupId: number;
  groupName: string;
  alreadyIncluded: boolean;
}

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
  const [groupInclusionStatus, setGroupInclusionStatus] = useState<GroupInclusionStatusDto[]>([]);
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
      toast.error("그룹 목록을 가져오는데 실패했습니다.");
    }
  };

  // 스크랩의 그룹 포함 상태 가져오기
  const fetchGroupInclusionStatus = async (scrapId: number) => {
    try {
      const response = await fetchWithAuthCheck(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/scrapgroup/status/${scrapId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
        router
      );

      if (response.status && response.data) {
        setGroupInclusionStatus(response.data);
      }
    } catch (error) {
      // 에러가 발생해도 그룹 목록은 표시하되, 포함 상태는 빈 배열로 설정
      setGroupInclusionStatus([]);
    }
  };

  // 그룹에 스크랩 추가
  const addToGroup = async (groupId: number) => {
    setIsLoading(true);
    try {
      
      // 이미 스크랩 ID가 있으면 그것을 사용, 없으면 새로 생성
      let finalScrapId = scrapId;
      
      if (!finalScrapId) {
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

        if (!scrapResponse.status) {
          throw new Error("스크랩 생성에 실패했습니다.");
        }

        finalScrapId = scrapResponse.data?.id || scrapResponse.data?.scrapId;
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

      if (response.status) {
        toast.success("그룹에 추가되었습니다.");
        onScrapSuccess();
        onClose();
      } else {
        toast.error(response.message || "그룹 추가에 실패했습니다.");
      }
    } catch (error) {
      toast.error("그룹 추가 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      // scrapId가 있으면 그룹 포함 상태도 가져오기
      if (scrapId) {
        fetchGroupInclusionStatus(scrapId);
      }
    }
  }, [isOpen, scrapId]);

  const handleGroupSelect = (groupId: number) => {
    // 이미 포함된 그룹은 선택할 수 없음
    const groupStatus = groupInclusionStatus.find(status => status.groupId === groupId);
    if (groupStatus && groupStatus.alreadyIncluded) {
      return;
    }
    setSelectedGroupId(groupId);
  };

  const handleConfirm = () => {
    if (selectedGroupId) {
      addToGroup(selectedGroupId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogTitle className="text-lg font-semibold">
          그룹에 추가하기
        </DialogTitle>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            스크랩을 추가할 그룹을 선택해주세요.
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {groups.map((group) => {
              const groupStatus = groupInclusionStatus.find(status => status.groupId === group.id);
              const isAlreadyIncluded = groupStatus?.alreadyIncluded || false;
              
              return (
                <Button
                  key={group.id}
                  variant={selectedGroupId === group.id ? "default" : "outline"}
                  className={`w-full justify-start ${
                    selectedGroupId === group.id
                      ? "bg-blue-500 text-white"
                      : isAlreadyIncluded
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleGroupSelect(group.id)}
                  disabled={isLoading || isAlreadyIncluded}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      {selectedGroupId === group.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{group.scrapGroupName}</span>
                    {isAlreadyIncluded && (
                      <span className="text-xs text-gray-500 ml-auto">(이미 포함됨)</span>
                    )}
                  </div>
                </Button>
              );
            })}
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