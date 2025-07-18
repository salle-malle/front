"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Calendar, Bell, ArrowLeft } from "lucide-react";

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
  title = "볼래말래",
  shadow = true,
  border = true,
}: TopNavigationProps) {
  const router = useRouter();

  const borderClass = border ? "border-b border-gray-200" : "";
  const shadowClass = shadow ? "shadow-md" : "";

  return (
    <nav className={`flex justify-between items-center p-5 bg-white ${borderClass} ${shadowClass}`}>
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="text-xl font-bold text-blue-600">{title}</div>
      </div>
      {showRightIcons && (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/calendar")}
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      )}
    </nav>
  );
}
