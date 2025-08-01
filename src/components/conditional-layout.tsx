"use client";

import { useMemberStore } from "@/src/stores/memberStore";
import type React from "react";
import useNotification from "@/src/hooks/useNotification";

// const NO_LAYOUT_ROUTES = ["/login", "/"];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { member } = useMemberStore();

  useNotification(member?.userIsLogin ?? false);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full bg-white shadow-lg">{children}</div>
    </div>
  );
}
