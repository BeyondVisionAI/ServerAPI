FROM node:12-alpine

WORKDIR /app
COPY . .
RUN npm install -g nodemon
RUN npm install
RUN npm install nodemon -g
EXPOSE 8084
CMD ["nodemon", "index.js"]