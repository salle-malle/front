"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/stores/signupStore";

export default function AccountRegisterPage() {
  const router = useRouter();
  const [focusAppKey, setFocusAppKey] = useState(false);
  const [focusAccountNumber, setFocusAccountNumber] = useState(false);
  const [focusAppSecret, setFocusAppSecret] = useState(false);

  const {
    accountNumber,
    setAccountNumber,
    appKey,
    setAppKey,
    appSecret,
    setAppSecret,
    name,
    nickname,
    phoneNumber,
    userId,
    password,
  } = useSignupStore();


  const fetchSignup = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId,
            nickname,
            password,
            phoneNumber,
            name,
            accountNumber,
            appKey,
            appSecret,
          }),
        }
      );

      const data = await response.json();

      if (data.code === "AUTH-005") {
        router.push("/home");
      } else {
        alert(data.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  const getUnderlineClass = (isFocused: boolean, value: string) => {
    return (isFocused || value !== "")
      ? "border-[#2978EE]"
      : "border-gray-300";
  };
  const getLabelColor = (isFocused: boolean, value: string) => {
    return (isFocused || value !== "")
      ? "#2978EE"
      : "#848A92";
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
            계좌 정보를 등록할게요
          </p>
          <p
            className="text-xs text-[#848A92] mt-[-70px] mb-[60px]"
            style={{ fontWeight: 400 }}
          >
            보유종목에 딱 맞는 정보를 받아보세요!
          </p>

          <label
            style={{ color: getLabelColor(focusAccountNumber, accountNumber) }}
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
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusAccountNumber, accountNumber)}`}
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
            style={{ color: getLabelColor(focusAppKey, appKey) }}
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
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusAppKey, appKey)}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="app-key"
            />
          </div>

          <label
            style={{ color: getLabelColor(focusAppSecret, appSecret) }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="appSecret"
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
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(focusAppSecret, appSecret)}`}
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
          onClick={fetchSignup}
          disabled={!accountNumber || !appKey || !appSecret}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
        >
          완료
        </Button>
      </div>
    </div>
  );
}
