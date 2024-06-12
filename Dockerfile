FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm test 

FROM node:14-alpine

WORKDIR /app

COPY --from=build /app .

EXPOSE 3000

CMD ["npm", "start"]