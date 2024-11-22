# ベースイメージを指定
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを起動
CMD ["node", "index.js"]
