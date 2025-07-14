"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import Image from "next/image";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // 로그인 로직
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 flex-col items-center justify-center w-full px-6">
        <div className="w-full max-w-xs flex flex-col gap-7">
          <div className="flex flex-row items-center">
            <Image src="/logo.png" alt="logo" width={50} height={50} />
            <span
              className="text-2xl font-bold mt-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Bolle<span className="font-normal">malle</span>
            </span>
          </div>
          <div className="w-full flex flex-col gap-5">
            <Input
              placeholder="아이디"
              style={{ borderRadius: "10px", height: "43px" }}
              className="w-full text-left transition-colors duration-150 focus:border-[#2978ee]"
            />
            <Input
              placeholder="비밀번호"
              style={{ borderRadius: "10px", height: "43px" }}
              className="w-full text-left transition-colors duration-150 focus:border-[#2978ee]"
              type="password"
            />
            <div className="flex flex-col gap-2">
              <Button
                className="bg-[#2978ee] w-full transition-colors duration-150 hover:bg-[#539dff]"
              >
                로그인
              </Button>
              <Button
                className="bg-[#bad6ff5a] text-[#0064FF] w-full transition-colors duration-150 hover:bg-[#a0c6ff2d]"
              >
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
