FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY data ./data
COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY submission ./submission
COPY docs ./docs
COPY README.md .env.example ./

EXPOSE 4173

CMD ["pnpm", "start"]
