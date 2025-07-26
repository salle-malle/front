"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [useLocalImage, setUseLocalImage] = useState(true);
  const [localImageError, setLocalImageError] = useState(false);

  const localImagePath = `/ticker-icon/${stockId}.png`;

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center bg-gray-100 rounded-full overflow-hidden"
    >
      {useLocalImage && !localImageError ? (
        <img
          src={localImagePath}
          alt={`${stockName} 로고`}
          className="object-cover w-full h-full"
          onError={() => {
            setLocalImageError(true);
            setUseLocalImage(false);
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
          {stockName.charAt(0)}
        </div>
      )}
    </div>
  );
};
