"use client";

import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Bell, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const notifications = [
  {
    id: 1,
    type: "price",
    icon: TrendingUp,
    title: "삼성전자 주가 상승",
    message: "삼성전자가 목표가에 도달했습니다.",
    time: "5분 전",
    read: false,
  },
  {
    id: 2,
    type: "event",
    icon: Calendar,
    title: "SK하이닉스 실적 발표",
    message: "내일 3분기 실적이 발표됩니다.",
    time: "1시간 전",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    icon: AlertCircle,
    title: "포트폴리오 리밸런싱",
    message: "포트폴리오 비중 조정을 고려해보세요.",
    time: "3시간 전",
    read: true,
  },
  {
    id: 4,
    type: "price",
    icon: TrendingUp,
    title: "NAVER 주가 변동",
    message: "NAVER가 -2% 하락했습니다.",
    time: "5시간 전",
    read: true,
  },
  {
    id: 4,
    type: "price",
    icon: TrendingUp,
    title: "NAVER 주가 변동",
    message: "NAVER가 -2% 하락했습니다.",
    time: "5시간 전",
    read: true,
  },
  {
    id: 4,
    type: "price",
    icon: TrendingUp,
    title: "NAVER 주가 변동",
    message: "NAVER가 -2% 하락했습니다.",
    time: "5시간 전",
    read: true,
  },
  {
    id: 4,
    type: "price",
    icon: TrendingUp,
    title: "NAVER 주가 변동",
    message: "NAVER가 -2% 하락했습니다.",
    time: "5시간 전",
    read: true,
  },
  {
    id: 4,
    type: "price",
    icon: TrendingUp,
    title: "NAVER 주가 변동",
    message: "NAVER가 -2% 하락했습니다.",
    time: "5시간 전",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-screen bg-[#f9fafb]">
      <TopNavigation />

      <div className="p-4 sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-500" />
          알림
        </h1>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-3 p-4">
          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <motion.div
                key={`${notification.id}-${index}`}
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
                    {notification.time}
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
