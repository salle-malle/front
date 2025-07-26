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
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setTypingDone(true), 2000); // 타이핑 애니메이션 시간과 맞춤
    return () => clearTimeout(timer);
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

    // 스플래시 화면을 최소 5초간 보여준 후 인증 상태를 확인합니다.
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 5000);

    // 페이지를 벗어날 경우 타이머를 정리합니다.
    return () => clearTimeout(timer);
  }, [isMounted, router]);

  return (
    <div className="h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* 로고 */}
        <div
          style={{
            opacity: typingDone ? 1 : 0,
            transform: typingDone ? "translateY(0)" : "translateY(-40px)",
            transition:
              "opacity 0.6s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.4,0,.2,1)",
            pointerEvents: typingDone ? "auto" : "none",
          }}
        >
          <Image
            src="/logo.png"
            alt="logo"
            width={150}
            height={150}
            style={{
              animation: typingDone ? "bounce 1.6s ease-out infinite" : "none",
            }}
          />
        </div>

        {/* 텍스트 */}
        <div
          style={{
            marginTop: "10px",
            fontSize: "19px",
            fontWeight: 650,
            letterSpacing: "-0.5px",
            color: "#0064FF",
            fontFamily: "'Poppins', sans-serif",
            textShadow: "0 2px 8px rgba(0, 100, 255, 0.08)",
            animation:
              "typing 2s steps(20) forwards, blink 0.5s step-end 0 alternate",
            whiteSpace: "nowrap",
            overflow: "hidden",
            borderRight: "2px solid #0064FF",
            width: "0",
            animationDelay: "0.1s",
          }}
        >
          밤사이 미국 증시, 한눈에
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

        @keyframes typing {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
