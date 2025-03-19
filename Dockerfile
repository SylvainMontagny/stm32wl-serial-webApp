FROM public.ecr.aws/docker/library/node:22.13.1-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production && npm cache clean --force

COPY . .

ENV PORT=4150
EXPOSE ${PORT}

CMD ["npm", "start"]