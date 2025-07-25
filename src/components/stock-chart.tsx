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
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  ColorType,
  CandlestickSeries,
} from "lightweight-charts";
import { IoStatsChartOutline } from "react-icons/io5";

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

// API 캐싱을 위한 클래스
class StockDataCache {
  private cache = new Map<string, { data: CandleData[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 6000 * 1000; // 500분 캐시

  get(symbol: string): CandleData[] | null {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  set(symbol: string, data: CandleData[]): void {
    this.cache.set(symbol, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// 중복 요청 방지를 위한 클래스
class RequestManager {
  private pendingRequests = new Map<string, Promise<CandleData[]>>();

  async executeRequest(
    symbol: string,
    requestFn: () => Promise<CandleData[]>
  ): Promise<CandleData[]> {
    if (this.pendingRequests.has(symbol)) {
      return this.pendingRequests.get(symbol)!;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(symbol);
    });

    this.pendingRequests.set(symbol, promise);
    return promise;
  }
}

const stockDataCache = new StockDataCache();
const requestManager = new RequestManager();

export function StockChart({ stockCode }: StockChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1Y");
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const periods: { value: ChartPeriod; label: string }[] = [
    { value: "1W", label: "1주" },
    { value: "1M", label: "1개월" },
    { value: "6M", label: "6개월" },
    { value: "1Y", label: "1년" },
    { value: "5Y", label: "5년" },
  ];

  // Alpha Vantage API에서 데이터 가져오기 (개선된 버전)
  const fetchStockData = useCallback(
    async (symbol: string, forceRefresh = false) => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // 캐시 확인 (강제 새로고침이 아닌 경우)
        if (!forceRefresh) {
          const cachedData = stockDataCache.get(symbol);
          if (cachedData) {
            setChartData(cachedData);
            setLoading(false);
            return;
          }
        }

        // API 호출 부분 주석 해제
        // 중복 요청 방지
        const data = await requestManager.executeRequest(symbol, async () => {
          const response = await fetch(`/api/stock-data?symbol=${symbol}`, {
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            throw new Error("데이터를 가져오는데 실패했습니다.");
          }

          const apiData: AlphaVantageData = await response.json();

          if (!apiData["Time Series (Daily)"]) {
            throw new Error("주식 데이터를 찾을 수 없습니다.");
          }

          // 데이터를 CandleData 형식으로 변환
          const timeSeriesData = apiData["Time Series (Daily)"];
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

          return candleData;
        });

        // 더미 데이터 사용 (주석처리)
        /*
        const dummyData: CandleData[] = [
          { time: 1640995200, open: 150.0, high: 155.0, low: 148.0, close: 153.0, volume: 1000000 },
          { time: 1641081600, open: 153.0, high: 158.0, low: 152.0, close: 156.0, volume: 1200000 },
          { time: 1641168000, open: 156.0, high: 160.0, low: 154.0, close: 159.0, volume: 1100000 },
          { time: 1641254400, open: 159.0, high: 162.0, low: 157.0, close: 161.0, volume: 1300000 },
          { time: 1641340800, open: 161.0, high: 165.0, low: 160.0, close: 164.0, volume: 1400000 },
          { time: 1641427200, open: 164.0, high: 168.0, low: 163.0, close: 167.0, volume: 1500000 },
          { time: 1641513600, open: 167.0, high: 170.0, low: 166.0, close: 169.0, volume: 1600000 },
          { time: 1641600000, open: 169.0, high: 172.0, low: 168.0, close: 171.0, volume: 1700000 },
          { time: 1641686400, open: 171.0, high: 175.0, low: 170.0, close: 174.0, volume: 1800000 },
          { time: 1641772800, open: 174.0, high: 178.0, low: 173.0, close: 177.0, volume: 1900000 },
        ];
        */

        // 캐시에 저장
        stockDataCache.set(symbol, data);
        setChartData(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // 요청이 취소된 경우
        }

        console.error("주식 데이터 가져오기 실패:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 기간에 따른 데이터 필터링
  const getFilteredData = (
    data: CandleData[],
    period: ChartPeriod
  ): CandlestickData[] => {
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

    return data
      .filter((item) => item.time >= cutoffTime)
      .map((item) => ({
        time: item.time as any,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
  };

  // 차트 초기화
  const initializeChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    // 기존 차트 정리
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chartOptions = {
      layout: {
        textColor: "black",
        background: { type: ColorType.Solid, color: "white" },
      },
      grid: {
        vertLines: { color: "#e5e7eb" },
        horzLines: { color: "#e5e7eb" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#2962FF",
          width: 1 as any,
          style: 1,
          labelVisible: true,
          labelBackgroundColor: "#2962FF",
          labelTextColor: "#FFFFFF",
        },
        horzLine: {
          color: "#2962FF",
          width: 1 as any,
          style: 1,
          labelVisible: true,
          labelBackgroundColor: "#2962FF",
          labelTextColor: "#FFFFFF",
        },
      },
      rightPriceScale: {
        borderColor: "#d1d5db",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#d1d5db",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 6,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        visible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        },
        timeUnit: "day",
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef5350",
      downColor: "#26a69a",
      borderVisible: false,
      wickUpColor: "#ef5350",
      wickDownColor: "#26a69a",
    });
    candlestickSeriesRef.current = candlestickSeries;

    // 크로스헤어 이벤트 리스너 추가
    chart.subscribeCrosshairMove((param) => {
      if (param.time && typeof param.time === "number") {
        const date = new Date(param.time * 1000);
        const formattedDate = date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // 크로스헤어 라벨 업데이트 (가능한 경우)
        if (param.seriesData && param.seriesData.size > 0) {
          // 시리즈 데이터가 있을 때만 라벨 업데이트
          console.log("크로스헤어 날짜:", formattedDate);
        }
      }
    });

    // 차트 크기 조정
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current?.clientWidth || 400,
          height: chartContainerRef.current?.clientHeight || 300,
        });
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // 차트 데이터 업데이트
  const updateChartData = useCallback((data: CandlestickData[]) => {
    if (candlestickSeriesRef.current && data.length > 0) {
      candlestickSeriesRef.current.setData(data);

      // 차트 내용에 맞게 자동 조정
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, []);

  // 줌 컨트롤
  const handleZoomIn = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({
        rightOffset: 0,
        barSpacing: Math.min(
          50,
          (chartRef.current.timeScale().options().barSpacing || 6) * 1.2
        ),
      });
    }
  };

  const handleZoomOut = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().applyOptions({
        rightOffset: 0,
        barSpacing: Math.max(
          1,
          (chartRef.current.timeScale().options().barSpacing || 6) / 1.2
        ),
      });
    }
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  // stockCode 변경 시 데이터 가져오기
  useEffect(() => {
    if (stockCode) {
      fetchStockData(stockCode);
    }

    // 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [stockCode, fetchStockData]);

  // 차트 초기화
  useEffect(() => {
    const cleanup = initializeChart();
    return cleanup;
  }, [initializeChart]);

  // 데이터 변경 시 차트 업데이트
  useEffect(() => {
    if (chartData.length > 0) {
      const filteredData = getFilteredData(chartData, selectedPeriod);
      updateChartData(filteredData);
    }
  }, [chartData, selectedPeriod, updateChartData]);

  // 기간 변경 핸들러
  const handlePeriodChange = (period: ChartPeriod) => {
    setSelectedPeriod(period);
  };

  // 강제 새로고침 핸들러
  const handleRefresh = () => {
    fetchStockData(stockCode, true);
  };

  return (
    <Card className="mx-4 mt-4 shadow-sm border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-gray-900">
          <div className="flex items-center">
            {/* <IoStatsChartOutline className="h-5 w-5 mr-2" /> */}
            주가 차트
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              className="text-xs px-2">
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
              onClick={() => handlePeriodChange(period.value)}>
              {period.label}
            </Button>
          ))}
        </div>

        {/* 차트 영역 */}
        <div
          ref={chartContainerRef}
          className="h-80 bg-white rounded-lg border border-gray-200">
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
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  다시 시도
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 조작 안내 */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            마우스 휠: 확대/축소 | 드래그: 좌우 이동 | 더블클릭: 리셋
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
