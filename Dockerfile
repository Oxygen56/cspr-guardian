FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173

COPY package.json ./
RUN npm install --omit=dev

COPY data ./data
COPY public ./public
COPY scripts ./scripts
COPY src ./src
COPY submission ./submission
COPY docs ./docs
COPY README.md .env.example ./

EXPOSE 4173

CMD ["npm", "start"]
