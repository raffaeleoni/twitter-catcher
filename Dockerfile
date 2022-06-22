FROM node:latest

COPY . .
RUN npm install

CMD npm run test
CMD npm run download-tweets '@Target'