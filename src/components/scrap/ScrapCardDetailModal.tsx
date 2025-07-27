"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { SnapshotCard } from "@/src/types/SnapshotCard";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ScrapCardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: SnapshotCard | null;
}

export const ScrapCardDetailModal = ({
  isOpen,
  onClose,
  card,
}: ScrapCardDetailModalProps) => {
  const [isAiCommentExpanded, setIsAiCommentExpanded] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 드래그 진행률 (0-1)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);

  useEffect(() => {
    if (card) {
      setIsAiCommentExpanded(false); // 모달이 열릴 때마다 AI Comment 접기
      setDragProgress(0); // 드래그 진행률 초기화
    }
  }, [card]);

  // AI Comment 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!card?.personalizedComment) return;
    setIsDragging(false); // 초기 상태는 false로 시작
    setDragStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!card?.personalizedComment) return;
    
    const dragDistance = Math.abs(dragStartY - e.clientY);
    
    // 최소 드래그 거리(5px) 이상 움직였을 때만 드래그로 인식
    if (dragDistance > 5) {
      setIsDragging(true);
    }
    
    if (isDragging) {
      const actualDragDistance = dragStartY - e.clientY; // 위로 드래그할 때 양수
      const dragThreshold = 100; // 100px 드래그 시 완전히 열림
      const progress = Math.min(1, Math.max(0, actualDragDistance / dragThreshold));
      
      setDragProgress(progress);
    }
  };

  const handleMouseUp = () => {
    if (!card?.personalizedComment) return;
    
    if (isDragging) {
      // 드래그가 있었을 때만 처리
      if (dragProgress > 0.5) {
        // 충분히 드래그했을 때 열기
        setIsAiCommentExpanded(true);
        setDragProgress(1);
      } else {
        // 충분히 드래그하지 않았을 때 원래 상태 유지
        setDragProgress(0);
      }
    }
    
    // 드래그 상태 초기화
    setIsDragging(false);
  };

  const handleClick = () => {
    // 드래그가 아닌 클릭일 때만 토글
    if (!isDragging && card?.personalizedComment) {
      setIsAiCommentExpanded(!isAiCommentExpanded);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl h-[95vh] translate-x-[-50%] translate-y-[-50%] border bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "p-0 flex flex-col rounded-2xl overflow-hidden"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">스크랩 뉴스 상세보기</DialogTitle>
          <div className="relative w-full h-full flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-1 border-b bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900"></h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 이미지 섹션 */}
            {card.newsImage && (
              <div className="w-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  src={card.newsImage}
                  alt="News Image"
                  className="w-full h-80 object-cover"
                />
              </div>
            )}

            {/* 콘텐츠 섹션 */}
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 px-6 pt-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{card.newsContent}</ReactMarkdown>
                </div>
              </ScrollArea>

              {card.personalizedComment && (
                <div className="flex justify-center items-center mb-4 flex-shrink-0">
                  <div 
                    className={`relative bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl shadow-2xl border border-blue-200 max-w-2xl w-full cursor-pointer transition-all duration-300 ease-in-out ${
                      isAiCommentExpanded 
                        ? 'px-6 pb-6 transform translate-y-0' 
                        : 'p-4 transform translate-y-2 hover:translate-y-0 hover:shadow-xl'
                    }`}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => {
                      if (isDragging) {
                        handleMouseUp();
                      }
                    }}
                    style={{
                      transform: isDragging ? `translateY(${-dragProgress * 20}px)` : undefined,
                      boxShadow: isDragging ? `0 ${dragProgress * 20}px 40px rgba(0,0,0,0.1)` : undefined,
                    }}
                  >
                    <div className={`font-bold text-center text-lg text-indigo-700 drop-shadow flex items-center justify-center ${
                      isAiCommentExpanded ? 'pt-4' : ''
                    }`}>
                      AI Comment
                      <span className="ml-2 text-sm transition-transform duration-300">
                        {isAiCommentExpanded ? '▼' : '▲'}
                      </span>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isAiCommentExpanded 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <div className={`${isAiCommentExpanded ? 'py-4' : ''}`}>
                        <p className="text-base text-left md:text-lg text-gray-800 leading-relaxed font-medium drop-shadow-sm">
                          {card.personalizedComment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}; 