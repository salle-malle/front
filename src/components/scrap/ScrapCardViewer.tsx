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
import { ScrapCardDetailModal } from "./ScrapCardDetailModal";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ScrapCardViewerProps {
  cards: SnapshotCard[];
  currentIndex?: number; // 추가: 현재 인덱스를 부모에서 관리
  onScrap: (snapshotId: number) => Promise<number | null>;
  onUnscrap?: (snapshotId: number) => Promise<void>;
  onDateChange?: (direction: "prev" | "next") => void;
  onIndexChange?: (newIndex: number) => void;
  onCardDelete?: (snapshotId: number) => void;
  isGroupDetail?: boolean;
  isStockDetail?: boolean; // 추가: 종목별 카드인지 구분
  onViewChange?: (view: "date" | "stock") => void; // 추가: 뷰 변경 콜백
}

// 반응형 카드 크기 계산 함수 (CardViewer와 동일)
const getCardDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 320, imageHeight: 160, cardHeight: 400 };
  }
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  if (screenWidth < 480) {
    const availableHeight = screenHeight - 200;
    return { 
      width: Math.min(screenWidth - 40, 280), 
      imageHeight: Math.min(screenHeight * 0.25, 140),
      cardHeight: Math.min(availableHeight * 0.95, 576)
    };
  } else if (screenWidth < 768) {
    const availableHeight = screenHeight - 180;
    return { 
      width: Math.min(screenWidth - 60, 320), 
      imageHeight: Math.min(screenHeight * 0.28, 160),
      cardHeight: Math.min(availableHeight * 0.95, 684)
    };
  } else if (screenWidth < 1024) {
    const availableHeight = screenHeight - 160;
    return { 
      width: Math.min(screenWidth - 80, 400), 
      imageHeight: Math.min(screenHeight * 0.3, 200),
      cardHeight: Math.min(availableHeight * 0.95, 756)
    };
  } else if (screenWidth < 1440) {
    const availableHeight = screenHeight - 140;
    return { 
      width: Math.min(screenWidth - 100, 520), 
      imageHeight: Math.min(screenHeight * 0.35, 280),
      cardHeight: Math.min(availableHeight * 0.95, 1000)
    };
  } else {
    const availableHeight = screenHeight - 140;
    return { 
      width: Math.min(screenWidth - 120, 600), 
      imageHeight: Math.min(screenHeight * 0.38, 320),
      cardHeight: Math.min(availableHeight * 0.95, 1200)
    };
  }
};

