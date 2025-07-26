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
  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl h-[80vh] translate-x-[-50%] translate-y-[-50%] border bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "p-0 flex flex-col rounded-2xl overflow-hidden"
          )}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">스크랩 뉴스 상세보기</DialogTitle>
          <div className="relative w-full h-full flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
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
              <div className="w-full bg-gray-200 overflow-hidden">
                <img
                  src={card.newsImage}
                  alt="News Image"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* 콘텐츠 섹션 */}
            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{card.newsContent}</ReactMarkdown>
                </div>
              </ScrollArea>

              {card.personalizedComment && (
                <div className="flex justify-center items-center mt-6 mb-4">
                  <div className="relative bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6 rounded-2xl shadow-2xl border border-blue-200 max-w-2xl w-full animate-fade-in">
                    
                    <div className="font-bold text-center text-lg text-indigo-700 mb-4 drop-shadow">AI Comment</div>
                    <p className="text-base text-left md:text-lg text-gray-800 leading-relaxed font-medium drop-shadow-sm">
                      {card.personalizedComment}
                    </p>
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