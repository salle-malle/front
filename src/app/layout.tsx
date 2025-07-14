// import type React from "react";
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import { ThemeProvider } from "@/src/components/theme-provider";
// import { Toaster } from "@/src/components/ui/toaster";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Next.js App Router 프로젝트",
//   description: "Next.js App Router를 사용한 모던 웹 애플리케이션",
//   generator: "v0.dev",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="ko" suppressHydrationWarning>
//       <body className={inter.className}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="light"
//           enableSystem
//           disableTransitionOnChange
//         >
//           <div className="min-h-screen bg-gray-50 flex justify-center">
//             <div className="w-full max-w-sm bg-white shadow-lg">{children}</div>
//           </div>
//           <Toaster />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "@/src/components/ui/toaster";
import ConditionalLayout from "@/src/components/conditional-layout"; // 1. 새로 만든 컴포넌트 가져오기

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js App Router 프로젝트",
  description: "Next.js App Router를 사용한 모던 웹 애플리케이션",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          {/* 2. 기존 div 구조를 ConditionalLayout 컴포넌트로 대체 */}
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
