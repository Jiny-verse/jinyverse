# Fail2Ban 서버 설치 가이드

## 1. 설치
```bash
sudo apt update && sudo apt install -y fail2ban
```

## 2. 설정 파일 배포
```bash
# jail 설정
sudo cp docker/fail2ban/jail.local /etc/fail2ban/jail.local

# 필터 설정
sudo cp docker/fail2ban/filter.d/*.conf /etc/fail2ban/filter.d/
```

## 3. Nginx 로그 경로 확인
jail.local의 logpath가 실제 Docker 볼륨 경로와 일치하는지 확인:
```bash
# nginx_logs 볼륨 실제 경로 확인
docker volume inspect jinyverse_nginx_logs --format '{{ .Mountpoint }}'
```
경로가 다르면 `jail.local`의 `logpath`를 수정.

## 4. 시작 및 확인
```bash
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# 상태 확인
sudo fail2ban-client status
sudo fail2ban-client status nginx-scanner
sudo fail2ban-client status nginx-4xx
sudo fail2ban-client status nginx-auth
sudo fail2ban-client status sshd
```

## 5. 필터 테스트
```bash
# 필터가 로그를 정상 파싱하는지 확인
sudo fail2ban-regex /var/lib/docker/volumes/*_nginx_logs/_data/access.log /etc/fail2ban/filter.d/nginx-scanner.conf
```

## 6. 수동 차단/해제
```bash
# IP 차단
sudo fail2ban-client set nginx-scanner banip 1.2.3.4

# IP 해제
sudo fail2ban-client set nginx-scanner unbanip 1.2.3.4
```
