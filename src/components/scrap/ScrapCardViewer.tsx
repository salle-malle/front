"use client";

import React from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { Card, CardContent } from "../ui/card";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { FaHeartCirclePlus, FaHeartCircleMinus } from "react-icons/fa6";
import { ScrapGroupDialog } from "../ui/ScrapGroupDialog";
import { toast } from "sonner";

interface ScrapCardViewerProps {
  cards: SnapshotCard[];
  currentIndex: number;
  onSwipe: (direction: number) => void;
  onScrap: (snapshotId: number) => Promise<number | null>;
  onUnscrap?: (snapshotId: number) => Promise<void>;
}

const CARD_WIDTH = 320;
const CARD_IMAGE_HEIGHT = 160;

export const ScrapCardViewer = ({
  cards,
  currentIndex,
  onSwipe,
  onScrap,
  onUnscrap,
}: ScrapCardViewerProps) => {
  const [localScrapStates, setLocalScrapStates] = React.useState<{
    [key: number]: boolean;
  }>({});
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
      if (event && event.target) {
        const target = event.target as HTMLElement;
        if (target.closest("button")) {
          return;
        }
      }
      const isCurrentCard = originalIndex === currentIndex;
      if (!isCurrentCard) return;
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
                  <ScrollArea>
                    <div className="p-4 flex-1 overflow-y-auto">
                      <p className="text-gray-600 text-sm">{card.newsContent}</p>
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
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-[75%] right-[4%] h-8 w-8 p-0 z-10 backdrop-blur-sm rounded-full p-2 transition-all duration-200 bg-blue-500 hover:bg-blue-600"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const isCurrentlyScraped = card.isScrap || localScrapStates[card.snapshotId];
                  try {
                    if (isCurrentlyScraped && onUnscrap) {
                      setPendingDeleteSnapshotId(card.snapshotId);
                      setShowDeleteConfirmDialog(true);
                    } else {
                      const scrapId = await onScrap(card.snapshotId);
                      setLocalScrapStates((prev) => ({
                        ...prev,
                        [card.snapshotId]: true,
                      }));
                      toast.success("스크랩에 추가되었습니다.", {
                        action: {
                          label: "그룹에도 추가",
                          onClick: () => {
                            setCurrentSnapshotId(card.snapshotId);
                            setCurrentScrapId(scrapId);
                            setShowGroupDialog(true);
                          },
                        },
                      });
                    }
                  } catch (error) {
                    // 실패 시 아무것도 하지 않음
                  }
                }}
              >
                {card.isScrap || localScrapStates[card.snapshotId] ? (
                  <FaHeartCircleMinus size={36} className="text-red-500 hover:text-white transition-all duration-200" />
                ) : (
                  <FaHeartCirclePlus size={36} className="text-white hover:text-red-500 transition-all duration-200" />
                )}
              </Button>
              {card.personalizedComment && (
                <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-xs">
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-2xl text-gray-800">
                    <div className="flex items-center space-x-3 mb-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
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
                      <h4 className="font-bold text-lg text-gray-900">AI Comment</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">{card.personalizedComment || ""}</p>
                    <div className="absolute right-6 -bottom-2 w-4 h-4 bg-indigo-100 transform -translate-x-1/2 rotate-45 -z-10"></div>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </animated.div>
        );
      })}
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
          }}
        />
      )}
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
                    await onUnscrap(pendingDeleteSnapshotId);
                    setLocalScrapStates((prev) => ({
                      ...prev,
                      [pendingDeleteSnapshotId]: false,
                    }));
                    toast.success("스크랩에서 제거되었습니다.");
                  } catch (error) {
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
