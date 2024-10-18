FROM mirror.yunbaitech.cn/docker.io/nginx:latest
COPY dist/ /usr/share/nginx/html/
