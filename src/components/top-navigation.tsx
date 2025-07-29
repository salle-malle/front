"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { HiBell } from "react-icons/hi";
import { FaCalendar } from "react-icons/fa6";
import Image from "next/image";

interface TopNavigationProps {
  showBackButton?: boolean;
  showRightIcons?: boolean;
  title?: string;
  shadow?: boolean;
  border?: boolean;
}

export function TopNavigation({
  showBackButton = false,
  showRightIcons = true,
  title,
  shadow = true,
  border = true,
}: TopNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const borderClass = border ? "border-b border-gray-stroke-100" : "";
  const shadowClass = shadow ? "shadow-md" : "";

  const isNotificationPage = pathname === "/notifications";
  const isCalendarPage = pathname === "/calendar";

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchUnreadStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/notifications/unread-exists`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          console.error("알림 상태 요청 실패:", res.status, res.statusText);
          return;
        }

        const data = await res.json();

        setHasUnread(data?.data?.hasUnread ?? false);
      } catch (error) {
        console.error("알림 상태 요청 중 예외 발생:", error);
      }
    };

    fetchUnreadStatus();
  }, []);

  return (
    <nav
      className={`flex justify-between items-center p-4 bg-white ${borderClass} ${shadowClass}`}
      style={{ minHeight: 56 }}
    >
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-0 h-auto w-auto min-w-0 flex items-center justify-center !bg-transparent !text-inherit"
            style={{ lineHeight: 1, minWidth: 0, minHeight: 0 }}
            tabIndex={0}
          >
            <ArrowLeft width={24} height={24} className="text-gray-600" />
          </Button>
        )}
        {title ? (
          <div className="text-xl font-bold text-blue-600">{title}</div>
        ) : (
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="SumEarly"
              width={96}
              height={26}
              className="h-6 w-auto"
              priority
            />
          </div>
        )}
      </div>

      {showRightIcons && (
        <div
          className="flex space-x-2 items-center"
          style={{ marginRight: 12 }}
        >
          {/* 캘린더 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/calendar")}
            className="p-0 h-auto w-auto min-w-0 flex items-center justify-center !bg-transparent !text-inherit"
            style={{ lineHeight: 1, minWidth: 0, minHeight: 0 }}
            tabIndex={0}
          >
            <FaCalendar
              width={24}
              height={24}
              color={isCalendarPage ? "#4B5563" : "#D1D5DB"}
              className={isCalendarPage ? "text-gray-600" : "text-gray-300"}
              style={{
                minWidth: 20,
                minHeight: 20,
                width: 20,
                height: 20,
                display: "block",
                marginRight: 8,
                marginTop: -2.5,
              }}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/notifications")}
            className="p-0 h-auto w-auto min-w-0 flex items-center justify-center !bg-transparent !text-inherit"
            style={{ lineHeight: 1, minWidth: 0, minHeight: 0 }}
            tabIndex={0}
          >
            <div className="relative">
              <HiBell
                width={26}
                height={26}
                color={isNotificationPage ? "#4B5563" : "#D1D5DB"}
                className={
                  isNotificationPage ? "text-gray-600" : "text-gray-300"
                }
                style={{
                  minWidth: 26,
                  minHeight: 26,
                  width: 26,
                  height: 26,
                  display: "block",
                }}
              />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" />
              )}
            </div>
          </Button>
        </div>
      )}
    </nav>
  );
}
