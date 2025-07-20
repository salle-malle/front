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
          {stocks.map((stock, idx) => (
            <div
              key={stock.ticker}
              className={`flex justify-between items-center py-2 px-5 hover:bg-[#f2f4f6] cursor-pointer transition mb-1 h-9 w-full${
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
                className="flex items-center flex-1"
                style={{ gap: "12px" }}
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
                <span
                  className="text-[#222] whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{
                    fontSize: "14px",
                    maxWidth: "140px",
                    lineHeight: "1.2",
                  }}
                  title={stock.name}
                >
                  {stock.name}
                </span>
              </div>
              <div
                className="text-right ml-auto flex items-center bg-transparent "
                style={{
                  marginRight: "-5px",
                  boxShadow: "none",
                  background: "none",
                }}
              >
                <span
                  className={`text-xs flex items-center font-medium ${
                    stock.profit_loss_amount >= 0 ? "text-[#f04452]" : "text-[#3182f6]"
                  }`}
                  style={{ background: "none", marginRight: "8px" }}
                >
                  {stock.profit_loss_amount > 0 ? "+" : ""}
                  {stock.profit_loss_rate}%
                </span>
                <span
                  className="font-medium text-[#222] bg-transparent"
                  style={{ background: "none" }}
                >
                  {stock.avgPrice.toLocaleString()}$
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-6 pt-2 pb-1 border-b border-gray-200 bg-gray-50 rounded-b-xl">
            <span
              className="text-[11px] text-gray-500"
              style={{ marginLeft: "-6px" }}
            >
              보유 주식
            </span>
            <span
              className="text-[11px] text-gray-500 flex items-center ml-auto"
              style={{ marginRight: "-17px" }}
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
