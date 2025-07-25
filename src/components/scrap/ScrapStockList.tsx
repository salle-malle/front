"use client";

import { UnifiedStockResponse } from "@/src/types/ApiResponse";
import { useState } from "react";

interface ScrapStockListProps {
  unifiedStocks: UnifiedStockResponse | null;
  onStockClick: (stockCode: string) => void;
  selectedStockCode?: string | null;
}

const StockLogoWithFallback = ({ stockId, stockName, size }: { stockId: string; stockName: string; size: number }) => {
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

export const ScrapStockList = ({
  unifiedStocks,
  onStockClick,
  selectedStockCode,
}: ScrapStockListProps) => {
  if (!unifiedStocks || !unifiedStocks.stocks || unifiedStocks.stocks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">보유 종목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4">
      {/* <div className="mb-[1%]">
      </div> */}
      <div className="space-y-3 mb-[18%]">
        {unifiedStocks.stocks.map((stock) => (
          <div
            key={stock.pdno}
            className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
              selectedStockCode === stock.pdno ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => onStockClick(stock.pdno)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <StockLogoWithFallback 
                    stockId={stock.pdno} 
                    stockName={stock.prdt_name} 
                    size={40} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm truncate">
                      {stock.prdt_name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stock.pdno} • {stock.exchange}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium">
                  {parseFloat(stock.current_price).toLocaleString()}
                </div>
                <div
                  className={`text-xs ${
                    parseFloat(stock.profit_loss_rate) > 0
                      ? "text-red-500"
                      : parseFloat(stock.profit_loss_rate) < 0
                      ? "text-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {parseFloat(stock.profit_loss_rate) > 0 ? "+" : ""}
                  {parseFloat(stock.profit_loss_rate).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>
                <div className="text-gray-400">보유수량</div>
                <div className="font-medium">
                  {parseFloat(stock.quantity).toLocaleString()}주
                </div>
              </div>
              <div>
                <div className="text-gray-400">평균단가</div>
                <div className="font-medium">
                  {parseFloat(stock.avg_price).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">평가금액</div>
                <div className="font-medium">
                  {parseFloat(stock.evaluation_amount).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 