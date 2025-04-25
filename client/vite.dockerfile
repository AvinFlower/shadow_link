FROM node:18

WORKDIR /app

# Копируем только package.json и package-lock.json
COPY client/package*.json ./

RUN npm install

# Копируем весь клиентский код
COPY client/ .

# Сборка проекта, если надо
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
