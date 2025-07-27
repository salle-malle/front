"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";

type InvestmentType = "안정형" | "보수형" | "적극형" | "공격형";

const typeToNumberMap = {
  안정형: 1,
  보수형: 2,
  적극형: 3,
  공격형: 4,
};

const types: {
  type: InvestmentType;
  desc: string;
  img: string;
  risk: number;
}[] = [
  {
    type: "안정형",
    desc: "원금 손실을 피하고 안정적인 자산 운용을 추구합니다.",
    img: "/characters/moli.png",
    risk: 1,
  },
  {
    type: "보수형",
    desc: "낮은 수준의 위험을 감수하며 소폭의 수익을 기대합니다.",
    img: "/characters/shoo.png",
    risk: 2,
  },
  {
    type: "적극형",
    desc: "성장성과 수익을 위해 일정 수준의 리스크를 받아들입니다.",
    img: "/characters/pli.png",
    risk: 3,
  },
  {
    type: "공격형",
    desc: "높은 수익을 위해 고위험 투자도 적극적으로 감수합니다.",
    img: "/characters/sol.png",
    risk: 4,
  },
];

export default function EditInvestmentTypePage() {
  const [selected, setSelected] = useState<InvestmentType | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/mypage/investment-type`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ investmentTypeId: typeToNumberMap[selected] }),
        }
      );
      if (!res.ok) throw new Error("수정 실패");
      alert("투자 성향이 수정되었습니다.");
      router.push("/profile");
    } catch (err) {
      alert("수정 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
          {types.map(({ type, desc, img, risk }) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={cn(
                "relative border rounded-2xl p-5 flex flex-col items-center gap-4 transition bg-white overflow-hidden text-center",
                selected === type
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-300"
                  : "hover:shadow-md"
              )}
            >
              <div className="w-[72px] h-[72px] relative">
                <Image
                  src={img}
                  alt={type}
                  fill
                  className="object-contain opacity-90"
                />
              </div>
              <div className="px-2">
                <h3 className="text-base font-medium mt-1">{type}</h3>
                <p className="text-sm text-gray-600 leading-snug mt-1">
                  {desc}
                </p>
              </div>
              <div className="w-full mt-4 z-10">
                <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                  <span>낮음</span>
                  <span>높음</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-blue-300/60 rounded-full transition-all duration-300"
                    style={{ width: `${(risk / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mt-1">
                  Risk Level: {risk}/4
                </p>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <button
            onClick={handleSubmit}
            className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition block mx-auto"
          >
            저장하기
          </button>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
}
