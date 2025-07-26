"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";

export default function EditNicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/mypage/nickname`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname }),
        }
      );

      if (!res.ok) throw new Error("닉네임 수정 실패");

      alert("닉네임이 변경되었습니다!");
      router.replace("/profile");
    } catch (err) {
      console.error(err);
      alert("닉네임 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb]">
      <TopNavigation />

      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">닉네임 수정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="새 닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-base"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-[#2978ee] hover:bg-[#539dff] w-full"
              >
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
