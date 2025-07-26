import { Card, CardContent } from "./card";
import TabSelector from "@/src/components/ui/tab-slider";
import React from "react";
import { useRouter } from "next/navigation";

type InfoItem = {
  id: number;
  title: string;
  date: string;
};

interface InfoTabsProps {
  tab: "공시" | "어닝콜";
  setTab: (tab: "공시" | "어닝콜") => void;
  disclosureData: InfoItem[];
  earningCallData: InfoItem[];
}

export default function InfoTabs({
  tab,
  setTab,
  disclosureData,
  earningCallData,
}: InfoTabsProps) {
  const router = useRouter();

  const dataList = tab === "공시" ? disclosureData : earningCallData;

  const getDetailUrl = (item: InfoItem) => {
    if (tab === "공시") {
      return `/disclosure/${item.id}`;
    } else {
      return `/earningcall/${item.id}`;
    }
  };

  return (
    <Card
      className="mb-2 rounded-xl border-none w-full"
      style={{
        maxWidth: "700px",
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <CardContent className="rounded-xl p-0">
        <div
          className="flex flex-col items-center justify-center w-full"
          style={{
            minHeight: "120px",
            maxHeight: "200px",
            padding: 0,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div className="w-full px-4 pt-3 pb-1">
            <span className="block text-[12px] text-gray-400">
              최신 정보에 대해 리마인드 드릴게요
            </span>
          </div>
          {dataList && dataList.length > 0 ? (
            <div className="w-full">
              {dataList.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-100 transition rounded-lg px-4 py-2"
                  onClick={() => router.push(getDetailUrl(item))}
                  style={{ userSelect: "none" }}
                >
                  <div className="flex flex-row items-center w-full">
                    <span
                      className="font-medium text-[15px] truncate"
                      style={{
                        flex: "0 0 75%",
                        minWidth: 0,
                        maxWidth: "75%",
                        textAlign: "left",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      className="text-[12px] text-gray-400"
                      style={{
                        flex: "0 0 25%",
                        minWidth: 0,
                        maxWidth: "25%",
                        textAlign: "right",
                        marginLeft: "auto",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center text-gray-400 py-8">
              {tab === "공시"
                ? "최근 공시 데이터가 없습니다."
                : "최근 어닝콜 데이터가 없습니다."}
            </div>
          )}
        </div>
      </CardContent>
      <TabSelector tab={tab} setTab={setTab} />
    </Card>
  );
}

