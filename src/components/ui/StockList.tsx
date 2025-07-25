"use client";

import { UnifiedStockItem } from "@/src/types/ApiResponse";
import { StockLogo } from "./StockLogo";

interface StockListProps {
  stocks: UnifiedStockItem[];
  onStockClick?: (stock: UnifiedStockItem) => void;
}

export const StockList = ({ stocks, onStockClick }: StockListProps) => {
  const formatNumber = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };

  const formatCurrency = (value: string, currency: string = "KRW") => {
    const num = parseFloat(value);
    if (isNaN(num)) return "₩0";
    
    if (currency === "USD") {
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₩${num.toLocaleString()}`;
  };

  const getProfitLossColor = (profitLossRate: string) => {
    const rate = parseFloat(profitLossRate);
    if (isNaN(rate)) return "text-gray-500";
    return rate > 0 ? "text-red-500" : rate < 0 ? "text-blue-500" : "text-gray-500";
  };

  const getProfitLossSign = (profitLossRate: string) => {
    const rate = parseFloat(profitLossRate);
    if (isNaN(rate)) return "";
    return rate > 0 ? "+" : "";
  };

  return (
    <div className="space-y-2">
      {stocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          보유 종목이 없습니다.
        </div>
      ) : (
        stocks.map((stock) => (
          <div
            key={stock.pdno}
            className={`bg-white rounded-lg p-4 shadow-sm border ${
              onStockClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
            }`}
            onClick={() => onStockClick?.(stock)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <StockLogo stockId={stock.pdno} stockName={stock.prdt_name} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-sm truncate">
                      {stock.prdt_name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {stock.stock_type === "REGULAR" ? "일반" : "소수점"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {stock.pdno} • {stock.exchange}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCurrency(stock.current_price, stock.currency)}
                </div>
                <div className={`text-xs ${getProfitLossColor(stock.profit_loss_rate)}`}>
                  {getProfitLossSign(stock.profit_loss_rate)}
                  {formatNumber(stock.profit_loss_rate)}%
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
              <div>
                <div className="text-gray-400">보유수량</div>
                <div className="font-medium">{formatNumber(stock.quantity)}주</div>
              </div>
              <div>
                <div className="text-gray-400">평균단가</div>
                <div className="font-medium">
                  {formatCurrency(stock.avg_price, stock.currency)}
                </div>
              </div>
              <div>
                <div className="text-gray-400">평가금액</div>
                <div className="font-medium">
                  {formatCurrency(stock.evaluation_amount, stock.currency)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}; 