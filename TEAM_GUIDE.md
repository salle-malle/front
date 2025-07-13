# 👥 팀원 배포 안내서

## 🎯 간단 요약

**main 브랜치에 push/merge만 하면 자동으로 배포됩니다!**

## 📝 개발 워크플로우

### 1. 기능 개발

```bash
# 새 브랜치 생성
git checkout -b feature/your-feature-name

# 개발 작업 후 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 원격 저장소에 푸시
git push origin feature/your-feature-name
```

### 2. 배포

```bash
# main 브랜치로 이동
git checkout main

# 최신 코드 가져오기
git pull origin main

# feature 브랜치 병합
git merge feature/your-feature-name

# main에 푸시 (자동 배포 시작!)
git push origin main
```

## ✅ 배포 확인

1. **GitHub Actions 확인**

   - GitHub 저장소 > Actions 탭에서 배포 진행 상황 확인
   - 초록색 체크 = 성공, 빨간색 X = 실패

2. **배포 완료 후**
   - 웹사이트 접속하여 변경사항 확인
   - 문제가 있으면 팀 리더에게 문의

## ⚠️ 주의사항

### 배포 전 체크리스트

- [ ] 코드가 정상적으로 작동하는지 확인
- [ ] 환경 변수가 올바르게 설정되었는지 확인
- [ ] 빌드 에러가 없는지 확인 (`npm run build`)

### 배포 후 체크리스트

- [ ] 웹사이트가 정상적으로 로드되는지 확인
- [ ] 새로 추가한 기능이 작동하는지 확인
- [ ] 기존 기능이 깨지지 않았는지 확인

## 🚨 문제 발생 시

### 배포 실패

1. GitHub Actions 로그 확인
2. 팀 리더에게 문의

### 웹사이트 접속 불가

1. 잠시 후 다시 시도
2. 팀 리더에게 문의

### 기능이 작동하지 않음

1. 브라우저 캐시 삭제 후 재시도
2. 팀 리더에게 문의

## 📞 연락처

- **배포 관련 문의**: 팀 리더
- **기술적 문제**: 팀 리더 또는 백엔드 개발자

## 💡 팁

- **작은 변경사항부터 배포**: 큰 변경사항은 여러 번에 나누어 배포
- **배포 전 테스트**: 로컬에서 `npm run build`로 빌드 테스트
- **명확한 커밋 메시지**: 나중에 문제 추적을 위해 명확하게 작성

---

**🎉 이제 main 브랜치에 push/merge만 하면 자동 배포됩니다!**
