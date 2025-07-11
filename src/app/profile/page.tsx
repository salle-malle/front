"use client";

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { User, Edit, Mail, TrendingUp, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <User className="h-5 w-5 mr-2" />
          마이페이지
        </h1>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {/* 프로필 정보 */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback>김투자</AvatarFallback>
              </Avatar>

              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm text-gray-600">닉네임</div>
                    <div className="font-medium">김투자</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                </div>

                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">이메일</div>
                    <div className="font-medium">investor@example.com</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 투자 성향 */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />내 투자성향
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 mb-2">
                  안정 추구형
                </div>
                <div className="text-sm text-blue-700">
                  안정적인 수익을 추구하며 리스크를 최소화하는 투자 성향입니다.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">위험 수용도</div>
                  <div className="font-medium">낮음</div>
                </div>
                <div>
                  <div className="text-gray-600">투자 기간</div>
                  <div className="font-medium">장기</div>
                </div>
                <div>
                  <div className="text-gray-600">선호 자산</div>
                  <div className="font-medium">채권, 배당주</div>
                </div>
                <div>
                  <div className="text-gray-600">수익률 목표</div>
                  <div className="font-medium">5-8%</div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push("/profile/investment-test")}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                투자 성향 다시 검사하기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 기타 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              알림 설정
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              개인정보 처리방침
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              서비스 이용약관
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600"
            >
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
