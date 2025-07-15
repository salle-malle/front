"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";

export default function AccountRegisterPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("");
  const [appKey, setAppKey] = useState("");
  const [focusAppKey, setFocusAppKey] = useState(false);
  const [focusAccountNumber, setFocusAccountNumber] = useState(false);
  const [appSecret, setAppSecret] = useState("");
  const [focusAppSecret, setFocusAppSecret] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton title="" />

      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          <p
            className="text-lg text-black mt-10 mb-[75px]"
            style={{ fontWeight: 500 }}
          >
            계좌 정보를 등록할게요
          </p>
          <p
            className="text-xs text-[#848A92] mt-[-70px] mb-[60px]"
            style={{ fontWeight: 400 }}
          >
            보유종목에 딱 맞는 정보를 받아보세요!
          </p>

          <label
            style={{ color: focusAccountNumber ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="accountNumber"
          >
            계좌번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              onFocus={() => setFocusAccountNumber(true)}
              onBlur={() => setFocusAccountNumber(false)}
              className="flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="account-number"
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
            style={{ color: focusAppKey ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="appKey"
          >
            APP KEY
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="appKey"
              value={appKey}
              onChange={e => setAppKey(e.target.value)}
              onFocus={() => setFocusAppKey(true)}
              onBlur={() => setFocusAppKey(false)}
              className="flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="app-key"
            />
          </div>


          <label
            style={{ color: focusAppSecret ? "#2978EE" : "#848A92" }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="authCode"
          >
            APP SECRET
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="appSecret"
              value={appSecret}
              onChange={e => setAppSecret(e.target.value)}
              onFocus={() => setFocusAppSecret(true)}
              onBlur={() => setFocusAppSecret(false)}
              className="flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 border-gray-300 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-[#2978EE] focus-visible:ring-0 focus-visible:outline-none text-base"
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
          onClick={() => router.push("/signup/")}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
