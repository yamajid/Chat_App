
#!/bin/sh

cd /app &&  npm install && npm i -g serve && npm run build && serve -s dist -l 3000