"use client";

import { useRouter, usePathname } from "next/navigation";
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
      <div className="flex">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 h-16 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}>
              <IconComponent className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
