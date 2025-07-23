#!/bin/bash
set -e

echo "🚀 프론트엔드 배포 시작..."
cd /var/www/salle-malle-front

echo "배포 파일 압축 해제 중..."
tar -xzf deploy.tar.gz --overwrite

echo "deploy.sh 실행 권한 부여 중..."
chmod +x deploy.sh

echo "기존 프로세스 중지 중..."
pm2 stop salle-malle-front || true
pm2 delete salle-malle-front || true

echo "Next.js 캐시 정리 중..."
rm -rf .next/cache || true

echo "의존성 설치 중..."
pnpm install --prod

echo "프로덕션 환경 변수 로드 중..."
if [ -f .env.production ]; then
  export $(cat .env.production | xargs)
fi

echo "Next.js 애플리케이션 빌드 중..."
pnpm build

echo "Next.js 애플리케이션 시작 중..."
pm2 start ecosystem.config.js

pm2 save

echo "배포된 프로세스 상태:"
pm2 list

echo "✅ 프론트엔드 배포 완료!"
echo "🌐 애플리케이션 URL: http://43.200.100.172:3000"