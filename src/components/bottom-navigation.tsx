"use client";

import { useRouter, usePathname } from "next/navigation";
import { GoHomeFill } from "react-icons/go";
import { PiCardsThreeFill } from "react-icons/pi";
import { FaUser, FaHeartCirclePlus, FaHeart } from "react-icons/fa6";

const NAV_ITEMS = [
  { icon: GoHomeFill, label: "홈", path: "/home" },
  { icon: PiCardsThreeFill, label: "카드", path: "/cards" },
  { icon: FaHeart, label: "스크랩", path: "/scrap" },
  { icon: FaUser, label: "MY", path: "/profile" },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t rounded-t-lg border-gray-stroke-100">
      <div className="flex">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive =
            pathname === path || (path !== "/" && pathname.startsWith(path));

          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-1 flex-col items-center justify-center gap-1 h-16 transition-colors ${
                isActive ? "text-gray-600" : "text-gray-300 hover:text-gray-600"
              }`}
            >
              <Icon
                style={{
                  minWidth: 24,
                  minHeight: 24,
                  width: 24,
                  height: 24,
                  display: "block",
                }}
              />
              <span className="text-[10px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
