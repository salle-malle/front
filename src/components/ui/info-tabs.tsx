import { Card, CardContent } from "./card";
import TabSelector from "@/src/components/ui/tab-slider";
import React from "react";
import TabContent from "@/src/components/ui/tab-content";

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
            <span className="block text-[12px] text-gray-400">최신 정보에 대해 리마인드 드릴게요</span>
          </div>
          {tab === "공시" ? (
            <TabContent data={disclosureData} emptyMsg="최근 공시 데이터가 없습니다." />
          ) : (
            <TabContent data={earningCallData} emptyMsg="최근 어닝콜 데이터가 없습니다." />
          )}
        </div>
      </CardContent>
      <TabSelector tab={tab} setTab={setTab} />
    </Card>
  );
}
