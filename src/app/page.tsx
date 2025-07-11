import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ArrowRight, Code, Palette, Zap } from "lucide-react";

export default function HomePage() {
  return <div></div>;
}

// import { Button } from "@/src/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/src/components/ui/card";
// import { ArrowRight, Code, Palette, Zap } from "lucide-react";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       {/* Hero Section */}
//       <section className="container mx-auto px-4 py-16 text-center">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
//             Next.js App Router
//             <span className="block text-blue-600">프로젝트</span>
//           </h1>
//           <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
//             최신 Next.js App Router를 사용한 모던 웹 애플리케이션입니다.
//             TypeScript, Tailwind CSS, shadcn/ui가 포함되어 있습니다.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button size="lg" className="text-lg px-8">
//               시작하기 <ArrowRight className="ml-2 h-5 w-5" />
//             </Button>
//             <Button
//               variant="outline"
//               size="lg"
//               className="text-lg px-8 bg-transparent"
//             >
//               문서 보기
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="container mx-auto px-4 py-16">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-bold text-slate-900 mb-4">주요 기능</h2>
//           <p className="text-slate-600 max-w-2xl mx-auto">
//             현대적인 웹 개발을 위한 최고의 도구들이 포함되어 있습니다.
//           </p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
//                 <Code className="h-6 w-6 text-blue-600" />
//               </div>
//               <CardTitle>TypeScript</CardTitle>
//               <CardDescription>
//                 타입 안전성과 개발자 경험을 위한 TypeScript 지원
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
//                 <Palette className="h-6 w-6 text-green-600" />
//               </div>
//               <CardTitle>Tailwind CSS</CardTitle>
//               <CardDescription>
//                 유틸리티 우선 CSS 프레임워크로 빠른 스타일링
//               </CardDescription>
//             </CardHeader>
//           </Card>

//           <Card className="text-center hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
//                 <Zap className="h-6 w-6 text-purple-600" />
//               </div>
//               <CardTitle>App Router</CardTitle>
//               <CardDescription>
//                 Next.js 13+의 새로운 App Router로 향상된 성능
//               </CardDescription>
//             </CardHeader>
//           </Card>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="container mx-auto px-4 py-16">
//         <Card className="max-w-4xl mx-auto text-center bg-slate-900 text-white">
//           <CardHeader className="pb-8">
//             <CardTitle className="text-3xl mb-4">지금 시작해보세요</CardTitle>
//             <CardDescription className="text-slate-300 text-lg">
//               프로젝트를 확장하고 원하는 기능을 추가해보세요.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button size="lg" variant="secondary" className="text-lg px-8">
//               프로젝트 시작하기
//             </Button>
//           </CardContent>
//         </Card>
//       </section>
//     </div>
//   );
// }
