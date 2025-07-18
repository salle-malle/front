"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import useNotification from "@/src/hooks/useNotification";

// const NO_LAYOUT_ROUTES = ["/login", "/"];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const memberId = 1; // 예시 — 실제로는 로그인된 사용자 ID로 변경

  // 여기서 hook 호출 (항상)
  useNotification(memberId);

  // const shouldSkipLayout = NO_LAYOUT_ROUTES.includes(pathname);

  // if (shouldSkipLayout) {
  //   return <>{children}</>;
  // }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white shadow-lg">{children}</div>
    </div>
  );
}
