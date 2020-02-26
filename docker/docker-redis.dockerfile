FROM redis:alpine

COPY ./docker/config/redis.conf /etc/redis.conf

EXPOSE ${REDIS_PORT_DOCKER}

CMD ["redis-server", "/etc/redis.conf"]