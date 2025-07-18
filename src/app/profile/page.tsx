"use client";

import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { LogOut, Pencil, RefreshCcw } from "lucide-react";

export default function ProfilePage() {
  const handleEditNickname = () => {
    // TODO: 닉네임 수정 모달 또는 라우팅
    alert("닉네임 수정 기능");
  };

  const handleLogout = () => {
    // TODO: 로그아웃 처리
    alert("로그아웃");
  };

  const handleChangeType = () => {
    // TODO: 투자 성향 재선택 페이지로 이동
    alert("투자 성향 재선택");
  };

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb]">
      <TopNavigation />

      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {/* 프로필 이미지 + 애니메이션 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          whileHover={{
            scale: 1.05,
            rotate: [0, 1, -1, 0],
            transition: { duration: 0.6 },
          }}
          className="relative mt-6 mb-6">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-gradient-to-tr from-blue-400 to-purple-500 animate-pulse"></div>
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg z-10 relative">
            <AvatarImage src="/placeholder.svg" alt="프로필 이미지" />
            <AvatarFallback>유</AvatarFallback>
          </Avatar>
        </motion.div>

        {/* 유저 정보 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">유진</h2>
          <p className="text-gray-500 text-sm">안정형 투자자</p>
        </div>

        {/* 기능 카드 */}
        <div className="space-y-4 w-full max-w-sm mb-8">
          <Card className="shadow-sm rounded-2xl">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Pencil className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium">닉네임 수정</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditNickname}>
                변경
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm rounded-2xl">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <RefreshCcw className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium">투자 성향 재선택</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleChangeType}>
                선택
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-sm mt-auto pb-24">
          <Card className="shadow-sm rounded-2xl">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-gray-600" />
                <span className="text-base font-medium">로그아웃</span>
              </div>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
