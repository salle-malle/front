"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Calendar, Bell } from "lucide-react";

export function TopNavigation() {
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center p-5 bg-white border-b border-gray-200 shadow-md">
      <div className="text-xl font-bold text-blue-600">볼래말래</div>
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
    </nav>
  );
}