export const ScrapCardViewer = ({
  cards,
  currentIndex: externalCurrentIndex = 0,
  onScrap,
  onUnscrap,
  onDateChange,
  onIndexChange,
  onCardDelete,
  isGroupDetail = false,
  isStockDetail = false,
  onViewChange,
}: ScrapCardViewerProps) => {
  const [internalCurrentIndex, setInternalCurrentIndex] = React.useState(0);
  
  console.log("=== ScrapCardViewer Render ===");
  console.log("cards.length:", cards.length);
  console.log("externalCurrentIndex:", externalCurrentIndex);
  console.log("isGroupDetail:", isGroupDetail);
  console.log("First few cards:", cards.slice(0, 3).map(card => ({
    snapshotId: card.snapshotId,
    stockCode: card.stockCode,
    stockName: card.stockName
  })));
  
  // 외부에서 currentIndex가 제공되면 사용, 아니면 내부 상태 사용
  const currentIndex = externalCurrentIndex !== undefined ? externalCurrentIndex : internalCurrentIndex;
  
  // 인덱스 범위 체크 및 조정
  const adjustedCurrentIndex = React.useMemo(() => {
    if (cards.length === 0) return 0;
    if (currentIndex >= cards.length) {
      // 인덱스가 범위를 벗어나면 마지막 카드로 조정
      const newIndex = cards.length - 1;
      if (externalCurrentIndex !== undefined && onIndexChange) {
        // 외부에서 관리하는 경우 부모에게 알림
        setTimeout(() => onIndexChange(newIndex), 0);
      }
      return newIndex;
    }
    return currentIndex;
  }, [currentIndex, cards.length, externalCurrentIndex, onIndexChange]);
  const setCurrentIndex = (index: number) => {
    if (externalCurrentIndex !== undefined) {
      // 외부에서 관리하는 경우 onIndexChange 호출
      if (onIndexChange) {
        onIndexChange(index);
      }
    } else {
      // 내부에서 관리하는 경우 내부 상태 업데이트
      setInternalCurrentIndex(index);
    }
  };
  const [localScrapStates, setLocalScrapStates] = React.useState<{
    [key: number]: boolean;
  }>({});
  const [showGroupDialog, setShowGroupDialog] = React.useState(false);
  const [currentSnapshotId, setCurrentSnapshotId] = React.useState<number | null>(null);
  const [currentScrapId, setCurrentScrapId] = React.useState<number | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = React.useState(false);
  const [pendingDeleteSnapshotId, setPendingDeleteSnapshotId] = React.useState<number | null>(null);
  
  // 길게 누르기 관련 상태
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<SnapshotCard | null>(null);
  const [isLongPressing, setIsLongPressing] = React.useState(false);
  const [longPressingCardIndex, setLongPressingCardIndex] = React.useState<number | null>(null);
  
  // 반응형 카드 크기 상태
  const [cardDimensions, setCardDimensions] = React.useState(() => getCardDimensions());
  
  // 화면 크기 변경 감지
  React.useEffect(() => {
    const handleResize = () => {
      setCardDimensions(getCardDimensions());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 카드 간격 계산
  const getCardSpacing = () => {
    if (cardDimensions.width < 300) return 20;
    if (cardDimensions.width < 400) return 30;
    return 40;
  };
  
  const cardSpacing = getCardSpacing();
  
  // 버튼 위치 및 크기 계산 함수
  const getButtonPosition = () => {
    const imageHeight = cardDimensions.imageHeight;
    const buttonSize = Math.max(32, Math.min(40, cardDimensions.width * 0.1));
    const iconSize = buttonSize * 0.85;
    
    return {
      top: imageHeight - buttonSize - 15,
      heartRight: 10,
      commentRight: buttonSize + 20,
      buttonSize,
      iconSize,
    };
  };
  
  const buttonPosition = getButtonPosition();
  
  // 길게 누르기 핸들러
  const handleMouseDown = (card: SnapshotCard, cardIndex: number) => {
    setIsLongPressing(true);
    setLongPressingCardIndex(cardIndex);
    const timer = setTimeout(() => {
      setSelectedCard(card);
      setDetailModalOpen(true);
      setIsLongPressing(false);
      setLongPressingCardIndex(null);
    }, 500); // 0.5초 길게 누르기
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    setIsLongPressing(false);
    setLongPressingCardIndex(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    setIsLongPressing(false);
    setLongPressingCardIndex(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  React.useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);
  
  const [springs, api] = useSprings(cards.length, (i) => ({
    x: (i - adjustedCurrentIndex) * (cardDimensions.width + cardSpacing),
    scale: i === adjustedCurrentIndex ? 1 : 0.85,
    opacity: Math.abs(i - adjustedCurrentIndex) > 1 ? 0 : 1,
  }), [cards.length, adjustedCurrentIndex, cardDimensions.width, cardSpacing]);

  console.log("=== Springs Initialization ===");
  console.log("cards.length:", cards.length);
  console.log("currentIndex:", currentIndex);
  console.log("adjustedCurrentIndex:", adjustedCurrentIndex);
  console.log("cardDimensions.width:", cardDimensions.width);
  console.log("cardSpacing:", cardSpacing);
  console.log("springs array length:", springs.length);

  React.useEffect(() => {
    api.start((i) => {
      const newX = (i - adjustedCurrentIndex) * (cardDimensions.width + cardSpacing);
      const newScale = i === adjustedCurrentIndex ? 1 : 0.85;
      const newOpacity = Math.abs(i - adjustedCurrentIndex) > 1 ? 0 : 1;
      
      return {
        x: newX,
        scale: newScale,
        opacity: newOpacity,
      };
    });
  }, [adjustedCurrentIndex, api, cardDimensions.width, cardSpacing, cards.length]);

  const handleSwipe = (direction: number) => {
    const newIndex = adjustedCurrentIndex + direction;
    if (newIndex >= 0 && newIndex < cards.length) {
      setCurrentIndex(newIndex);
      if (onIndexChange) {
        onIndexChange(newIndex);
      }
      // 종목별 카드일 때는 DateSelector로, 그룹 카드일 때는 StockSelector로 전환
      if (onViewChange) {
        if (isStockDetail) {
          onViewChange("date");
        } else if (isGroupDetail) {
          onViewChange("stock");
        }
      }
    } else if (onDateChange) {
      // 모든 경우에 날짜 변경 허용
      if (direction > 0) {
        onDateChange("next");
      } else {
        onDateChange("prev");
      }
      // 날짜가 변경되면 date 뷰로 전환
      if (onViewChange) {
        onViewChange("date");
      }
    }
  };

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

      const isCurrentCard = originalIndex === adjustedCurrentIndex;
      if (!isCurrentCard) return;

      // 드래그 범위 제한 (카드 너비의 50%로 제한)
      const maxDragDistance = cardDimensions.width * 0.5;
      const clampedMx = Math.max(-maxDragDistance, Math.min(maxDragDistance, mx));

      // 드래그 영역에 따라 다른 스와이프 감지 민감도 적용
      const target = event?.target as HTMLElement;
      const isScrollArea = target && target.closest('[data-radix-scroll-area-viewport]');
      const isTextArea = target && (
        target.closest('.prose') ||
        target.closest('.p-4') ||
        target.closest('.flex-1') ||
        target.closest('.overflow-hidden') ||
        target.closest('.rounded-lg') ||
        target.closest('.flex') ||
        target.closest('.flex-col') ||
        target.closest('.text-sm') ||
        target.closest('.text-xs') ||
        target.closest('.text-base') ||
        target.closest('.p-0') ||
        target.closest('.relative') ||
        target.closest('.text-gray-600') ||
        target.closest('.text-gray-500') ||
        target.closest('.text-black') ||
        target.closest('.text-white') ||
        target.closest('.font-medium') ||
        target.closest('.font-semibold') ||
        target.closest('.font-bold') ||
        target.closest('.leading-tight') ||
        target.closest('.leading-normal') ||
        target.closest('.break-words') ||
        target.closest('.whitespace-normal') ||
        target.closest('.overflow-y-auto') ||
        target.closest('.scrollbar-thin') ||
        target.closest('.scrollbar-thumb-gray-300')
      );
      
      // 스크롤 영역에서는 더 민감한 스와이프 감지, 텍스트 영역에서는 중간 민감도
      const swipeThreshold = isScrollArea ? cardDimensions.width * 0.05 : 
                           isTextArea ? cardDimensions.width * 0.1 : 
                           cardDimensions.width * 0.2;
      const velocityThreshold = isScrollArea ? 0.05 : 
                              isTextArea ? 0.1 : 
                              0.2;
      const trigger = Math.abs(clampedMx) > swipeThreshold || Math.abs(vx) > velocityThreshold;

      if (!down) {
        if (trigger) {
          const direction = dx > 0 ? -1 : 1;
          handleSwipe(direction);
        } else {
          api.start((i) => ({
            x: (i - currentIndex) * (cardDimensions.width + cardSpacing),
          }));
        }
      } else {
        // 드래그 영역 확인 (스크롤 영역, 텍스트 영역, 이미지 영역)
        const target = event?.target as HTMLElement;
        const isScrollAreaDrag = target && target.closest('[data-radix-scroll-area-viewport]');
        const isTextAreaDrag = target && (
          target.closest('.prose') ||
          target.closest('.p-4') ||
          target.closest('.flex-1') ||
          target.closest('.overflow-hidden') ||
          target.closest('.rounded-lg') ||
          target.closest('.flex') ||
          target.closest('.flex-col') ||
          target.closest('.text-sm') ||
          target.closest('.text-xs') ||
          target.closest('.text-base')
        );
        const isImageAreaDrag = target && target.closest('img');
        
        // 스크롤 영역, 텍스트 영역, 이미지 영역에서는 카드 애니메이션 없이 스와이프만 감지
        if (!isScrollAreaDrag && !isTextAreaDrag && !isImageAreaDrag) {
          api.start((i) => {
            if (i !== originalIndex) return;
            // 가운데 카드의 경우 기본 위치(0)에 드래그 거리를 더함
            const baseX = (i - currentIndex) * (cardDimensions.width + cardSpacing);
            return { x: baseX + clampedMx, immediate: true };
          });
        }
      }
    }
  );

  // 스크랩 상태 확인 API 호출 함수
  const getScrapStatus = async (snapshotId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap/status/${snapshotId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('스크랩 상태 확인에 실패했습니다.');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" data-card-viewer>
      {/* 왼쪽 버튼 */}
      <button
        onClick={() => handleSwipe(-1)}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
        aria-label="이전 카드"
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
        }}>
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="text-gray-600">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {cards.length > 0 && springs.map((style, i) => {
        const card = cards[i];
        if (!card) return null;
        
        console.log(`Rendering card ${i}:`, {
          snapshotId: card.snapshotId,
          stockCode: card.stockCode,
          stockName: card.stockName,
          currentIndex: adjustedCurrentIndex,
          opacity: style.opacity,
          scale: style.scale,
          x: style.x,
          visible: Math.abs(i - adjustedCurrentIndex) <= 1
        });

        return (
          <animated.div
            {...bind(i)}
            key={card.snapshotId}
            style={{
              ...style,
              position: "absolute",
              width: cardDimensions.width,
              height: cardDimensions.cardHeight,
              maxHeight: "85vh",
              touchAction: "pan-y",
              cursor: "grab",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}>
            <Dialog>
              <Card 
                className={`h-full flex flex-col shadow-lg relative cursor-pointer transition-all duration-200 ${
                  longPressingCardIndex === i ? 'scale-105 shadow-2xl border-2 border-blue-500' : ''
                }`}
                onClick={(e) => {
                  // 버튼 클릭이 아닌 카드 클릭일 때만 처리
                  if (!(e.target as HTMLElement).closest('button')) {
                    if (i !== adjustedCurrentIndex) {
                      console.log(`Card clicked: index ${i}, currentIndex: ${adjustedCurrentIndex}`);
                      setCurrentIndex(i);
                      // 종목별 카드일 때는 DateSelector로, 그룹 카드일 때는 StockSelector로 전환
                      if (onViewChange) {
                        if (isStockDetail) {
                          onViewChange("date");
                        } else if (isGroupDetail) {
                          onViewChange("stock");
                        }
                      }
                    }
                  }
                }}
                onMouseDown={() => handleMouseDown(card, i)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => handleMouseDown(card, i)}
                onTouchEnd={handleMouseUp}
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
              >
                <CardContent 
                  className="p-0 relative flex-1 overflow-hidden rounded-lg flex flex-col"
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                >
                  <div
                    className="w-full bg-gray-200 rounded-t-lg overflow-hidden"
                    style={{
                      height: cardDimensions.imageHeight,
                      minHeight: cardDimensions.imageHeight - 15,
                    }}>
                    {card.newsImage && (
                      <img
                        src={card.newsImage}
                        alt="News Image"
                        className="w-full h-full object-cover"
                        draggable="true"
                        style={{
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          msUserSelect: "none",
                        }}
                      />
                    )}
                  </div>

                  <ScrollArea 
                    style={{ 
                      touchAction: "pan-y",
                      height: cardDimensions.cardHeight - cardDimensions.imageHeight - 12,
                      minHeight: "250px",
                      maxHeight: Math.min(cardDimensions.cardHeight * 1.2, 1440)
                    }}
                  >
                    <div 
                      className="p-4 prose"
                      style={{
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        touchAction: "pan-y",
                        fontSize: cardDimensions.width < 480 ? "14px" : 
                                cardDimensions.width < 768 ? "15px" : 
                                cardDimensions.width <= 1024 ? "20px" : 
                                cardDimensions.width <= 1440 ? "32px" : "32px",
                        lineHeight: "1.7",
                        fontWeight: "400",
                      }}
                    >
                      <ReactMarkdown>{card.newsContent}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {card.personalizedComment && (
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`absolute p-0 backdrop-blur-sm rounded-full transition-all duration-200 bg-blue-500 hover:bg-blue-600 hover: text-white text-white ${
                      longPressingCardIndex === i ? 'scale-110' : ''
                    }`}
                    style={{
                      top: buttonPosition.top,
                      right: buttonPosition.commentRight,
                      width: buttonPosition.buttonSize,
                      height: buttonPosition.buttonSize,
                    }}>
                    <MessageSquare size={buttonPosition.iconSize} className="text-white transition-all duration-200" />
                  </Button>
                </DialogTrigger>
              )}

              <Button
                variant="ghost"
                size="icon"
                className={`absolute p-0 backdrop-blur-sm rounded-full transition-all duration-200 bg-blue-500 hover:bg-blue-600 ${
                  longPressingCardIndex === i ? 'scale-110' : ''
                }`}
                style={{
                  top: buttonPosition.top,
                  right: buttonPosition.heartRight,
                  width: buttonPosition.buttonSize,
                  height: buttonPosition.buttonSize,
                }}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  // 그룹 상세 정보인 경우 바로 삭제
                  if (isGroupDetail && onUnscrap) {
                    try {
                      await onUnscrap(card.snapshotId);
                      // onCardDelete는 호출하지 않음 (중복 방지)
                    } catch (error) {
                      console.error("Failed to delete from group:", error);
                    }
                    return;
                  }

                  // 일반 스크랩의 경우 그룹 추가 옵션 제공
                  toast.success("스크랩 옵션", {
                    action: {
                      label: "그룹에 추가",
                      onClick: async () => {
                        try {
                          setCurrentSnapshotId(card.snapshotId);
                          const scrapStatus = await getScrapStatus(card.snapshotId);
                          setCurrentScrapId(scrapStatus?.scrapId || null);
                          setShowGroupDialog(true);
                        } catch (error) {
                          toast.error("그룹 추가에 실패했습니다.");
                        }
                      },
                    },
                  });

                  // 스크랩 삭제 옵션도 제공
                  setTimeout(() => {
                    toast.success("스크랩 삭제", {
                      action: {
                        label: "스크랩 삭제",
                        onClick: async () => {
                          try {
                            const scrapStatus = await getScrapStatus(card.snapshotId);
                            if (scrapStatus?.scrapped && scrapStatus?.scrapId) {
                              const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL}/scrap/${scrapStatus.scrapId}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                              });
                              
                              if (response.ok) {
                                setLocalScrapStates((prev) => ({
                                  ...prev,
                                  [card.snapshotId]: false,
                                }));
                                toast.success("스크랩에서 제거되었습니다.");
                                
                                if (onCardDelete) {
                                  onCardDelete(card.snapshotId);
                                }
                              } else {
                                toast.error("스크랩 삭제에 실패했습니다.");
                              }
                            } else {
                              toast.error("스크랩 ID를 찾을 수 없습니다.");
                            }
                          } catch (error) {
                            toast.error("스크랩 삭제에 실패했습니다.");
                          }
                        },
                      },
                    });
                  }, 100);
                }}
              >
                <FaHeartCircleMinus
                  size={buttonPosition.iconSize}
                  className="text-red-500 hover:text-white transition-all duration-200"
                />
              </Button>

              {card.personalizedComment && (
                <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-xs">
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-2xl text-gray-800">
                    <DialogTitle className="font-bold text-center text-base text-indigo-700 mb-4 drop-shadow">AI Comment</DialogTitle>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {card.personalizedComment}
                    </p>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </animated.div>
        );
      })}

      {/* 오른쪽 버튼 */}
      <button
        onClick={() => handleSwipe(1)}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors z-20 mx-2"
        aria-label="다음 카드"
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
        }}>
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="text-gray-600">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

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
          }}
        />
      )}

      {/* 스크랩 삭제 확인 다이얼로그 */}
      <Dialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
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
              }}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (pendingDeleteSnapshotId && onUnscrap) {
                  try {
                    await onUnscrap(pendingDeleteSnapshotId);
                    setLocalScrapStates((prev) => {
                      return {
                        ...prev,
                        [pendingDeleteSnapshotId]: false,
                      };
                    });
                    toast.success("스크랩에서 제거되었습니다.");
                  } catch (error) {
                    toast.error("스크랩 삭제에 실패했습니다.");
                  }
                }
                setShowDeleteConfirmDialog(false);
                setPendingDeleteSnapshotId(null);
              }}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 카드 상세 보기 모달 */}
      <ScrapCardDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
      />
    </div>
  );
};
