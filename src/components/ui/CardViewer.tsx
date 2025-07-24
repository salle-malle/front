"use client";

import React from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { Card, CardContent } from "./card";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogHeader, DialogDescription, DialogFooter } from "./dialog";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "./scroll-area";
import { FaHeartCirclePlus, FaHeartCircleMinus } from "react-icons/fa6";
import { ScrapGroupDialog } from "./ScrapGroupDialog";
import { toast } from "sonner";

interface CardViewerProps {
  cards: SnapshotCard[];
  currentIndex: number;
  onSwipe: (direction: number) => void;
  onScrap: (snapshotId: number) => Promise<number | null>; // 스크랩 ID를 반환하도록 수정
  onUnscrap?: (snapshotId: number) => Promise<void>; // 스크랩 삭제 함수 추가
}

const CARD_WIDTH = 320;
const CARD_IMAGE_HEIGHT = 160;

export const CardViewer = ({
  cards,
  currentIndex,
  onSwipe,
  onScrap,
  onUnscrap,
}: CardViewerProps) => {
  const [localScrapStates, setLocalScrapStates] = React.useState<{ [key: number]: boolean }>({});
  const [showGroupDialog, setShowGroupDialog] = React.useState(false);
  const [currentSnapshotId, setCurrentSnapshotId] = React.useState<number | null>(null);
  const [currentScrapId, setCurrentScrapId] = React.useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = React.useState(false);
  const [pendingDeleteSnapshotId, setPendingDeleteSnapshotId] = React.useState<number | null>(null);
  const [springs, api] = useSprings(cards.length, (i) => ({
    x: (i - currentIndex) * (CARD_WIDTH + 40),
    scale: i === currentIndex ? 1 : 0.85,
    opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1,
  }));

  React.useEffect(() => {
    api.start((i) => ({
      x: (i - currentIndex) * (CARD_WIDTH + 40),
      scale: i === currentIndex ? 1 : 0.85,
      opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1,
    }));
  }, [currentIndex, api]);

  const bind = useDrag(
    ({
      args: [originalIndex],
      down,
      movement: [mx],
      direction: [dx],
      vxvy: [vx],
      cancel,
      event,
    }) => {
      // 버튼 클릭 감지 - 이벤트 타겟이 버튼이면 드래그 무시
      if (event && event.target) {
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
          return;
        }
      }
      
      const isCurrentCard = originalIndex === currentIndex;
      if (!isCurrentCard) return;

      // vx(x축 속도)를 사용하여 스와이프 판정
      const trigger = Math.abs(mx) > CARD_WIDTH / 4 || Math.abs(vx) > 0.3;

      if (!down) {
        if (trigger) {
          const direction = dx > 0 ? -1 : 1;
          onSwipe(direction);
        } else {
          api.start((i) => ({
            x: (i - currentIndex) * (CARD_WIDTH + 40),
          }));
        }
      } else {
        api.start((i) => {
          if (i !== originalIndex) return;
          return { x: mx, immediate: true };
        });
      }
    }
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {springs.map((style, i) => {
        const card = cards[i];
        if (!card) return null;

        return (
          <animated.div
            {...bind(i)}
            key={card.snapshotId}
            style={{
              ...style,
              position: "absolute",
              width: CARD_WIDTH,
              height: "72%",
              maxHeight: "100%",
              touchAction: "pan-y",
              cursor: "grab",
            }}
          >
            <Dialog>
              <Card className="h-full flex flex-col shadow-lg relative">
                <CardContent className="p-0 relative flex-1 overflow-hidden rounded-lg flex flex-col">
                  <div
                    className="w-full bg-gray-200 rounded-t-lg overflow-hidden"
                    style={{ height: CARD_IMAGE_HEIGHT }}
                  >
                    {card.newsImage && (
                      <img
                        src={card.newsImage}
                        alt="News Image"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-gray-600 text-sm">{card.newsContent}</p>
                  </div> */}

                  <ScrollArea>
                    <div className="p-4 flex-1 overflow-y-auto">
                      <p className="text-gray-600 text-sm">
                        {card.newsContent}
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {card.personalizedComment && (
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute bottom-[75%] right-[17%] h-8 w-8 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg z-20"
                  >
                    <MessageSquare size={36} />
                  </Button>
                </DialogTrigger>
              )}
              {/* 스크랩/언스크랩 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-[75%] right-[4%] h-8 w-8 p-0 z-10 backdrop-blur-sm rounded-full p-2 transition-all duration-200 bg-blue-500 hover:bg-blue-600"
                onClick={async (e) => {
                  console.log("=== Scrap/Unscrap Button Click Debug ===");
                  console.log("Button clicked for snapshotId:", card.snapshotId);
                  console.log("Current index:", currentIndex);
                  console.log("Is scraped:", card.isScrap || localScrapStates[card.snapshotId]);
                  
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("preventDefault and stopPropagation called");
                  
                  const isCurrentlyScraped = card.isScrap || localScrapStates[card.snapshotId];
                  
                  try {
                    if (isCurrentlyScraped && onUnscrap) {
                      // 스크랩 삭제 확인 다이얼로그 표시
                      setPendingDeleteSnapshotId(card.snapshotId);
                      setShowDeleteConfirmDialog(true);
                    } else {
                      // 스크랩 추가
                      console.log("Calling onScrap...");
                      const scrapId = await onScrap(card.snapshotId);
                      console.log("onScrap completed successfully, scrapId:", scrapId);
                      
                      // API 성공 시 로컬 상태 업데이트
                      setLocalScrapStates(prev => {
                        console.log("Updating local scrap state for:", card.snapshotId);
                        return {
                          ...prev,
                          [card.snapshotId]: true
                        };
                      });
                      
                      console.log("Showing toast...");
                      // 그룹 추가 확인 토스트
                      toast.success("스크랩에 추가되었습니다.", {
                        action: {
                          label: "그룹에도 추가",
                          onClick: () => {
                            console.log("Toast action clicked, opening group dialog");
                            setCurrentSnapshotId(card.snapshotId);
                            setCurrentScrapId(scrapId);
                            setShowGroupDialog(true);
                          },
                        },
                      });
                      console.log("Toast should be displayed");
                      
                      // 테스트용 토스트도 추가
                      setTimeout(() => {
                        console.log("Showing test toast...");
                        toast("테스트 토스트입니다.");
                      }, 1000);
                    }
                  } catch (error) {
                    // API 실패 시 로컬 상태 변경하지 않음
                    console.error("Scrap/Unscrap failed:", error);
                  }
                }}
                              >
                {card.isScrap || localScrapStates[card.snapshotId] ? (
                  <FaHeartCircleMinus 
                    size={36} 
                    className="text-red-500 hover:text-white transition-all duration-200"
                  />
                ) : (
                  <FaHeartCirclePlus 
                    size={36} 
                    className="text-white hover:text-red-500 transition-all duration-200"
                  />
                )}
              </Button>

              {card.personalizedComment && (
                <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-xs">
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-2xl text-gray-800">
                    {/* 상단 헤더 영역 */}
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {/* 아이콘: Lucide React의 Wand2 사용 (AI, 마법 같은 인사이트 의미) */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-5 h-5 text-blue-600"
                        >
                          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2 18l-2 4 4-2 16.36-16.36a1.21 1.21 0 0 0 0-1.72Z" />
                          <path d="m14 7 3 3" />
                          <path d="M5 6v4" />
                          <path d="M19 14h4" />
                          <path d="M10 2v2" />
                          <path d="M7 8H3" />
                        </svg>
                      </div>
                      <DialogTitle className="sr-only">AI Comment</DialogTitle>
                      <h4 className="font-bold text-lg text-gray-900">
                        AI Comment
                      </h4>
                    </div>

                    {/* 본문 내용 */}
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {card.personalizedComment || ""}
                    </p>

                    {/* 말풍선 꼬리 */}
                    <div className="absolute right-6 -bottom-2 w-4 h-4 bg-indigo-100 transform -translate-x-1/2 rotate-45 -z-10"></div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </animated.div>
        );
      })}
      
      {/* 그룹 선택 다이얼로그 */}
      {currentSnapshotId && (
        <ScrapGroupDialog
          isOpen={showGroupDialog}
          onClose={() => {
            setShowGroupDialog(false);
            setCurrentSnapshotId(null);
            setCurrentScrapId(null);
          }}
          snapshotId={currentSnapshotId}
          scrapId={currentScrapId || undefined}
          onScrapSuccess={() => {
            // 그룹 추가 성공 시 추가 처리 (필요시)
            console.log("Group scrap success for:", currentSnapshotId);
          }}
        />
      )}

      {/* 스크랩 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>스크랩 삭제</DialogTitle>
            <DialogDescription>
              이 스크랩을 삭제하시겠습니까? 스크랩 그룹에서도 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirmDialog(false);
                setPendingDeleteSnapshotId(null);
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (pendingDeleteSnapshotId && onUnscrap) {
                  try {
                    console.log("Calling onUnscrap...");
                    await onUnscrap(pendingDeleteSnapshotId);
                    console.log("onUnscrap completed successfully");
                    
                    // 로컬 상태 업데이트
                    setLocalScrapStates(prev => {
                      console.log("Updating local scrap state for:", pendingDeleteSnapshotId, "to false");
                      return {
                        ...prev,
                        [pendingDeleteSnapshotId]: false
                      };
                    });
                    
                    toast.success("스크랩에서 제거되었습니다.");
                  } catch (error) {
                    console.error("Unscrap failed:", error);
                    toast.error("스크랩 삭제에 실패했습니다.");
                  }
                }
                setShowDeleteConfirmDialog(false);
                setPendingDeleteSnapshotId(null);
              }}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function fetchWithAuthCheck(
  arg0: string,
  arg1: {
    method: string;
    headers: { "Content-Type": string };
    credentials: string;
    body: string;
  },
  router: any
) {
  throw new Error("Function not implemented.");
}
