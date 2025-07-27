"use client";

import React from "react";
import { useSprings, animated } from "react-spring";
import { useDrag } from "react-use-gesture";
import { Card, CardContent } from "./card";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "./scroll-area";
import { FaHeartCirclePlus, FaHeartCircleMinus } from "react-icons/fa6";
import { ScrapGroupDialog } from "./ScrapGroupDialog";
import { CardDetailModal } from "./CardDetailModal";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// 타이핑 애니메이션 훅 제거됨 (성능 최적화)

interface CardViewerProps {
  cards: SnapshotCard[];
  currentIndex: number;
  onSwipe: (direction: number) => void;
  onCardClick?: (index: number) => void; // 카드 클릭 시 인덱스 변경 함수 추가
  onScrap: (snapshotId: number) => Promise<number | null>; // 스크랩 ID를 반환하도록 수정
  onUnscrap?: (snapshotId: number) => Promise<void>; // 스크랩 삭제 함수 추가
  onUnscrapSuccess?: (snapshotId: number) => void; // 스크랩 삭제 성공 시 콜백 추가
}

// 반응형 카드 크기 계산 함수
const getCardDimensions = () => {
  if (typeof window === 'undefined') {
    return { width: 320, imageHeight: 160, cardHeight: 400 };
  }
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // 화면 크기에 따른 카드 크기 조정
  if (screenWidth < 480) {
    // 모바일 세로 (세로 모드)
    const availableHeight = screenHeight - 350; // 네비게이션, 헤더 등 제외
    return { 
      width: Math.min(screenWidth - 40, 280), 
      imageHeight: Math.min(screenHeight * 0.25, 140),
      cardHeight: Math.min(availableHeight * 0.95, 576) // 320 * 1.8 = 576
    };
  } else if (screenWidth < 768) {
    // 모바일 가로 / 태블릿 세로
    const availableHeight = screenHeight - 350;
    return { 
      width: Math.min(screenWidth - 60, 320), 
      imageHeight: Math.min(screenHeight * 0.28, 160),
      cardHeight: Math.min(availableHeight * 0.95, 684) // 380 * 1.8 = 684
    };
  } else if (screenWidth < 1024) {
    // 태블릿 가로
    const availableHeight = screenHeight - 300;
    return { 
      width: Math.min(screenWidth - 80, 400), 
      imageHeight: Math.min(screenHeight * 0.3, 200),
      cardHeight: Math.min(availableHeight * 0.95, 756) // 420 * 1.8 = 756
    };
  } else if (screenWidth < 1440) {
    // 중간 데스크톱 (1024px ~ 1440px)
    const availableHeight = screenHeight - 140;
    return { 
      width: Math.min(screenWidth - 100, 420), // 너비 제한
      imageHeight: Math.min(screenHeight * 0.35, 210),
      cardHeight: Math.min(availableHeight * 0.95, 756) // 420 * 1.8 = 756
    };
  } else if (screenWidth < 1920) {
    // 대형 데스크톱 (1440px ~ 1920px)
    const availableHeight = screenHeight - 250;
    return { 
      width: Math.min(screenWidth - 120, 460), // 너비 제한
      imageHeight: Math.min(screenHeight * 0.35, 230),
      cardHeight: Math.min(availableHeight * 0.95, 828) // 460 * 1.8 = 828
    };
  } else {
    // 초대형 데스크톱 (1920px 이상)
    const availableHeight = screenHeight - 300;
    return { 
      width: Math.min(screenWidth - 140, 500), // 너비 제한
      imageHeight: Math.min(screenHeight * 0.35, 250),
      cardHeight: Math.min(availableHeight * 0.95, 900) // 500 * 1.8 = 900
    };
  }
};

const CARD_WIDTH = getCardDimensions().width;
const CARD_IMAGE_HEIGHT = getCardDimensions().imageHeight;

