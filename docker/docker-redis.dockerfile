FROM redis:alpine

COPY ./docker/config/redis.conf /etc/redis.conf

ENV REDIS_PASSWORD ${REDIS_PASSWORD}

EXPOSE ${REDIS_PORT_DOCKER}

CMD ["redis-server", "/etc/redis.conf"]