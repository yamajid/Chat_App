FROM debian:11

RUN apt update && apt upgrade -y && apt install -y redis-server

COPY script.sh .

RUN chmod +x script.sh


EXPOSE 6379

CMD ["bash", "script.sh"]