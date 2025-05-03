FROM node:18-alpine


WORKDIR /app

COPY    package.json yarn.lock /app/

RUN yarn install --frozen-lockfile

COPY . /app/

RUN yarn build


RUN yarn global add server

CMD ["server", "-s", "build"]