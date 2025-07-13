# 🚀 프론트엔드 자동 배포 가이드

## 개요

이 프로젝트는 GitHub Actions를 통해 EC2에 자동 배포되도록 설정되어 있습니다. main 브랜치에 push/merge가 발생하면 자동으로 EC2에 배포됩니다.

## 📋 사전 준비사항

### 1. SSH 키 생성 및 설정

```bash
# 배포용 SSH 키 생성
ssh-keygen -t rsa -b 4096 -C "deploy@your-project" -f ~/.ssh/deploy_key

# 공개키를 EC2에 등록
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@your-ec2-ip

# 비밀키를 GitHub Secrets에 등록
# GitHub 저장소 > Settings > Secrets and variables > Actions
# EC2_SSH_KEY: ~/.ssh/deploy_key 파일의 내용
```

### 2. GitHub Secrets 설정

다음 Secrets를 GitHub 저장소에 등록하세요:

- `EC2_SSH_KEY`: 배포용 SSH 비밀키
- `EC2_HOST`: EC2 인스턴스의 IP 주소 또는 도메인
- `EC2_USER`: EC2 사용자명 (보통 `ubuntu`)

### 3. EC2 서버 설정

#### Node.js 및 PM2 설치

```bash
# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치
sudo npm install -g pm2

# PM2 시작 스크립트 설정
pm2 startup
```

#### Nginx 설치 및 설정

```bash
# Nginx 설치
sudo apt update
sudo apt install nginx

# Nginx 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/salle-malle-front
sudo ln -s /etc/nginx/sites-available/salle-malle-front /etc/nginx/sites-enabled/

# Nginx 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
```

#### 로그 디렉토리 생성

```bash
sudo mkdir -p /var/log/salle-malle-front
sudo chown ubuntu:ubuntu /var/log/salle-malle-front
```

### 4. 환경 변수 설정

EC2 서버의 `/var/www/salle-malle-front/` 디렉토리에 `.env.production` 파일을 생성하세요:

```bash
# .env.production 예시
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
NEXT_PUBLIC_GA_TRACKING_ID=your-ga-tracking-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🔄 배포 프로세스

### 자동 배포

1. main 브랜치에 코드를 push하거나 merge하면 자동으로 배포가 시작됩니다.
2. GitHub Actions에서 다음 단계를 수행합니다:
   - 코드 체크아웃
   - Node.js 설정
   - 의존성 설치
   - 애플리케이션 빌드
   - EC2에 파일 전송
   - 배포 스크립트 실행

### 수동 배포 (필요시)

```bash
# EC2에 직접 접속하여 수동 배포
ssh ubuntu@your-ec2-ip
cd /var/www/salle-malle-front
./deploy.sh
```

## 📁 배포 파일 구조

```
/var/www/salle-malle-front/
├── .next/                 # Next.js 빌드 결과물
├── public/                # 정적 파일
├── package.json           # 의존성 정보
├── next.config.mjs        # Next.js 설정
├── .env.production        # 프로덕션 환경 변수
├── deploy.sh              # 배포 스크립트
└── ecosystem.config.js    # PM2 설정
```

## 🔧 유용한 명령어

### PM2 관리

```bash
# 프로세스 상태 확인
pm2 list

# 로그 확인
pm2 logs salle-malle-front

# 프로세스 재시작
pm2 restart salle-malle-front

# 프로세스 중지
pm2 stop salle-malle-front
```

### Nginx 관리

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 설정 테스트
sudo nginx -t
```

### 로그 확인

```bash
# 애플리케이션 로그
tail -f /var/log/salle-malle-front/out.log

# 에러 로그
tail -f /var/log/salle-malle-front/err.log

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🚨 문제 해결

### 배포 실패 시

1. GitHub Actions 로그 확인
2. EC2 서버 접속하여 수동 배포 시도
3. 로그 파일 확인

### 애플리케이션 접속 불가 시

1. PM2 프로세스 상태 확인: `pm2 list`
2. 포트 사용 확인: `netstat -tlnp | grep :3000`
3. 방화벽 설정 확인
4. Nginx 설정 확인

## 📞 지원

배포 관련 문제가 발생하면 다음을 확인하세요:

1. GitHub Actions 로그
2. EC2 서버 로그
3. 애플리케이션 로그

문제가 지속되면 팀 리더에게 문의하세요.
