FROM public.ecr.aws/docker/library/node:22.13.1-slim

WORKDIR /usr/src/app

COPY package*.json ./

# Installer uniquement les dépendances de production et nettoyer le cache
RUN npm install --only=production && npm cache clean --force

COPY . .

# Définir la variable d'environnement pour le port
ENV PORT=4150
EXPOSE ${PORT}

CMD ["npm", "start"]