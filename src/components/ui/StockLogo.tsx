"use client";

import { useState } from "react";
import Image from "next/image";
import { getStockLogoUrl } from "@/src/lib/utils"; // 1번 단계에서 만든 함수
import { AreaChart } from "lucide-react"; // 기본 아이콘으로 사용

interface StockLogoProps {
  stockId: string;
  stockName: string;
  size?: number;
}

export const StockLogo = ({
  stockId,
  stockName,
  size = 36,
}: StockLogoProps) => {
  const [imgSrc, setImgSrc] = useState(getStockLogoUrl(stockId));

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-gray-100 overflow-hidden"
      //   rounded-full(로고 동그랗게 속성)
    >
      <Image
        src={imgSrc}
        alt={`${stockName} 로고`}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        onError={() => {
          setImgSrc("");
        }}
      />
      {!imgSrc && (
        <AreaChart
          className="text-gray-400"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      )}
    </div>
  );
};
