FROM node:latest

RUN git clone --verbose  https://github.com/raffaeleoni/twitter-catcher.git
WORKDIR /twitter-catcher
RUN npm install

CMD node src/app.js