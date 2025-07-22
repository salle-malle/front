"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { BarChart3, ZoomIn, ZoomOut, Move } from "lucide-react";

interface StockChartProps {
  stockCode: string;
}

type ChartPeriod = "1W" | "1M" | "6M" | "1Y" | "5Y" | "10Y";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface AlphaVantageData {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
  };
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    };
  };
}

export function StockChart({ stockCode }: StockChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1Y");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 0.1 ~ 3.0
  const [panOffset, setPanOffset] = useState(0); // 패닝 오프셋
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: "1W", label: "1주" },
    { value: "1M", label: "1개월" },
    { value: "6M", label: "6개월" },
    { value: "1Y", label: "1년" },
    { value: "5Y", label: "5년" },
    { value: "10Y", label: "10년" },
  ];

  // Alpha Vantage API에서 데이터 가져오기
  const fetchStockData = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stock-data?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error("데이터를 가져오는데 실패했습니다.");
      }

      const data: AlphaVantageData = await response.json();

      if (!data["Time Series (Daily)"]) {
        throw new Error("주식 데이터를 찾을 수 없습니다.");
      }

      // 데이터를 CandleData 형식으로 변환
      const timeSeriesData = data["Time Series (Daily)"];
      const candleData: CandleData[] = Object.entries(timeSeriesData)
        .map(([date, values]) => ({
          time: new Date(date).getTime() / 1000,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"]),
        }))
        .sort((a, b) => a.time - b.time); // 날짜순 정렬

      setChartData(candleData);
    } catch (err) {
      console.error("주식 데이터 가져오기 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 기간에 따른 데이터 필터링
  const getFilteredData = (data: CandleData[], period: ChartPeriod) => {
    const now = new Date();
    const periods = {
      "1W": 7,
      "1M": 30,
      "6M": 180,
      "1Y": 365,
      "5Y": 1825,
      "10Y": 3650,
    };

    const daysToSubtract = periods[period];
    const cutoffDate = new Date(
      now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000
    );
    const cutoffTime = cutoffDate.getTime() / 1000;

    return data.filter((item) => item.time >= cutoffTime);
  };

  // 줌 레벨과 패닝에 따른 데이터 조정
  const getZoomedAndPannedData = (
    data: CandleData[],
    zoom: number,
    pan: number
  ) => {
    if (!data || data.length === 0) return [];

    const baseCount = 50; // 기본 표시 캔들 수
    const targetCount = Math.max(10, Math.floor(baseCount / zoom));

    // 패닝 오프셋 계산 (전체 데이터에서 이동할 인덱스)
    const maxPanOffset = Math.max(0, data.length - targetCount);
    const adjustedPanOffset = Math.min(
      maxPanOffset,
      Math.max(0, Math.floor(pan))
    );

    // 안전한 인덱스 계산
    const startIndex = Math.max(
      0,
      data.length - targetCount - adjustedPanOffset
    );
    const endIndex = Math.max(startIndex, data.length - adjustedPanOffset);

    return data.slice(startIndex, endIndex);
  };

  // 스크롤 이벤트 핸들러 (줌)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel((prev) => Math.max(0.1, Math.min(3.0, prev * delta)));
  }, []);

  // 마우스 드래그 이벤트 핸들러 (패닝)
  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsPanning(true);
    setPanStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        const deltaX = e.clientX - panStart;
        // 마우스 움직임과 차트 움직임을 1:1로 맞춤
        setPanOffset((prev) => prev + deltaX);
        setPanStart(e.clientX);
      }
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 터치 이벤트 핸들러 (줌 + 패닝)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      // 핀치 줌
      setIsDragging(true);
      setDragStart(e.touches[0].clientX);
    } else if (e.touches.length === 1) {
      // 단일 터치 패닝
      setIsPanning(true);
      setPanStart(e.touches[0].clientX);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2 && isDragging) {
        // 핀치 줌
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const delta = (dragStart - currentX) / 100;
        setZoomLevel((prev) =>
          Math.max(0.1, Math.min(3.0, prev + delta * 0.1))
        );
        setDragStart(currentX);
      } else if (e.touches.length === 1 && isPanning) {
        // 단일 터치 패닝 - 마우스와 동일한 1:1 비율
        e.preventDefault();
        const deltaX = e.touches[0].clientX - panStart;
        setPanOffset((prev) => prev + deltaX);
        setPanStart(e.touches[0].clientX);
      }
    },
    [isDragging, isPanning, dragStart, panStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  // 줌 컨트롤
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3.0, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.1, prev / 1.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
  };

  useEffect(() => {
    if (stockCode) {
      fetchStockData(stockCode);
    }
  }, [stockCode]);

  // 기간 변경 시 차트 리렌더링을 위한 상태
  const [chartKey, setChartKey] = useState(0);

  // 기간 변경 핸들러
  const handlePeriodChange = (period: ChartPeriod) => {
    setSelectedPeriod(period);
    setChartKey((prev) => prev + 1); // 차트 강제 리렌더링
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mouseleave", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mouseleave", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // 캔들 차트 렌더링
  const renderCandles = useCallback(() => {
    if (chartData.length === 0) return null;

    const filteredData = getFilteredData(chartData, selectedPeriod);
    if (filteredData.length === 0) return null;

    const zoomedAndPannedData = getZoomedAndPannedData(
      filteredData,
      zoomLevel,
      panOffset
    );

    // 데이터 유효성 검사
    if (zoomedAndPannedData.length === 0) return null;

    const maxPrice = Math.max(...zoomedAndPannedData.map((d) => d.high));
    const minPrice = Math.min(...zoomedAndPannedData.map((d) => d.low));
    const priceRange = maxPrice - minPrice || 1;

    const containerHeight = 300;
    const containerWidth = 400;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const chartWidth = containerWidth - margin.left - margin.right;
    const chartHeight = containerHeight - margin.top - margin.bottom;

    const candleWidth = chartWidth / zoomedAndPannedData.length;
    const candleSpacing = candleWidth * 0.7;

    // 안전한 좌표 계산 함수
    const safeCoordinate = (value: number): number => {
      return isNaN(value) || !isFinite(value) ? 0 : value;
    };

    // 가격 눈금 생성
    const priceTicks = [];
    const tickCount = 6;
    for (let i = 0; i <= tickCount; i++) {
      const price = minPrice + (priceRange * i) / tickCount;
      priceTicks.push(price);
    }

    // 시간 눈금 생성
    const timeTicks = [];
    const timeTickCount = 5;
    for (let i = 0; i <= timeTickCount; i++) {
      const index = Math.floor(
        ((zoomedAndPannedData.length - 1) * i) / timeTickCount
      );
      if (zoomedAndPannedData[index]) {
        const date = new Date(zoomedAndPannedData[index].time * 1000);
        timeTicks.push({
          x: safeCoordinate(margin.left + index * candleWidth),
          label: date.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          }),
        });
      }
    }

    return (
      <div className="flex items-center justify-center h-full">
        <svg
          width={containerWidth}
          height={containerHeight}
          className="mx-auto"
        >
          {/* 배경 */}
          <rect width="100%" height="100%" fill="#ffffff" />

          {/* 가격 눈금과 그리드 */}
          {priceTicks.map((price, index) => {
            const y = safeCoordinate(
              margin.top + ((maxPrice - price) / priceRange) * chartHeight
            );
            return (
              <g key={`price-${index}`}>
                {/* 그리드 라인 */}
                <line
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                {/* 가격 라벨 */}
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  ${price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* 시간 눈금 */}
          {timeTicks.map((tick, index) => (
            <text
              key={`time-${index}`}
              x={tick.x}
              y={containerHeight - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {tick.label}
            </text>
          ))}

          {/* 캔들 차트 */}
          {zoomedAndPannedData.map((candle, index) => {
            const x = safeCoordinate(
              margin.left +
                index * candleWidth +
                (candleWidth - candleSpacing) / 2
            );
            const isUp = candle.close >= candle.open;

            // 가격을 차트 높이로 변환 (안전한 계산)
            const highY = safeCoordinate(
              margin.top + ((maxPrice - candle.high) / priceRange) * chartHeight
            );
            const lowY = safeCoordinate(
              margin.top + ((maxPrice - candle.low) / priceRange) * chartHeight
            );
            const openY = safeCoordinate(
              margin.top + ((maxPrice - candle.open) / priceRange) * chartHeight
            );
            const closeY = safeCoordinate(
              margin.top +
                ((maxPrice - candle.close) / priceRange) * chartHeight
            );

            const bodyTop = Math.min(openY, closeY);
            const bodyBottom = Math.max(openY, closeY);
            const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

            return (
              <g key={index}>
                {/* Wick (심지) */}
                <line
                  x1={safeCoordinate(x + candleSpacing / 2)}
                  y1={highY}
                  x2={safeCoordinate(x + candleSpacing / 2)}
                  y2={lowY}
                  stroke={isUp ? "#ef4444" : "#3b82f6"}
                  strokeWidth="1.5"
                />
                {/* Body (몸통) */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleSpacing}
                  height={bodyHeight}
                  fill={isUp ? "#ef4444" : "#3b82f6"}
                  stroke={isUp ? "#ef4444" : "#3b82f6"}
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* 차트 테두리 */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth}
            height={chartHeight}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  }, [chartData, selectedPeriod, zoomLevel, panOffset]);

  return (
    <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-gray-900">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            주가 차트
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-500 min-w-[40px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              className="text-xs px-2"
            >
              리셋
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 기간 선택 버튼 */}
        <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handlePeriodChange(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* 차트 영역 */}
        <div
          key={chartKey} // 기간 변경 시 차트 강제 리렌더링
          ref={chartContainerRef}
          className={`h-80 bg-white rounded-lg border border-gray-200 ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">차트 로딩 중...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-500 mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchStockData(stockCode)}
                >
                  다시 시도
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">{renderCandles()}</div>
          )}
        </div>

        {/* 조작 안내 */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            마우스 휠: 확대/축소 | 드래그: 좌우 이동 | 핀치: 확대/축소
          </p>
        </div>

        {/* 차트 정보 */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">현재가</p>
            <p className="font-semibold text-gray-900">
              {chartData.length > 0
                ? `$${chartData[chartData.length - 1].close.toFixed(2)}`
                : "$0.00"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">고가</p>
            <p className="font-semibold text-red-500">
              {(() => {
                if (chartData.length === 0) return "$0.00";
                const filteredData = getFilteredData(chartData, selectedPeriod);
                if (filteredData.length === 0) return "$0.00";
                return `$${Math.max(...filteredData.map((d) => d.high)).toFixed(
                  2
                )}`;
              })()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">저가</p>
            <p className="font-semibold text-blue-500">
              {(() => {
                if (chartData.length === 0) return "$0.00";
                const filteredData = getFilteredData(chartData, selectedPeriod);
                if (filteredData.length === 0) return "$0.00";
                return `$${Math.min(...filteredData.map((d) => d.low)).toFixed(
                  2
                )}`;
              })()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
