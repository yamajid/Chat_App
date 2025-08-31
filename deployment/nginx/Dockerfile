FROM    nginx:alpine


COPY    nginx.conf /etc/nginx/nginx.conf

COPY    script.sh .

RUN     chmod +x script.sh

EXPOSE  443

CMD ["sh", "script.sh"]