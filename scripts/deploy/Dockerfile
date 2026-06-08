FROM mirror.yunbaitech.cn/docker.io/node:22-slim AS builder

# 基础环境变量
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

WORKDIR /app

# 复制所有代码
COPY . /app

RUN npm ci

# 使用 npx 执行构建（如果 package.json 里有 build 脚本，直接 npm run build 也可以）
RUN npm run build --workspace=@vben/web-antd 
# 注：如果你的项目不是 monorepo，上面这行直接改成 RUN npm run build

RUN echo "Builder Success 🎉"

# ==============================
# Stage 2: 生产环境运行阶段
# ==============================
FROM mirror.yunbaitech.cn/docker.io/nginx:stable-alpine AS production

# 配置 nginx
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# 复制构建产物（注意：如果是 npm 构建，产物路径可能是 dist 或 apps/web-antd/dist，根据你的实际情况调整）
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY --from=builder /app/scripts/deploy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
