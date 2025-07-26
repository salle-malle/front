"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/stores/signupStore";

export default function PhoneNumberPage() {
  const router = useRouter();

  // 상태 정의
  const [authCode, setAuthCode] = useState("");
  const [focusNumber, setFocusNumber] = useState(false);
  const [focusCode, setFocusCode] = useState(false);
  const { phoneNumber, setPhoneNumber } = useSignupStore();
  const [codeInputEnabled, setCodeInputEnabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [authCodeErrorMessage, setAuthCodeErrorMessage] = useState("");
  const [authCodeSuccessMessage, setAuthCodeSuccessMessage] = useState("");
  const [authCodeSuccess, setAuthCodeSuccess] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false); // 인증번호 검증 중
  const [isRequesting, setIsRequesting] = useState(false); // 인증번호 요청 중

  // 유효성 검사 함수
  const isValidPhoneNumber = (num: string) =>
    /^01[016789][0-9]{7,8}$/.test(num);

  const isValidAuthCode = (code: string) => /^[0-9]{6}$/.test(code);

  // 인증번호 요청
  const fetchPhoneNumber = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setErrorMessage("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    setIsRequesting(true);
    setErrorMessage("");
    setAuthCodeErrorMessage("");
    setAuthCodeSuccessMessage("");
    setAuthCodeSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member/number/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        }
      );
      const data = await response.json();
      if (data.code === "AUTH-008") {
        startCountdown();
        setErrorMessage("");
        setAuthCodeSuccessMessage("인증번호가 전송되었습니다.");
        setAuthCodeSuccess(false); // 인증 성공 아님, 전송만 됨
      } else if (data.code === "FORMAT-001") {
        setErrorMessage(data.message);
      } else if (data.code === "AUTH-007") {
        setErrorMessage("이미 가입된 번호입니다.");
      } else {
        setErrorMessage(data.message || "인증번호 전송에 실패했습니다.");
      }
    } catch (e) {
      setErrorMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsRequesting(false);
    }
  };

  const fetchAuthCode = async () => {
    if (!isValidAuthCode(authCode)) {
      setAuthCodeErrorMessage("6자리 숫자 인증번호를 입력해주세요.");
      setAuthCodeSuccess(false);
      return;
    }
    setIsVerifying(true);
    setAuthCodeErrorMessage("");
    setAuthCodeSuccessMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member/number/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber, code: authCode }),
        }
      );
      const data = await response.json();

      if (data.code === "AUTH-009") {
        setAuthCodeErrorMessage("");
        setAuthCodeSuccessMessage("인증이 완료되었습니다.");
        setAuthCodeSuccess(true);
        setCodeInputEnabled(false);
        setTimer(0);
      } else if (data.code === "FORMAT-001") {
        setAuthCodeErrorMessage(data.message);
        setAuthCodeSuccess(false);
      } else if (data.code === "AUTH-010") {
        setAuthCodeErrorMessage("인증번호가 일치하지 않습니다.");
        setAuthCodeSuccess(false);
      } else if (data.code === "AUTH-011") {
        setAuthCodeErrorMessage(
          "인증번호가 만료되었습니다. 다시 요청해주세요."
        );
        setAuthCodeSuccess(false);
        setCodeInputEnabled(false);
        setTimer(0);
      } else {
        setAuthCodeErrorMessage(
          data.message || "인증번호 검증에 실패했습니다."
        );
        setAuthCodeSuccess(false);
      }
    } catch (e) {
      setAuthCodeErrorMessage("네트워크 오류가 발생했습니다.");
      setAuthCodeSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // 타이머 시작
  const startCountdown = () => {
    setTimer(300);
    setCodeInputEnabled(true);
    setAuthCode("");
    setAuthCodeSuccess(false);
    setAuthCodeErrorMessage("");
    setAuthCodeSuccessMessage("");
  };

  // 타이머 관리
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (codeInputEnabled && timer === 0) {
        setCodeInputEnabled(false);
        setAuthCode("");
        setAuthCodeErrorMessage(
          "인증번호가 만료되었습니다. 다시 요청해주세요."
        );
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, codeInputEnabled]);

  // 시간 포맷
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 스타일 관련 함수
  const getUnderlineClass = (isFocused: boolean, value: string) =>
    isFocused || value !== "" ? "border-[#2978EE]" : "border-gray-300";

  const getLabelColor = (isFocused: boolean, value: string) =>
    isFocused || value !== "" ? "#2978EE" : "#848A92";

  const errorBoxStyle = {
    minHeight: "18px",
    display: "flex",
    alignItems: "center",
  };

  // 다음 버튼 활성화 조건
  const canGoNext =
    isValidPhoneNumber(phoneNumber) &&
    isValidAuthCode(authCode) &&
    authCodeSuccess;

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton />

      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          {/* 안내 문구 */}
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

          {/* 휴대폰 번호 입력 */}
          <label
            style={{ color: getLabelColor(focusNumber, phoneNumber) }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="phoneNumber"
          >
            휴대폰 번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/[^0-9]/g, "")); // 숫자만 입력
                setErrorMessage("");
                setAuthCodeSuccess(false);
                setAuthCodeSuccessMessage("");
                setAuthCodeErrorMessage("");
              }}
              onFocus={() => setFocusNumber(true)}
              onBlur={() => setFocusNumber(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(
                focusNumber,
                phoneNumber
              )}`}
              inputMode="tel"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              maxLength={11}
              disabled={isRequesting}
            />
            <Button
              type="button"
              className="absolute right-0 -top-0.5 shadow-sm rounded-[10px] transition-colors duration-150 bg-[#2978ee] hover:bg-blue-600"
              style={{
                width: "60px",
                height: "32px",
                fontSize: "13px",
                color: "#fff",
                boxShadow:
                  "0 4px 12px 0 rgba(130,130,130,0.15), 0 1.5px 4px 0 rgba(130,130,130,0.10)",
              }}
              tabIndex={-1}
              disabled={!isValidPhoneNumber(phoneNumber) || isRequesting}
              onClick={fetchPhoneNumber}
            >
              {isRequesting ? "전송중" : "전송"}
            </Button>
          </div>
          <div className="mt-1 text-xs text-red-500" style={errorBoxStyle}>
            {errorMessage}
          </div>

          {/* 인증번호 입력 */}
          <label
            style={{ color: getLabelColor(focusCode, authCode) }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="authCode"
          >
            인증 번호
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="authCode"
              value={authCode}
              onChange={(e) => {
                setAuthCode(e.target.value.replace(/[^0-9]/g, "")); // 숫자만 입력
                setAuthCodeErrorMessage("");
                setAuthCodeSuccess(false);
                setAuthCodeSuccessMessage("");
              }}
              onFocus={() => setFocusCode(true)}
              onBlur={() => setFocusCode(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(
                focusCode,
                authCode
              )}`}
              inputMode="numeric"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="one-time-code"
              disabled={!codeInputEnabled || isVerifying || authCodeSuccess}
              placeholder={
                codeInputEnabled
                  ? "인증번호를 입력해주세요"
                  : "전송 버튼을 눌러주세요"
              }
              maxLength={6}
            />
            <Button
              type="button"
              className="absolute right-0 -top-0.5 shadow-sm rounded-[10px] transition-colors duration-150 bg-[#2978ee] hover:bg-blue-600"
              style={{
                width: "60px",
                height: "32px",
                fontSize: "13px",
                color: "#fff",
                boxShadow:
                  "0 4px 12px 0 rgba(130,130,130,0.15), 0 1.5px 4px 0 rgba(130,130,130,0.10)",
              }}
              tabIndex={-1}
              disabled={
                !codeInputEnabled ||
                !isValidAuthCode(authCode) ||
                isVerifying ||
                authCodeSuccess
              }
              onClick={fetchAuthCode}
            >
              {isVerifying ? "확인중" : "인증"}
            </Button>
          </div>

          {/* 타이머 */}
          {codeInputEnabled && timer > 0 && (
            <div className="mt-1 text-xs text-[#2978ee] font-semibold">
              남은시간 {formatTime(timer)}
            </div>
          )}

          {/* 인증 결과/에러 메시지 */}
          <div className="mt-1 text-xs" style={errorBoxStyle}>
            {authCodeSuccess ? (
              <span className="text-green-600">{authCodeSuccessMessage}</span>
            ) : (
              <span className="text-red-500">{authCodeErrorMessage}</span>
            )}
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="mb-9 flex justify-center">
        <Button
          onClick={() => router.push("/signup/userAccount")}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
          disabled={!canGoNext}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
