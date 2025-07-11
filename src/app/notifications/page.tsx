"use client";

import { TopNavigation } from "@/src/components/top-navigation";
import { BottomNavigation } from "@/src/components/bottom-navigation";
import { Card, CardContent } from "@/src/components/ui/card";
import { Bell, TrendingUp, Calendar, AlertCircle } from "lucide-react";

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
];

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-screen">
      <TopNavigation />

      <div className="p-4 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          알림
        </h1>
      </div>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="space-y-2 p-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`${
                  !notification.read ? "border-blue-200 bg-blue-50" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        !notification.read ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 ${
                          !notification.read ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
