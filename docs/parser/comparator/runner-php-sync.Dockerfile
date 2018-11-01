FROM php:7.2-alpine

RUN mkdir /web
WORKDIR /web

EXPOSE 80
CMD [ "php", "-S", "0.0.0.0:80", "-t", "/web" ]
