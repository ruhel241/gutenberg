FROM node:10.5-alpine

RUN mkdir /web
WORKDIR /web
RUN npm install express

EXPOSE 80
CMD [ "node", "/web/index.js" ]
