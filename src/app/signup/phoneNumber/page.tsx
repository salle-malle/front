"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";

export default function SignupLandingPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [focusNumber, setFocusNumber] = useState(false);
  const [focusCode, setFocusCode] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton title="" />

      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          <p
            className="text-lg text-black mt-10 mb-[75px]"
            style={{ fontWeight: 500 }}
          >
            휴대폰 번호를 입력해주세요
          </p>
          <p
            className="text-xs text-[#848A92] mt-[-70px] mb-[60px]"
            style={{ fontWeight: 400 }}
          >
            회원가입 전 본인인증을 하는 단계예요!
          </p>

          <label
            style={{ color: focusNumber ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="phoneNumber"
          >
            휴대폰 번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              onFocus={() => setFocusNumber(true)}
              onBlur={() => setFocusNumber(false)}
              className="flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
              inputMode="tel"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="tel"
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
              전송
            </Button>
          </div>

          <label
            style={{ color: focusCode ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="authCode"
          >
            인증 번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="authCode"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              onFocus={() => setFocusCode(true)}
              onBlur={() => setFocusCode(false)}
              className="flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
              inputMode="numeric"
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
                인증
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-9 flex justify-center">
        <Button
          onClick={() => router.push("/signup/phoneNumber")}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
