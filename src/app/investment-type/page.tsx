"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/src/lib/utils";

type InvestmentType = "안정형" | "보수형" | "적극형" | "공격형";

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

export default function InvestmentTypePage() {
  const [selected, setSelected] = useState<InvestmentType | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/api/v1/investment-type/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type: selected }),
        }
      );
      if (!res.ok) throw new Error("저장 실패");
      router.push("/home");
    } catch (err) {
      alert("선택 저장 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-8">
      <h1 className="text-xl font-semibold text-center mb-6">
        나의 투자 성향은?
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        {types.map(({ type, desc, img, risk }) => (
          <button
            key={type}
            onClick={() => setSelected(type)}
            className={cn(
              "border rounded-2xl p-5 flex flex-col items-center gap-3 transition bg-white",
              selected === type
                ? "border-blue-500 shadow-lg ring-2 ring-blue-300"
                : "hover:shadow-md"
            )}>
            <div className="w-[100px] h-[100px] relative transition-transform duration-200 hover:scale-105">
              <Image src={img} alt={type} fill className="object-contain" />
            </div>
            <h3 className="text-base font-medium">{type}</h3>
            <p className="text-center text-gray-600 text-sm leading-snug">
              {desc}
            </p>

            {/* Risk Level Bar */}
            <div className="w-full mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                <span>낮음</span>
                <span>높음</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute h-2 bg-red-400 rounded-full transition-all duration-300"
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

      {/* 다음으로 버튼 */}
      {selected && (
        <button
          onClick={handleSubmit}
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          다음으로
        </button>
      )}
    </div>
  );
}
