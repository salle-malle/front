"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "투자 경험이 어느 정도 되시나요?",
    options: [
      { text: "투자 경험이 전혀 없음", score: 1 },
      { text: "1년 미만", score: 2 },
      { text: "1-3년", score: 3 },
      { text: "3-5년", score: 4 },
      { text: "5년 이상", score: 5 },
    ],
  },
  {
    id: 2,
    question: "투자 목적은 무엇인가요?",
    options: [
      { text: "안전한 자산 보전", score: 1 },
      { text: "인플레이션 대응", score: 2 },
      { text: "적정 수익 추구", score: 3 },
      { text: "높은 수익 추구", score: 4 },
      { text: "공격적 수익 추구", score: 5 },
    ],
  },
  {
    id: 3,
    question: "투자 기간은 얼마나 되나요?",
    options: [
      { text: "1년 미만", score: 1 },
      { text: "1-3년", score: 2 },
      { text: "3-5년", score: 3 },
      { text: "5-10년", score: 4 },
      { text: "10년 이상", score: 5 },
    ],
  },
  {
    id: 4,
    question: "투자 손실에 대한 수용도는?",
    options: [
      { text: "원금 손실 절대 불가", score: 1 },
      { text: "5% 이하 손실 가능", score: 2 },
      { text: "10% 이하 손실 가능", score: 3 },
      { text: "20% 이하 손실 가능", score: 4 },
      { text: "20% 이상 손실도 감수", score: 5 },
    ],
  },
  {
    id: 5,
    question: "월 소득 대비 투자 비중은?",
    options: [
      { text: "10% 이하", score: 1 },
      { text: "10-20%", score: 2 },
      { text: "20-30%", score: 3 },
      { text: "30-50%", score: 4 },
      { text: "50% 이상", score: 5 },
    ],
  },
];

export default function InvestmentTestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const router = useRouter();

  const handleAnswer = (score: number) => {
    setSelectedOption(score);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers, selectedOption];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        // 테스트 완료 - 결과 계산
        const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
        handleTestComplete(totalScore);
      }
    }
  };

  const handleTestComplete = (totalScore: number) => {
    let investmentType = "";
    if (totalScore <= 10) investmentType = "안정 추구형";
    else if (totalScore <= 15) investmentType = "안정 성장형";
    else if (totalScore <= 20) investmentType = "균형 투자형";
    else if (totalScore <= 23) investmentType = "적극 투자형";
    else investmentType = "공격 투자형";

    // 결과를 저장하고 프로필 페이지로 이동
    router.push("/profile");
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="ml-2">
          <h1 className="font-bold">투자 성향 검사</h1>
          <p className="text-sm text-gray-600">
            {currentQuestion + 1} / {questions.length}
          </p>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <Button
                key={index}
                variant={
                  selectedOption === option.score ? "default" : "outline"
                }
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => handleAnswer(option.score)}
              >
                <div className="flex items-center">
                  {selectedOption === option.score && (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {option.text}
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="w-full"
          >
            {currentQuestion < questions.length - 1 ? "다음" : "검사 완료"}
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
