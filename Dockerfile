FROM node:18-alpine As builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:18-alpine

ENV NODE_ENV local
USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

RUN yarn install --production --frozen-lockfile
RUN yarn db:migrate

COPY --from=builder /usr/src/app/dist ./dist

CMD [ "node", "dist/src/main.js" ]