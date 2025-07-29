"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { TopNavigation } from "@/src/components/top-navigation";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/stores/signupStore";

const validateUserId = (id: string) => {
  return /^[a-zA-Z0-9]{5,20}$/.test(id);
};
const validatePassword = (pw: string) => {
  return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/.test(
    pw
  );
};
const validateNickname = (nick: string) => {
  return /^[가-힣a-zA-Z0-9]{2,12}$/.test(nick);
};

export default function UserAccountPage() {
  const router = useRouter();
  const {
    userId: globalUserId,
    setUserId: setGlobalUserId,
    password: globalPassword,
    setPassword: setGlobalPassword,
    nickname: globalNickname,
    setNickname: setGlobalNickname,
  } = useSignupStore();

  const [userId, setUserId] = useState(globalUserId ?? "");
  const [password, setPassword] = useState(globalPassword ?? "");
  const [nickname, setNickname] = useState(globalNickname ?? "");

  const [focusUserId, setFocusUserId] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);
  const [focusNickname, setFocusNickname] = useState(false);

  const [userIdChecked, setUserIdChecked] = useState(false); // 중복확인 성공 여부
  const [userIdError, setUserIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setUserIdChecked(false);
    setUserIdError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setNicknameError("");
  };

  const fetchUserId = async () => {
    if (!validateUserId(userId)) {
      setUserIdError("아이디는 영문/숫자 5~20자여야 합니다.");
      setUserIdChecked(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_API_URL}/member/check/memberId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: userId }),
        }
      );
      const data = await response.json();
      if (data.code === "SUCCESS-001") {
        setUserIdError("");
        setUserIdChecked(true);
      } else {
        setUserIdError(data.message || "이미 사용중인 아이디입니다.");
        setUserIdChecked(false);
      }
    } catch (err) {
      setUserIdError("서버 오류가 발생했습니다.");
      setUserIdChecked(false);
    }
  };

  const handlePasswordBlur = () => {
    if (password && !validatePassword(password)) {
      setPasswordError(
        "비밀번호는 영문, 숫자, 특수문자 포함 8~20자여야 합니다."
      );
    }
    if (!password) {
      setFocusPassword(false);
    }
  };

  const handleNicknameBlur = () => {
    if (nickname && !validateNickname(nickname)) {
      setNicknameError("닉네임은 한글/영문/숫자 2~12자여야 합니다.");
    }
    if (!nickname) {
      setFocusNickname(false);
    }
  };

  const isNextEnabled =
    userId &&
    password &&
    nickname &&
    userIdChecked &&
    !userIdError &&
    !passwordError &&
    !nicknameError &&
    validateUserId(userId) &&
    validatePassword(password) &&
    validateNickname(nickname);

  const getLabelColor = (isFocused: boolean, value: string, error: string) => {
    if (error) return "#ef4444"; // 빨간색
    if (isFocused) return "#2978EE";
    if (value !== "") return "#2978EE";
    return "#848A92";
  };

  const getUnderlineClass = (
    isFocused: boolean,
    value: string,
    error: string
  ) => {
    if (error) return "border-red-500";
    if (isFocused) return "border-[#2978EE]";
    if (value !== "") return "border-[#2978EE]";
    return "border-gray-300";
  };

  const handleNext = () => {
    setGlobalUserId(userId);
    setGlobalPassword(password);
    setGlobalNickname(nickname);
    router.push("/signup/accountRegister");
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavigation showBackButton showRightIcons={false}/>
      <div className="flex flex-col justify-between flex-1 px-12 py-8">
        <div>
          <p
            className="text-lg text-black mt-10 mb-[75px]"
            style={{ fontWeight: 500 }}
          >
            사용자 계정 정보를 등록할게요
          </p>
          <p
            className="text-xs text-[#848A92] mt-[-70px] mb-[60px]"
            style={{ fontWeight: 400 }}
          >
            사용자 계정정보를 등록하는 단계예요!
          </p>

          {/* 아이디 */}
          <label
            style={{ color: getLabelColor(focusUserId, userId, userIdError) }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="userId"
          >
            아이디
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="userId"
              value={userId}
              onChange={handleUserIdChange}
              onFocus={() => setFocusUserId(true)}
              onBlur={() => setFocusUserId(false)}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(
                focusUserId,
                userId,
                userIdError
              )}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="username"
              maxLength={20}
            />
            <Button
              type="button"
              className="absolute right-0 -top-1 shadow-sm rounded-[10px] transition-colors duration-150 bg-[#2978ee] hover:bg-blue-600"
              style={{
                width: "60px",
                height: "32px",
                fontSize: "13px",
                color: "#fff",
                boxShadow:
                  "0 4px 12px 0 rgba(130,130,130,0.15), 0 1.5px 4px 0 rgba(130,130,130,0.10)",
              }}
              tabIndex={-1}
              onClick={fetchUserId}
              disabled={!userId || !validateUserId(userId) || userIdChecked}
            >
              {userIdChecked ? "확인됨" : "확인"}
            </Button>
          </div>
          {/* 에러 메시지 표시 */}
          <div className="mt-1 text-xs min-h-[18px]">
            {userIdError ? (
              <span className="text-red-500">{userIdError}</span>
            ) : userIdChecked ? (
              <span className="text-green-600">사용 가능한 아이디입니다.</span>
            ) : null}
          </div>

          {/* 비밀번호 */}
          <label
            style={{
              color: getLabelColor(focusPassword, password, passwordError),
            }}
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
              onChange={handlePasswordChange}
              onFocus={() => setFocusPassword(true)}
              onBlur={handlePasswordBlur}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(
                focusPassword,
                password,
                passwordError
              )}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="new-password"
              maxLength={20}
            />
          </div>
          <div className="mt-1 text-xs min-h-[18px]">
            {passwordError && (
              <span className="text-red-500">{passwordError}</span>
            )}
          </div>

          {/* 닉네임 */}
          <label
            style={{
              color: getLabelColor(focusNickname, nickname, nicknameError),
            }}
            className="block text-sm font-medium mt-10 mb-1"
            htmlFor="nickname"
          >
            닉네임
          </label>
          <div className="relative flex flex-col gap-1">
            <Input
              id="nickname"
              value={nickname}
              onChange={handleNicknameChange}
              onFocus={() => setFocusNickname(true)}
              onBlur={handleNicknameBlur}
              className={`flex-1 h-9 pr-3 pl-0 bg-white border-0 border-b-2 rounded-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:outline-none text-base ${getUnderlineClass(
                focusNickname,
                nickname,
                nicknameError
              )}`}
              inputMode="text"
              enterKeyHint="done"
              style={{ scrollMarginTop: 100 }}
              autoComplete="nickname"
              maxLength={12}
            />
          </div>
          <div className="mt-1 text-xs min-h-[18px]">
            {nicknameError && (
              <span className="text-red-500">{nicknameError}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-9 flex justify-center">
        <Button
          disabled={!isNextEnabled}
          onClick={handleNext}
          className="w-[90%] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-sm mt-10 text-sm shadow-lg hover:shadow-lg"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
