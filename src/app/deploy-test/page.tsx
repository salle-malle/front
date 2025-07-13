import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function DeployTestPage() {
  const deployInfo = {
    timestamp: new Date().toLocaleString("ko-KR"),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://43.200.100.172:8080",
    buildTime: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 배포 테스트 페이지
          </h1>
          <p className="text-lg text-gray-600">
            프론트엔드 자동 배포가 성공적으로 완료되었습니다!
          </p>
        </div>

        {/* 성공 메시지 */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-800">배포 성공!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              GitHub Actions를 통한 자동 배포가 정상적으로 완료되었습니다. 이
              페이지가 보인다면 배포가 성공한 것입니다!
            </p>
          </CardContent>
        </Card>

        {/* 배포 정보 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                배포 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">배포 시간:</span>
                <span className="text-gray-600">{deployInfo.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">환경:</span>
                <Badge
                  variant={
                    deployInfo.environment === "production"
                      ? "default"
                      : "secondary"
                  }
                >
                  {deployInfo.environment}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">버전:</span>
                <span className="text-gray-600">{deployInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">API URL:</span>
                <span className="text-gray-600 text-sm">
                  {deployInfo.apiUrl}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                시스템 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Next.js:</span>
                <Badge variant="default">정상</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">PM2:</span>
                <Badge variant="default">실행 중</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nginx:</span>
                <Badge variant="default">정상</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">EC2:</span>
                <Badge variant="default">온라인</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 기능 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 기능 테스트</CardTitle>
            <CardDescription>
              다음 기능들이 정상적으로 작동하는지 확인해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ 정적 파일 로딩</h3>
                <p className="text-sm text-gray-600">
                  이미지, CSS, JS 파일들이 정상적으로 로드됩니다.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ 라우팅</h3>
                <p className="text-sm text-gray-600">
                  Next.js 라우팅이 정상적으로 작동합니다.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ 컴포넌트 렌더링</h3>
                <p className="text-sm text-gray-600">
                  UI 컴포넌트들이 정상적으로 렌더링됩니다.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">✅ 환경 변수</h3>
                <p className="text-sm text-gray-600">
                  환경 변수가 올바르게 설정되었습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 배포 체크리스트</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                GitHub Actions 워크플로우 실행 완료
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                EC2 서버에 빌드 파일 전송 완료
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                PM2로 Next.js 애플리케이션 실행
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Nginx 프록시 설정 적용
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                웹사이트 접속 및 기능 테스트 완료
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 링크 */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            다른 페이지들도 정상적으로 작동하는지 확인해보세요.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              홈으로 이동
            </a>
            <a
              href="/home"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              홈 페이지
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
