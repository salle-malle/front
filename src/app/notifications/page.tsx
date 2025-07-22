"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  price: TrendingUp,
  event: Calendar,
  alert: AlertCircle,
};

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_API_URL}/notifications`,
          {
            credentials: "include", // 쿠키 전송 필요
          }
        );
        let data: any;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }
        if (data && data.code === "AUTH-002") {
          router.replace("/login");
          return;
        }
        if (data.status) {
          setNotifications(data.data);
        }
      } catch (err) {
        console.error("알림 조회 실패", err);
      }
    };

    fetchNotifications();
  }, []); // router를 의존성 배열에 넣을 필요 없음

  return (
    <div className="flex flex-col h-screen bg-[#f9fafb]">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-3 p-4">
          {notifications
            .slice()
            .reverse()
            .map((notification, index) => {
              const IconComponent = iconMap[notification.type ?? "alert"];
              return (
                <motion.div
                  key={notification.id}
                  onClick={async () => {
                    try {
                      await fetch(
                        `${process.env.NEXT_PUBLIC_BACK_API_URL}/notifications/${notification.id}/read`,
                        {
                          method: "PATCH",
                          credentials: "include",
                        }
                      );

                      setNotifications((prev) =>
                        prev.map((n) =>
                          n.id === notification.id ? { ...n, read: true } : n
                        )
                      );
                    } catch (err) {
                      console.error("알림 읽음 처리 실패", err);
                    }
                    router.replace("/cards");
                  }}
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.4,
                    ease: [0.25, 0.8, 0.25, 1],
                  }}
                  className={`p-4 rounded-2xl shadow-lg bg-white flex items-start gap-3 relative transition-all transform-gpu hover:scale-[1.01] hover:shadow-xl ${
                    !notification.read ? "ring-2 ring-blue-100" : ""
                  }`}>
                  <div
                    className={`p-2 rounded-full ${
                      !notification.read ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                    <IconComponent
                      className={`h-5 w-5 ${
                        !notification.read ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </div>

                  <div className="flex-1 text-sm">
                    <div className="font-semibold">{notification.title}</div>
                    <div className="text-gray-600 mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(notification.time).toLocaleString("ko-KR", {
                        hour12: false,
                      })}
                    </div>
                  </div>

                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full absolute top-3 right-3 animate-pulse"></div>
                  )}
                </motion.div>
              );
            })}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
