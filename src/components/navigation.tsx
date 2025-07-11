"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-slate-900">
            MyApp
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              홈
            </Link>
            <Link
              href="/about"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              소개
            </Link>
            <Link
              href="/services"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              서비스
            </Link>
            <Link
              href="/contact"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              연락처
            </Link>
            <Button>시작하기</Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                홈
              </Link>
              <Link
                href="/about"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                소개
              </Link>
              <Link
                href="/services"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                서비스
              </Link>
              <Link
                href="/contact"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                연락처
              </Link>
              <Button className="w-fit">시작하기</Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
