FROM node:latest

RUN npm install -g nodemon

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . ./

EXPOSE ${APP_PORT}

CMD [ "npm", "start" ]