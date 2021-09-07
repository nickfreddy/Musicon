FROM node:14-alpine
WORKDIR /musicon
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]