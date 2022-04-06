FROM node:10-alpine
ENV NODE_ENV=production
WORKDIR /app

RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

RUN chown node /app
USER node

COPY package.json yarn.lock ./
RUN yarn install --production=false --frozen-lockfile
COPY . .
RUN yarn run prestart:prod

EXPOSE 4001

CMD ["node", "dist/main.js"]
