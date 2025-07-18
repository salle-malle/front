#!/bin/bash
set -e

echo "🚀 프론트엔드 배포 시작..."
cd /var/www/salle-malle-front

echo "배포 파일 압축 해제 중..."
tar -xzf deploy.tar.gz --overwrite

# 이름을 직접 쓰는 대신, 설정 파일을 통해 프로세스를 관리합니다.
# startOrRestart는 프로세스가 없으면 시작, 있으면 재시작해주는 편리한 명령어입니다.
# --update-env 플래그로 환경 변수 변경 사항도 안정적으로 적용됩니다.
echo "프로세스 재시작 또는 시작 중..."
pm2 startOrRestart ecosystem.config.js --update-env

pm2 save

echo "배포된 프로세스 상태:"
pm2 list

echo "✅ 프론트엔드 배포 완료!"
echo "🌐 애플리케이션 URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"