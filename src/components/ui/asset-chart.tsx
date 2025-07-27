import { Card, CardContent } from "@/src/components/ui/card";
import { StockItem, fetchStockList } from "@/src/app/home/page";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import SummarySlider from "@/src/components/ui/summary-slider";

const COLORS = [
  "#A7C7E7",
  "#B5D0EB",
  "#CFE2F3",
  "#D6EAF8",
  "#B3E0FF",
  "#B6D4FA",
  "#7DA7D9",
  "#5B8DB8",
  "#3B6FA1",
  "#3498FF",
  "#0074D9",
  "#1E90FF",
  "#0099FF",
];

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
  } catch {
    return "";
  }
};

const useStocks = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchStockList(router)
      .then((res) => {
        if (mounted) setStocks(res.stocks ?? []);
      })
      .catch(() => {
        if (mounted) setStocks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  return { stocks, loading };
};

// const useSummaryString = () => {
//   const [summary, setSummary] = useState("");
//   useEffect(() => {
//     let mounted = true;
//     fetchTodayComment().then((result) => {
//       if (mounted) setSummary(result);
//     });
//     return () => {
//       mounted = false;
//     };
//   }, []);
//   return summary;
// };
const useSummaryString = () => {
  // mock 마크다운 형식 총평
  const mockSummary = `
📉 테슬라 하락
전기차 수요 둔화로 오늘 테슬라는 -4.2% 하락했습니다.

📈 애플 어닝 서프라이즈
예상치를 웃도는 실적으로 2.1% 상승세를 기록했습니다.

💡 오늘의 투자 코멘트
기술주 중심의 포트폴리오라면 단기 리밸런싱을 고려해보세요.
  `;

  const [summary, setSummary] = useState("");

  useEffect(() => {
    setSummary(mockSummary);
  }, []);

  return summary;
};

const useFilteredStocks = (stocks: StockItem[]) => {
  return useMemo(() => {
    if (!stocks || !Array.isArray(stocks))
      return { filteredStocks: [], filteredAmounts: [] };

    const filteredStocks = stocks
      .map((stock) => {
        const quantity = parseFloat(stock.quantity as unknown as string) || 0;
        const currentPrice = parseFloat(stock.currentPrice as any) || 0;
        const amount = parseFloat((quantity * currentPrice).toFixed(2)); // 소숫점 둘째자리까지 반영
        return { ...stock, quantity, amount };
      })
      .filter((stock) => stock.amount > 0);

    const filteredAmounts = filteredStocks.map((stock) => stock.amount);
    return { filteredStocks, filteredAmounts };
  }, [stocks]);
};

export default function AssetChart() {
  const { stocks, loading } = useStocks();
  const summaryString = useSummaryString();
  const parsedSummaries = useMemo(() => {
    const parsed = summaryString
      .trim()
      .split(/\n\s*\n/) // 줄 두 개 이상 + 공백 가능
      .map((block, idx) => {
        const lines = block
          .trim()
          .split("\n")
          .map((line) => line.trim());
        const title = lines[0];
        const content = lines.slice(1).join(" ").trim();

        return { id: idx, title, content };
      })
      .filter((item) => item.title && item.content);

    console.log("✅ parsedSummaries", parsed);
    return parsed;
  }, [summaryString]);

  const { filteredStocks, filteredAmounts } = useFilteredStocks(stocks);

  // Recharts용 데이터 포맷팅
  const chartData = useMemo(() => {
    return filteredStocks.map((stock, idx) => ({
      name: stock.name,
      value: stock.amount,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredStocks]);

  return (
    <Card
      className="mb-2 rounded-xl w-full"
      style={{
        maxWidth: "700px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 4px 24px 0 rgba(180, 210, 255, 0.18)",
        // background: "#fff", // 배경 제거
        // border: "1px solid #e3e8f0", // 테두리 제거
      }}>
      <CardContent className="rounded-xl p-0">
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: 8,
            minHeight: 140,
            maxHeight: 180,
          }}>
          <div
            style={{
              width: "50%",
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
            {/* 도넛 뒤 그림자 */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 120,
                height: 120,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                boxShadow: "0 8px 32px 0 rgba(100,150,255,0.10)",
                background: "transparent",
                zIndex: 0,
              }}
            />
            {/* 차트 */}
            <div style={{ width: "100%", zIndex: 1 }}>
              {loading ? (
                <div style={{ color: "#888", fontSize: 16 }}>
                  주식 데이터를 불러오는 중입니다...
                </div>
              ) : filteredAmounts.length === 0 ? (
                <div style={{ color: "#888", fontSize: 16 }}>
                  보유한 주식이 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="50%"
                      outerRadius="85%"
                      paddingAngle={0}
                      labelLine={false}
                      isAnimationActive={false}
                      focusable={false}
                      tabIndex={-1}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString()}$`,
                        name,
                      ]}
                      contentStyle={{ fontSize: 14 }}
                    />
                    <style jsx global>{`
                      .recharts-pie-sector:focus {
                        outline: none !important;
                        stroke: #e3e8f0 !important; /* 아주 연한 회색 */
                        stroke-width: 1 !important; /* 얇게 */
                      }
                      .recharts-pie-sector:hover {
                        filter: brightness(1.08);
                        transition: filter 0.2s;
                      }
                    `}</style>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "0 20px",
              boxSizing: "border-box",
              borderLeft: "1px solid #e3e8f0",
              background: "#f8fafc",
              fontSize: 16,
              color: "#334155",
              overflowY: "auto",
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              display: "flex",
              alignItems: "center",
            }}>
            <div style={{ whiteSpace: "pre-line", wordBreak: "break-word" }}>
              {parsedSummaries.length > 0 ? (
                <SummarySlider summaries={parsedSummaries} />
              ) : (
                "오늘의 요약 정보를 불러오는 중입니다."
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
