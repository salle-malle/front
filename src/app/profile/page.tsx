"use client";

import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { CiEdit } from "react-icons/ci";
import { BiSelectMultiple } from "react-icons/bi";
import { IoLogOutOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useMemberStore } from "@/src/stores/memberStore";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [nickname, setNickname] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const { clearMember } = useMemberStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/mypage`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("마이페이지 조회 실패");

        const json = await res.json();
        setNickname(json.data.nickname);
        setInvestmentType(json.data.investmentType);
      } catch (err) {
        console.error(err);
        alert("사용자 정보를 불러오지 못했습니다.");
      }
    };

    fetchProfile();
  }, []);

  const handleEditNickname = () => {
    router.push("/profile/edit-nickname");
  };

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      clearMember();
      router.replace("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleChangeType = () => {
    router.push("/profile/edit-investment");
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
          <h2 className="text-xl font-semibold">{nickname || "로딩 중..."}</h2>
          <p className="text-gray-500 text-sm">
            {investmentType ? `${investmentType} 투자자` : " "}
          </p>
        </div>

        {/* 기능 리스트 */}
        <ul className="w-full max-w-sm divide-y rounded-2xl bg-white shadow-sm overflow-hidden mb-8">
          <li className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center space-x-2 text-sm">
              <CiEdit className="w-4 h-4 text-gray-500" />
              <span>닉네임 수정</span>
            </div>
            <Button
              className="bg-gray-100 hover:bg-gray-200"
              variant="ghost"
              size="sm"
              onClick={handleEditNickname}>
              변경
            </Button>
          </li>
          <li className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center space-x-2 text-sm">
              <BiSelectMultiple className="w-4 h-4 text-gray-500" />
              <span>투자 성향 재선택</span>
            </div>
            <Button
              className="bg-gray-100 hover:bg-gray-200"
              variant="ghost"
              size="sm"
              onClick={handleChangeType}>
              선택
            </Button>
          </li>
          <li className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center space-x-2 text-sm">
              <IoLogOutOutline className="w-4 h-4 text-gray-500" />
              <span>로그아웃</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 "
              onClick={handleLogout}>
              로그아웃
            </Button>
          </li>
        </ul>
      </main>

      <BottomNavigation />
    </div>
  );
}
