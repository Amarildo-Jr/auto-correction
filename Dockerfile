FROM node:18-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de package
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install

# Copiar código source
COPY . .

# Expor porta
EXPOSE 3000

# Comando para desenvolvimento
CMD ["pnpm", "dev"] 