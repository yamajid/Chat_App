FROM    nginx:1.23-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY    nginx.conf  /etc/nginx/conf.d/


EXPOSE  80 443

CMD ["nginx", "-g", "daemon off;"]