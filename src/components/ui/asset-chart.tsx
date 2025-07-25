import { Card, CardContent } from "@/src/components/ui/card";
import dynamic from "next/dynamic";
import { StockItem } from "@/src/app/home/page";
import React, { useEffect, useMemo, useState } from "react";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AssetChartProps {
  stocks: StockItem[];
}

const CHART_GRADIENT_COLORS = [
  { from: "#2563eb", to: "#60a5fa" },
  { from: "#3b82f6", to: "#93c5fd" },
  { from: "#1e40af", to: "#38bdf8" },
  { from: "#0ea5e9", to: "#bae6fd" },
  { from: "#60a5fa", to: "#dbeafe" },
  { from: "#2563eb", to: "#60a5fa" },
  { from: "#3b82f6", to: "#93c5fd" }
];

const CHART_SHADOW = {
  enabled: true,
  top: 4,
  left: 0,
  blur: 12,
  color: "#1e293b",
  opacity: 0.25
};

const fetchTodayComment = async (): Promise<string> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_API_URL}/total-summary/today-summary`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const jsonResponse = await response.json();
    return jsonResponse?.data?.totalSummary ?? "";
  } catch (e) {
    return "";
  }
};

const useSummaryString = () => {
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    fetchTodayComment().then((result) => {
      if (mounted) setSummary(result);
    });
    return () => { mounted = false; };
  }, []);

  return summary;
};

const useFilteredStocks = (stocks: StockItem[]) => {
  return useMemo(() => {
    const stockAmounts = stocks.map(stock => stock.currentPrice * stock.quantity);
    const filteredStocks = stocks.filter((_, idx) => stockAmounts[idx] > 0);
    const filteredAmounts = stockAmounts.filter(amount => amount > 0);
    return { filteredStocks, filteredAmounts };
  }, [stocks]);
};

const getChartOptions = (
  labels: string[],
  filteredAmounts: number[]
) => {
  const fill = {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.95,
      gradientToColors: filteredAmounts.map(
        (_, idx) => CHART_GRADIENT_COLORS[idx % CHART_GRADIENT_COLORS.length].to
      ),
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.7,
      stops: [0, 60, 100]
    }
  };

  return {
    chart: {
      type: "donut",
      toolbar: { show: false },
      height: "100%",
      width: "100%",
      background: "transparent",
      dropShadow: CHART_SHADOW
    },
    legend: {
      show: false
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()}원`
      }
    },
    colors: filteredAmounts.map(
      (_, idx) => CHART_GRADIENT_COLORS[idx % CHART_GRADIENT_COLORS.length].from
    ),
    fill,
    stroke: { width: 1, colors: ["#e3e8f0"] },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: { show: false }
        }
      }
    }
  };
};

const CHART_MIN_HEIGHT = "80px";
const CHART_MAX_HEIGHT = "140px";

const ChartSection = React.memo(
  ({
    filteredAmounts,
    options
  }: {
    filteredAmounts: number[];
    options: any;
  }) => {
    if (filteredAmounts.length === 0) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: CHART_MIN_HEIGHT,
            maxHeight: CHART_MAX_HEIGHT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            fontSize: "16px",
            zIndex: 2,
            position: "relative",
          }}
        >
          보유한 주식이 없습니다.
        </div>
      );
    }
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: CHART_MIN_HEIGHT,
          maxHeight: CHART_MAX_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <ApexChart
          type="donut"
          width="100%"
          height="100%"
          series={filteredAmounts}
          options={options}
          style={{
            width: "100%",
            height: "100%",
            minHeight: CHART_MIN_HEIGHT,
            maxHeight: CHART_MAX_HEIGHT,
            display: "block",
            background: "transparent",
          }}
        />
      </div>
    );
  }
);

export default function AssetChart({ stocks }: AssetChartProps) {
  const summaryString = useSummaryString();
  const { filteredStocks, filteredAmounts } = useFilteredStocks(stocks);

  const labels = useMemo(
    () => filteredStocks.map(stock => stock.name),
    [filteredStocks]
  );

  const options = useMemo(
    () => getChartOptions(labels, filteredAmounts),
    [labels, filteredAmounts]
  );

  // flex-row로 항상 양 옆 50:50 배치, 모바일에서도 동일하게
  // 좌: 그래프, 우: 오늘의 요약

  return (
    <Card
      className="mb-2 rounded-xl w-full"
      style={{
        maxWidth: "700px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        background: "#fff",
        boxShadow: "0 4px 24px 0 rgba(180, 210, 255, 0.18)",
        border: "1px solid #e3e8f0",
      }}
    >
      <CardContent className="rounded-xl p-0">
        <div
          className="flex flex-row items-stretch justify-center w-full"
          style={{
            height: "140px",
            minHeight: CHART_MIN_HEIGHT,
            maxHeight: "180px",
            padding: 0,
            overflow: "hidden",
            width: "100%",
            position: "relative",
            display: "flex",
            gap: "0px"
          }}
        >
          <div
            className="w-1/2 h-full flex flex-col items-center justify-center p-0 m-0"
            style={{
              width: "50%",
              height: "100%",
              minHeight: CHART_MIN_HEIGHT,
              maxHeight: CHART_MAX_HEIGHT,
            }}
          >
            <ChartSection filteredAmounts={filteredAmounts} options={options} />
          </div>
          <div
            className="w-1/2 h-full flex flex-col justify-center items-start"
            style={{
              width: "50%",
              height: "100%",
              minHeight: CHART_MIN_HEIGHT,
              maxHeight: CHART_MAX_HEIGHT,
              padding: "0 20px",
              boxSizing: "border-box",
              borderLeft: "1px solid #e3e8f0",
              background: "#f8fafc",
              fontSize: "16px",
              color: "#334155",
              overflowY: "auto",
              borderTopRightRadius: "16px",
              borderBottomRightRadius: "16px"
            }}
          >
            <div style={{ whiteSpace: "pre-line", wordBreak: "break-all", fontSize: "16px" }}>
              {summaryString
                ? summaryString
                : "오늘의 요약 정보를 불러오는 중입니다."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}