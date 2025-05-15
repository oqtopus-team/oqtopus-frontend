###############################################################################
FROM oven/bun:1 AS install

WORKDIR /workspace

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile

###############################################################################
FROM oven/bun:1 AS development 

WORKDIR /workspace 
COPY --from=install /workspace/node_modules node_modules

CMD ["bun", "run", "dev"]


###############################################################################
FROM oven/bun:1 AS build 

WORKDIR /workspace 
COPY --from=install /workspace/node_modules node_modules
COPY . .

RUN bun run build


###############################################################################
FROM oven/bun:1 AS production

WORKDIR /app

# 静的ファイルをコピー
COPY --from=build /workspace/dist ./dist

# serve（静的ファイル配信用サーバー）をグローバルにインストール
RUN bun add -g serve

# ポート指定
EXPOSE 3000

# 本番サーバー起動
CMD ["serve", "dist", "-l", "3000"]