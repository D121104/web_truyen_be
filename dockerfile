FROM node:20-alpine AS builder

WORKDIR /book-app

COPY package*.json ./

RUN npm install --quiet --no-optional --no-fund --loglevel=error
RUN npm install @css-inline/css-inline-linux-x64-musl

COPY . .

RUN npm run build

FROM node:20-alpine
WORKDIR /book-app

COPY --from=builder /book-app/dist ./dist
COPY --from=builder /book-app/package*.json ./
COPY --from=builder /book-app/public ./public

RUN npm install --quiet --only=production --no-optional --no-fund --loglevel=error
RUN npm install @css-inline/css-inline-linux-x64-musl

EXPOSE 8080

CMD ["npm", "run", "start:prod"]