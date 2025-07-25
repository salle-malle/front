"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemberStore } from "../stores/memberStore";

export default function SplashPage() {
  const router = useRouter();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (useMemberStore.getState()) router.push("/home");
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [router]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // 클라이언트에서 마운트된 후에만 실행
    if (!isMounted) {
      return;
    }

    // 인증 상태를 확인하는 함수
    const checkAuthStatus = async () => {
      try {
        // 1. 백엔드의 상태 확인 API를 호출합니다.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/auth/verify`,
          {
            method: "GET",
            credentials: "include", // ★★★ HttpOnly 쿠키를 보내기 위한 필수 옵션
          }
        );

        // 2. 응답 상태 코드로 로그인 여부를 판단합니다.
        if (response.ok) {
          // 200 OK 응답: 로그인 상태 -> /main 으로 이동
          router.replace("/home");
        } else {
          // 401, 403 등 에러 응답: 비로그인 상태 -> /login 으로 이동
          router.replace("/login");
        }
      } catch (error) {
        // 네트워크 에러 등 API 호출 자체에 실패한 경우
        console.error("인증 상태 확인 중 오류 발생:", error);
        // 안전하게 로그인 페이지로 보냅니다.
        router.replace("/login");
      }
    };

    // 스플래시 화면을 최소 2초간 보여준 후 인증 상태를 확인합니다.
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 2000);

    // 페이지를 벗어날 경우 타이머를 정리합니다.
    return () => clearTimeout(timer);
  }, [isMounted, router]);

  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="logo"
          width={150}
          height={150}
          style={{
            animation: "bounce 1.6s ease-out infinite",
          }}
        />
        <div
          style={{
            marginTop: "-10px",
            fontSize: "19px",
            fontWeight: 650,
            letterSpacing: "-0.5px",
            color: "#0064FF",
            fontFamily: "'Poppins', sans-serif",
            textShadow: "0 2px 8px rgba(0, 100, 255, 0.08)",
          }}
        >
          {/* bolle malle ! */}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </div>
  );
}
