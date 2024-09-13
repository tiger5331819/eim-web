FROM mirror.yunbaitech.cn/docker.io/nginx:1.23.4
COPY dist/ /usr/share/nginx/html/
COPY default.conf /etc/nginx/nginx.conf