"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { Button } from "@/src/components/ui/button";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import Image from "next/image";

function formatDateToKorean(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // 파싱 실패 시 원본 반환
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export type DisclosureItem = {
  id: number;
  disclosureTitle: string;
  disclosureDate: string;
  disclosureSummary: string;
  stockName: string;
  stockId: string;
};

export default function DisclosureDetail() {
  const params = useParams();
  const router = useRouter();
  const [disclosure, setDisclosure] = useState<DisclosureItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDisclosure = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/disclosure/${params?.id}`,
        {
          credentials: "include",
        }
      );
      const jsonResponse = await response.json();

      if (jsonResponse.code === "AUTH-002") {
        router.push("/login");
        return null;
      }
      if (!response.ok) {
        throw new Error(
          jsonResponse?.message || "공시 정보를 불러오지 못했습니다."
        );
      }
      return jsonResponse.data;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchDisclosure();
      if (!ignore) {
        setDisclosure(data);
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 w-full z-30">
          <TopNavigation showBackButton={true} />
        </div>
        <div className="flex-1 flex items-center justify-center pt-[56px]">
          <span className="text-gray-400">불러오는 중...</span>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!disclosure) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="fixed top-0 left-0 w-full z-30">
          <TopNavigation showBackButton={true} title="" />
        </div>
        <div className="flex-1 flex items-center justify-center pt-[56px]">
          <span className="text-gray-400">공시 정보를 불러올 수 없습니다.</span>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* TopNavigation을 고정 */}
      <div className="fixed top-0 left-0 w-full z-30">
        <TopNavigation showBackButton={true} title="" />
      </div>
      <div
        className="flex-1 flex flex-col items-center max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto w-full px-2 mt-10 mb-5 overflow-y-auto pt-[56px]"
        style={{ paddingBottom: 100 }}
      >
        <div
          className="w-full bg-white rounded-lg p-6 flex flex-col"
          style={{
            minHeight: "80vh",
            boxSizing: "border-box",
            justifyContent: "flex-start",
            lineHeight: 1.9, // 전체적으로 line-height 증가
            letterSpacing: "0.01em",
          }}
        >
          <div className="flex items-center w-full justify-between mb-4">
            <div className="flex items-center">
              <br />
              {disclosure.stockId && (
                <span
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginTop: "6px",
                  }}
                >
                  <Image
                    src={`/ticker-icon/${disclosure.stockId}.png`}
                    alt="종목 아이콘"
                    width={40}
                    height={40}
                    unoptimized
                    className="mr-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/ticker-icon/default.png";
                    }}
                  />
                </span>
              )}
              <div className="text-sm text-gray-500 ml-1">
                {disclosure.stockName} ({disclosure.stockId})
              </div>
            </div>
            <div style={{ minWidth: 40 }} />
          </div>
          <h3 className="text-xl font-bold text-left mt-6 mb-2 w-full leading-relaxed">
            {disclosure.disclosureTitle}
          </h3>
          {/* 발표일을 제목 바로 아래로 이동 */}
          <p className="text-sm text-gray-500 text-left mb-4 leading-relaxed">
            <span className="mr-2">발표일</span>
            {formatDateToKorean(disclosure.disclosureDate)}
            <span className="ml-2">(현지 기준)</span>
          </p>
          <div className="w-full flex-1 flex flex-col">
            <div
              className="text-base text-gray-700 mt-4 text-left w-full flex-1"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                width: "100%",
                boxSizing: "border-box",
                minHeight: "140px", // summary가 짧아도 어느정도 높이 확보
                lineHeight: 2, // 본문 line-height 증가
                marginBottom: "1.5rem",
                letterSpacing: "0.01em",
              }}
            >
              {disclosure.disclosureSummary}
            </div>
          </div>
        </div>
      </div>
      {/* 버튼을 항상 하단에 고정 */}
      <div className="fixed bottom-32 left-0 w-full flex justify-center z-10">
        <div className="max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl w-full px-2">
          <Button
            onClick={() => {
              if (disclosure.stockId) {
                router.push(`/stock/${disclosure.stockId}`);
              }
            }}
            className="w-full h-[48px] bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm shadow-lg hover:shadow-lg"
            disabled={!disclosure.stockId}
          >
            주식 보러가기
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
