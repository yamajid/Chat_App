#!/bin/sh

# mkdir -p /etc/nginx/ssl

# apk add --no-cache openssl

# if [ ! -f /etc/nginx/ssl/mycert.crt ]; then
#   echo "Generating self-signed SSL cert..."
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout /etc/nginx/ssl/mykey.key \
#     -out /etc/nginx/ssl/mycert.crt \
#     -subj "/CN=localhost"
# fi

echo "Starting Nginx..."
nginx -g "daemon off;"