"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";

type StockItem = {
  ticker: number;
  name: string;
  quantity: number;
  avgPrice: number;
  profit_loss_amount: number;
  profit_loss_rate: number;
};

type CompanyLogos = {
  [code: string]: string;
};

const getCompanyLogosByTicker = (
  stocks: StockItem[]
): Record<string, string> => {
  const logos: Record<string, string> = {};
  stocks.forEach((stock) => {
    logos[stock.ticker.toString()] = `/ticker-icon/${stock.ticker}.png`;
  });
  return logos;
};

async function fetchStockList(): Promise<{
  stocks: StockItem[];
  companyLogos: CompanyLogos;
  authError?: boolean;
}> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_API_URL}/kis/unified-stocks`,
    {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!res.ok) {
    return { stocks: [], companyLogos: {} };
  }

  const json = await res.json();
  if (json.data.code === "AUTH-002") {
    return { stocks: [], companyLogos: {}, authError: true };
  }

  const stocksRaw =
    json.data?.stocks || json.data?.stockList || json.data || [];
  const companyLogos = json.data?.companyLogos || {};

  const stocks: StockItem[] = stocksRaw.map((item: any) => ({
    ticker: item.pdno,
    name: item.prdt_name,
    quantity: item.quantity,
    avgPrice: Math.round((Number(item.avg_price) + Number.EPSILON) * 100) / 100,
    profit_loss_amount:
      Math.round((Number(item.profit_loss_amount) + Number.EPSILON) * 100) /
      100,
    profit_loss_rate:
      Math.round((Number(item.profit_loss_rate) + Number.EPSILON) * 100) / 100,
  }));
  return { stocks, companyLogos };
}

export default function MyStocksPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [companyLogos, setCompanyLogos] = useState<CompanyLogos>({});
  const router = useRouter();

  useEffect(() => {
    fetchStockList().then((res) => {
      if (res.authError) {
        router.replace("/login");
        return;
      }
      setStocks(res.stocks);
      setCompanyLogos(getCompanyLogosByTicker(res.stocks));
    });
  }, [router]);

  const getProfitLossAmountString = (amount: number) => {
    if (amount > 0) return `+${amount.toLocaleString()}`;
    if (amount < 0) return `-${Math.abs(amount).toLocaleString()}`;
    return "0";
  };

  const getProfitLossRateString = (rate: number) => {
    if (rate > 0) return `+${rate}%`;
    if (rate < 0) return `-${Math.abs(rate)}%`;
    return "0%";
  };

  const getProfitLossColorClass = (amount: number, rate: number) => {
    if (amount < 0 || rate < 0) {
      return "text-[#3182f6]";
    }
    return "text-[#f04452]";
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div
        className="fixed top-0 left-0 right-0 z-30 bg-white"
        style={{
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        }}
      >
        <TopNavigation showBackButton />
      </div>
      <div
        className="w-full"
        style={{
          maxWidth: "700px",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingTop: "56px",
          paddingBottom: "64px",
        }}
      >
        <div className="p-0">
          <div className="flex flex-col">
            {stocks.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                보유한 주식이 없습니다.
              </div>
            )}
            {stocks.map((stock, idx) => {
              const profitLossColor = getProfitLossColorClass(
                stock.profit_loss_amount,
                stock.profit_loss_rate
              );
              return (
                <a
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className={[
                    "flex items-center py-2 px-5 hover:bg-[#f2f4f6] cursor-pointer transition mb-1 h-12 w-full",
                    idx === 0 ? "mt-2" : "",
                    idx === stocks.length - 1 ? "mb-3" : "",
                  ].join(" ")}
                  style={{
                    minWidth: "100%",
                    ...(idx === 0 ? { marginTop: "10px" } : {}),
                    ...(idx === stocks.length - 1
                      ? { marginBottom: "12px" }
                      : {}),
                  }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: "12px", minWidth: "0", width: "300px" }}
                  >
                    <img
                      src={companyLogos[stock.ticker.toString()] || ""}
                      alt={`${stock.name} 로고`}
                      className="w-7 h-7 object-contain"
                      style={{ marginLeft: "-5px" }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target) target.style.display = "none";
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-[#222] whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                          fontSize: "14px",
                          maxWidth: "240px",
                          lineHeight: "1.2",
                        }}
                        title={stock.name}
                      >
                        {stock.name}
                      </span>
                      <span
                        className="text-[11px] text-gray-400"
                        style={{
                          fontSize: "11px",
                          marginTop: "1px",
                          lineHeight: "1.1",
                        }}
                      >
                        {stock.quantity}주
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: "80px",
                      minWidth: "80px",
                      textAlign: "right",
                    }}
                  ></div>
                  <div
                    className="flex flex-col items-end justify-end"
                    style={{
                      width: "90px",
                      minWidth: "90px",
                      marginLeft: "auto",
                    }}
                  >
                    <span
                      className="font-medium text-[#222] bg-transparent"
                      style={{ background: "none" }}
                    >
                      ${stock.avgPrice.toLocaleString()}
                    </span>
                    <span
                      className={`text-[11px] flex items-center font-medium mt-0.5 ${profitLossColor}`}
                      style={{ background: "none" }}
                    >
                      {getProfitLossAmountString(stock.profit_loss_amount)}
                      &nbsp;(
                      {getProfitLossRateString(stock.profit_loss_rate)})
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className="fixed bottom-0 left-0 right-0 z-30 bg-white"
        style={{
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
        }}
      >
        <BottomNavigation />
      </div>
    </div>
  );
}