export const CardViewer = ({
  cards,
  currentIndex,
  onSwipe,
  onCardClick,
  onScrap,
  onUnscrap,
  onUnscrapSuccess,
}: CardViewerProps) => {
  const [localScrapStates, setLocalScrapStates] = React.useState<{
    [key: number]: boolean;
  }>({});
  const [showGroupDialog, setShowGroupDialog] = React.useState(false);
  const [currentSnapshotId, setCurrentSnapshotId] = React.useState<
    number | null
  >(null);
  const [currentScrapId, setCurrentScrapId] = React.useState<number | null>(
    null
  );
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] =
    React.useState(false);
  const [pendingDeleteSnapshotId, setPendingDeleteSnapshotId] = React.useState<
    number | null
  >(null);
  
  // 길게 누르기 관련 상태
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<SnapshotCard | null>(null);
  const [isLongPressing, setIsLongPressing] = React.useState(false);
  const [longPressingCardIndex, setLongPressingCardIndex] = React.useState<number | null>(null);
  
  // 타이핑 애니메이션은 각 카드별로 개별 적용
  
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
  
  // 카드 간격 계산 (화면 크기에 따라 조정)
  const getCardSpacing = () => {
    if (cardDimensions.width < 300) return 20; // 모바일
    if (cardDimensions.width < 400) return 30; // 태블릿
    return 40; // 데스크톱
  };
  
  const cardSpacing = getCardSpacing();
  
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
  
  // 버튼 위치 및 크기 계산 함수
  const getButtonPosition = () => {
    const imageHeight = cardDimensions.imageHeight;
    
    // 카드 크기에 따른 버튼 크기 조정
    const buttonSize = Math.max(32, Math.min(40, cardDimensions.width * 0.1)); // 카드 너비의 12%, 최소 32px, 최대 48px
    const iconSize = buttonSize * 0.85; // 아이콘 크기는 버튼 크기의 85%
    
    return {
      // 이미지 영역의 오른쪽 아래에 위치
      top: imageHeight - buttonSize - 15, // 이미지 하단에서 버튼 크기 + 10px 위
      heartRight: 10, // 오른쪽에서 10px
      commentRight: buttonSize + 20, // 댓글 버튼 위치 (하트 버튼 왼쪽)
      buttonSize,
      iconSize,
    };
  };
  
  const buttonPosition = getButtonPosition();
  
  const [springs, api] = useSprings(cards.length, (i) => ({
    x: (i - currentIndex) * (cardDimensions.width + cardSpacing),
    scale: i === currentIndex ? 1 : 0.85,
    opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1,
  }), [cards.length, currentIndex, cardDimensions.width, cardSpacing]);

  React.useEffect(() => {
    // 카드 배열이 변경되거나 currentIndex가 변경될 때 스프링 애니메이션 리셋
    api.start((i) => {
      const newX = (i - currentIndex) * (cardDimensions.width + cardSpacing);
      const newScale = i === currentIndex ? 1 : 0.85;
      const newOpacity = Math.abs(i - currentIndex) > 1 ? 0 : 1;
      
      return {
        x: newX,
        scale: newScale,
        opacity: newOpacity,
      };
    });
  }, [currentIndex, api, cardDimensions.width, cardSpacing, cards.length]);

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
        if (target.closest("button")) {
          return;
        }
      }

      const isCurrentCard = originalIndex === currentIndex;
      if (!isCurrentCard) return;

      // 드래그 시작 시 길게 누르기 타이머 취소
      if (down && longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
        setIsLongPressing(false);
        setLongPressingCardIndex(null);
      }

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
      const swipeThreshold = isScrollArea ? cardDimensions.width * 0.08 : 
                           isTextArea ? cardDimensions.width * 0.15 : 
                           cardDimensions.width * 0.25;
      const velocityThreshold = isScrollArea ? 0.08 : 
                              isTextArea ? 0.15 : 
                              0.25;
      const trigger = Math.abs(clampedMx) > swipeThreshold || Math.abs(vx) > velocityThreshold;

      if (!down) {
        if (trigger) {
          const direction = dx > 0 ? -1 : 1;
          onSwipe(direction);
        } else {
          // 스와이프 취소 시 부드러운 애니메이션으로 원위치 복귀
          api.start((i) => ({
            x: (i - currentIndex) * (cardDimensions.width + cardSpacing),
            scale: i === currentIndex ? 1 : 0.85,
            opacity: Math.abs(i - currentIndex) > 1 ? 0 : 1,
            config: { tension: 300, friction: 30 } // 부드러운 스프링 애니메이션
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
            const newX = baseX + clampedMx;
            
            // 스와이프 진행률에 따른 스케일 조정 (피드백 개선)
            const swipeProgress = Math.abs(clampedMx) / (cardDimensions.width * 0.5);
            const scaleAdjustment = 1 - (swipeProgress * 0.05); // 최대 5% 축소
            
            return { 
              x: newX, 
              scale: scaleAdjustment,
              immediate: true 
            };
          });
        }
      }
    }
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" data-card-viewer>
      {cards.length > 0 && springs.map((style, i) => {
        const card = cards[i];
        if (!card) return null;

        // 타이핑 애니메이션 제거 - 성능 최적화

        return (
                      <animated.div
              {...bind(i)}
              key={card.snapshotId}
              style={{
                ...style,
                position: "absolute",
                width: cardDimensions.width,
                height: cardDimensions.cardHeight,
                maxHeight: "85vh", // 뷰포트 높이의 85%로 제한
                touchAction: "none", // 모바일에서 가로/세로 스와이프 모두 허용
                cursor: "grab",
                userSelect: "none", // 드래그 선택 방지
                WebkitUserSelect: "none", // Safari 지원
                MozUserSelect: "none", // Firefox 지원
                msUserSelect: "none", // IE 지원
                WebkitTouchCallout: "none", // iOS에서 컨텍스트 메뉴 방지
                WebkitTapHighlightColor: "transparent", // 터치 하이라이트 제거
              }}>
            <Dialog>
              <Card 
                className={`h-full flex flex-col shadow-lg relative cursor-pointer transition-all duration-200 ${
                  longPressingCardIndex === i ? 'scale-105 shadow-2xl border-2 border-blue-500' : ''
                }`}
                onClick={(e) => {
                  // 버튼 클릭이 아닌 카드 클릭일 때만 처리
                  if (!(e.target as HTMLElement).closest('button')) {
                    // 클릭한 카드가 현재 카드가 아닐 때만 전환
                    if (i !== currentIndex && onCardClick) {
                      onCardClick(i);
                    }
                  }
                }}
                onMouseDown={() => handleMouseDown(card, i)}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => handleMouseDown(card, i)}
                onTouchEnd={handleMouseUp}
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
                      touchAction: "pan-y", // 세로 스크롤만 허용 (텍스트 영역)
                      height: cardDimensions.cardHeight - cardDimensions.imageHeight- 12, // 이미지 높이와 패딩을 제외한 고정 높이
                      minHeight: "250px", // 최소 높이 보장 (100 * 1.8)
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
                        touchAction: "pan-y", // 세로 스크롤만 허용
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
              {/* 스크랩/언스크랩 버튼 */}
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

                  const isCurrentlyScraped =
                    card.isScrap || localScrapStates[card.snapshotId];

                  try {
                    if (isCurrentlyScraped && onUnscrap) {
                      // 스크랩 삭제 확인 다이얼로그 표시
                      setPendingDeleteSnapshotId(card.snapshotId);
                      setShowDeleteConfirmDialog(true);
                    } else {
                      // 스크랩 추가
                      const scrapId = await onScrap(card.snapshotId);

                      // API 성공 시 로컬 상태 업데이트
                      setLocalScrapStates((prev) => {
                        return {
                          ...prev,
                          [card.snapshotId]: true,
                        };
                      });

                      // 그룹 추가 확인 토스트
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
                    // API 실패 시 로컬 상태 변경하지 않음
                  }

                }}
              >
                {card.isScrap || localScrapStates[card.snapshotId] ? (
                  <FaHeartCircleMinus
                    size={buttonPosition.iconSize}
                    className="text-red-500 hover:text-white transition-all duration-200"
                  />
                ) : (
                  <FaHeartCirclePlus
                    size={buttonPosition.iconSize}
                    className="text-white hover:text-red-500 transition-all duration-200"
                  />
                )}
              </Button>

              {card.personalizedComment && (
                <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-xs">
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-2xl text-gray-800">
                    {/* 상단 헤더 영역 */}
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

                    // 로컬 상태 업데이트
                    setLocalScrapStates((prev) => {
                      return {
                        ...prev,
                        [pendingDeleteSnapshotId]: false,
                      };
                    });

                    // 부모 컴포넌트에 스크랩 삭제 성공 알림
                    if (onUnscrapSuccess) {
                      onUnscrapSuccess(pendingDeleteSnapshotId);
                    }

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
      <CardDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        onScrap={onScrap}
        onUnscrap={onUnscrap}
      />
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
