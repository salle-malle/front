#!/bin/bash

# 배포 스크립트 - EC2에서 실행
set -e

echo "🚀 프론트엔드 배포 시작..."

# 프로젝트 디렉토리로 이동
cd /var/www/salle-malle-front

# 기존 프로세스 중지 (PM2 사용)
if pm2 list | grep -q "salle-malle-front"; then
    echo "기존 프로세스 중지 중..."
    pm2 stop salle-malle-front
    pm2 delete salle-malle-front
fi

# 의존성 설치
echo "의존성 설치 중..."
npm ci --only=production

# 환경 변수 설정
if [ -f .env.production ]; then
    echo "프로덕션 환경 변수 로드 중..."
    export $(cat .env.production | xargs)
fi

# Next.js 애플리케이션 시작 (PM2 사용)
echo "Next.js 애플리케이션 시작 중..."
pm2 start npm --name "salle-malle-front" -- start

# PM2 설정 저장
pm2 save

# PM2 프로세스 상태 확인
echo "배포된 프로세스 상태:"
pm2 list

echo "✅ 프론트엔드 배포 완료!"
echo "🌐 애플리케이션 URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000" 