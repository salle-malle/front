"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Home, CreditCard, Bookmark, User } from "lucide-react";

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "홈", path: "/home" },
    { icon: CreditCard, label: "카드", path: "/cards" },
    { icon: Bookmark, label: "스크랩", path: "/scrap" },
    { icon: User, label: "마이페이지", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-2 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => router.push(item.path)}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
