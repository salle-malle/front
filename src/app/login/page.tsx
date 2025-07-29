"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemberStore } from "@/src/stores/memberStore";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setMember } = useMemberStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, password: password }),
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("로그인 실패:", errorData.message);
        alert(errorData.message || "아이디 또는 비밀번호를 확인해주세요.");
        return;
      }
      const responseBody = await res.json();

      const userStatus = responseBody.status;

      setMember({
        userIsLogin: userStatus,
      });
      router.replace("/home");
    } catch (error) {
      console.error("로그인 요청 중 에러 발생:", error);
      alert("로그인 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 flex-col items-center justify-center w-full px-6">
        <div className="w-full max-w-xs flex flex-col gap-7">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-xs flex flex-col gap-7"
          >
            <div className="flex flex-row items-center">
              <Image src="/logo.png" alt="logo" width={150} height={150} />
              <span
                className="text-2xl font-bold mt-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              ></span>
            </div>
            <div className="w-full flex flex-col gap-5">
              <Input
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ borderRadius: "10px", height: "43px" }}
                className="w-full text-left transition-colors duration-150 focus:border-[#2978ee]"
              />
              <Input
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderRadius: "10px", height: "43px" }}
                className="w-full text-left transition-colors duration-150 focus:border-[#2978ee]"
                type="password"
              />
              <div className="flex flex-col gap-2">
                <Button className="bg-[#2978ee] w-full transition-colors duration-150 hover:bg-[#539dff]">
                  로그인
                </Button>
                <Button
                  type="button"
                  className="bg-[#bad6ff5a] text-[#0064FF] w-full transition-colors duration-150 hover:bg-[#a0c6ff2d]"
                  onClick={() => router.push("/signup")}
                >
                  회원가입
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
