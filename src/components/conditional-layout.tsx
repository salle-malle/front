"use client";

import { usePathname } from "next/navigation";
import type React from "react";

// 이 배열에 레이아웃을 적용하고 싶지 않은 경로를 추가하세요.
// 예: '/login', '/signup' 등
const NO_LAYOUT_ROUTES = ["/login", "/"];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 현재 경로가 NO_LAYOUT_ROUTES 배열에 포함되면 레이아웃을 적용하지 않음
  const shouldSkipLayout = NO_LAYOUT_ROUTES.includes(pathname);

  if (shouldSkipLayout) {
    // 레이아웃 없이 자식 컴포넌트(페이지)만 렌더링
    return <>{children}</>;
  }

  // 그 외 모든 경로에는 기본 레이아웃 적용
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white shadow-lg">{children}</div>
    </div>
  );
}
