import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { StockItem } from "@/src/app/home/page";

type CompanyLogos = {
  [code: string]: string;
};

export default function StockList({
  stocks,
  companyLogos,
}: {
  stocks: StockItem[];
  companyLogos: CompanyLogos;
}) {
  const router = useRouter();

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
    <Card
      className="mb-2 border-0 w-full"
      style={{
        maxWidth: "700px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          {stocks.map((stock, idx) => {
            const profitLossColor = getProfitLossColorClass(
              stock.profit_loss_amount,
              stock.profit_loss_rate
            );
            return (
              <div
                key={stock.ticker}
                className={`flex items-center py-2 px-5 hover:bg-[#f2f4f6] cursor-pointer transition mb-1 h-12 w-full${
                  idx === 0 ? " mt-2" : ""
                }${idx === stocks.length - 1 ? " mb-3" : ""}`}
                onClick={() => router.push(`/stock/${stock.ticker}`)}
                style={{
                  minWidth: "100%",
                  ...(idx === 0 ? { marginTop: "10px" } : {}),
                  ...(idx === stocks.length - 1 ? { marginBottom: "12px" } : {}),
                }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: "12px", minWidth: "0", width: "160px" }}
                >
                  <img
                    src={companyLogos[stock.ticker.toString()] || ""}
                    alt={`${stock.name} 로고`}
                    className="w-7 h-7 object-contain"
                    style={{ marginLeft: "-5px" }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target) target.style.display = "none";
                    }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-[#222] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{
                        fontSize: "14px",
                        maxWidth: "120px",
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
                >
                </div>
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
                    {getProfitLossAmountString(stock.profit_loss_amount)}&nbsp;(
                    {getProfitLossRateString(stock.profit_loss_rate)})
                  </span>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between px-6 pt-2 pb-1 border-b border-gray-200 bg-gray-50 rounded-b-xl">
            <span
              className="text-[11px] text-gray-500"
              style={{ marginLeft: "-6px" }}
            >
              보유 주식
            </span>
            <span
              className="text-[11px] text-gray-500 flex items-center ml-auto hover:cursor-pointer hover:bg-gray-200 rounded-sm"
              style={{ marginRight: "-17px" }}
              onClick={() => router.push(`/my-stocks`)}
            >
              더보기
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 16 16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 4l4 4-4 4"
                />
              </svg>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
