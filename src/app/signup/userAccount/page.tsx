"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/stores/signupStore";

export default function UserAccountPage() {
  const router = useRouter();
  const { userId, setUserId, password, setPassword, nickname, setNickname } = useSignupStore();
  const [focusUserId, setFocusUserId] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [focusNickname, setFocusNickname] = useState(false);

  const getUnderlineClass = (isFocused: boolean, value: string) => {
    return (isFocused || value !== "")
      ? "border-[#2978EE]"
      : "border-gray-300";
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton title="" />

      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          <p
            className="text-lg text-black mt-10 mb-[75px]"
            style={{ fontWeight: 500 }}
          >
            이거 맞아?
          </p>
          <p
            className="text-xs text-[#848A92] mt-[-70px] mb-[60px]"
            style={{ fontWeight: 400 }}
          >
            회원가입 전 본인인증을 하는 단계예요!
          </p>

          <label
            style={{ color: (focusUserId || userId !== "") ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="userId"
          >
            아이디
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="userId"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onFocus={() => setFocusUserId(true)}
              onBlur={() => setFocusUserId(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusUserId, userId)}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="user-id"
            />
            <Button
              type="button"
              className="absolute right-0 -top-1 shadow-sm rounded-[10px] transition-colors duration-150 bg-[#2978ee]  hover:bg-blue-600"
              style={{
                width: "60px",
                height: "32px",
                fontSize: "13px",
                color: "#fff",
                boxShadow: "0 4px 12px 0 rgba(130,130,130,0.15), 0 1.5px 4px 0 rgba(130,130,130,0.10)",
              }}
              tabIndex={-1}
            >
              확인
            </Button>
          </div>

          <label
            style={{ color: (focusPassword || password !== "") ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="password"
          >
            비밀번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusPassword, password)}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="password"
            />
          </div>

          <label
            style={{ color: (focusNickname || nickname !== "") ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="nickname"
          >
            닉네임
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="nickname"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onFocus={() => setFocusNickname(true)}
              onBlur={() => setFocusNickname(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusNickname, nickname)}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="one-time-code"
            />
            <Button
              type="button"
              className="absolute right-0 -top-1 shadow-sm rounded-[10px] transition-colors duration-150 bg-[#2978ee]  hover:bg-blue-600"
              style={{
                width: "60px",
                height: "32px",
                fontSize: "13px",
                color: "#fff",
                boxShadow: "0 4px 12px 0 rgba(130,130,130,0.15), 0 1.5px 4px 0 rgba(130,130,130,0.10)",
              }}
              tabIndex={-1}
            >
              <span
                className={`transition-colors duration-150 text-white`}
              >
                확인
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-9 flex justify-center">
        <Button
          onClick={() => router.push("/signup/accountRegister")}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
