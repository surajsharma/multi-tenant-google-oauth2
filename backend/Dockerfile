FROM node:18.10.0
WORKDIR /backend
ADD . .
RUN rm -rf node_modules
RUN npm install
RUN npm i -g nodemon
EXPOSE 3000
CMD ["npm", "start"]