"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

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
          bolle malle !
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
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
