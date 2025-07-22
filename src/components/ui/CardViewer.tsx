"use client";

import { useDrag } from "react-use-gesture";
import { useSpring, animated, useTransition } from "react-spring";
import { Card, CardContent } from "./card";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { MessageSquare } from "lucide-react";

interface CardViewerProps {
  card: SnapshotCard;
  onSwipe: (direction: number) => void;
}

const CARD_IMAGE_HEIGHT = 160;

export const CardViewer = ({ card, onSwipe }: CardViewerProps) => {
  // 카드 전환 애니메이션 (react-spring/useTransition)
  const transitions = useTransition(card, {
    from: { opacity: 0, transform: "scale(0.95)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(1.05)", position: "absolute" },
    config: { tension: 300, friction: 30 },
  });

  // 상하좌우 드래그를 위한 Spring
  const [{ x, y, scale }, api] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));

  const bind = useDrag(
    ({ down, movement: [mx], direction: [dx], vxvy: [vx], axis }) => {
      if (!down) {
        // --- 드래그 종료 시 ---
        // 1. 좌우 스와이프만 허용
        if (
          Math.abs(mx) > window.innerWidth / 3 ||
          (Math.abs(vx) > 0.5 && axis === "x")
        ) {
          const direction = dx > 0 ? 1 : -1;
          // 부모에게 스와이프 이벤트 전달
          onSwipe(direction);
          return;
        }
        // 2. 제자리로 복귀
        api.start({ x: 0, y: 0, scale: 1 });
      } else {
        // --- 드래그 중 ---
        // 좌우만 따라감, 상하는 무시
        api.start({ x: mx, y: 0, scale: 1, immediate: true });
      }
    }
  );

  return transitions((style, item) => (
    <Dialog>
      <animated.div
        {...bind()}
        style={{ ...style, x, y, scale, touchAction: "pan-x" }}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <div className="p-4 h-full pb-24">
          <Card className="h-full flex flex-col shadow-lg max-h-[calc(100vh-200px)] relative">
            <CardContent className="p-0 relative flex-1 overflow-hidden rounded-lg flex flex-col">
              <div className="relative z-10 bg-white h-full w-full rounded-lg flex flex-col">
                <div
                  className="w-full bg-gray-200 rounded-t-lg"
                  style={{ height: CARD_IMAGE_HEIGHT }}
                >
                  {/* 이미지 영역 */}
                </div>
                <div className="p-4 flex-1 overflow-y-auto max-h-full">
                  {/* <p className="font-bold text-lg mb-2">
                    {item.stockName} ({item.stockCode})
                  </p> */}
                  <p
                    className="text-gray-600 text-sm overflow-y-auto"
                    style={{ maxHeight: "100%" }}
                  >
                    {item.newsContent}
                  </p>
                </div>
              </div>
            </CardContent>

            {/* Comment 버튼: DialogTrigger */}
            {item.personalizedComment && (
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="absolute bottom-4 right-4 h-12 w-12 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center z-20"
                >
                  <MessageSquare size={24} />
                </Button>
              </DialogTrigger>
            )}
          </Card>
        </div>
      </animated.div>

      {/* Comment 말풍선: DialogContent */}
      {item.personalizedComment && (
        <DialogContent className="bg-transparent border-none shadow-none outline-none p-0">
          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-xs mx-auto">
            <h4 className="font-bold text-gray-800 mb-2">
              AI Comment
            </h4>
            <p className="text-sm text-gray-600 break-words">
              {item.personalizedComment}
            </p>

            <div className="relative left-1/2 -bottom-2.5 w-5 h-5 bg-white transform rotate-45 -z-10"></div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  ));
};
