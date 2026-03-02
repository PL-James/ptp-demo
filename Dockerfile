FROM node:22 AS builder

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc && \
    npm ci && npm run patch-env:demo && npm run build:prod && \
    rm -f .npmrc

FROM nginx:latest AS runtime
COPY --from=builder /usr/local/app/www /usr/share/nginx/html
COPY --from=builder /usr/local/app/www/assets/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.sample.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]

LABEL name="PTP Enterprise Wallet Frontend" description="The Frontend for PTP Enterprise Wallet"
