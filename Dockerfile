# ============================================================
# ETAPA 1: Construcción del proyecto Angular (Node 22)
# ============================================================
FROM node:22-alpine AS build

# Define la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero para aprovechar la caché
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todo el código fuente al contenedor
COPY . .

# Compila el proyecto Angular (Genera las carpetas browser y server)
RUN npm run build


# ============================================================
# ETAPA 2: Servidor Node.js para ejecutar Angular SSR
# ============================================================
FROM node:22-alpine

WORKDIR /app

# Copiamos TODA la carpeta dist (que incluye browser y server) desde la etapa de compilación
COPY --from=build /app/dist ./dist

# Exponemos el puerto 4000 que usa el servidor de Angular por defecto
EXPOSE 4000

# Iniciamos el servidor de Node que renderiza tu app en tiempo real
CMD ["node", "dist/eCommerceApp/server/server.mjs"]