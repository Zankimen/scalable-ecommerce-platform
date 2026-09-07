FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY services/user-service/package*.json services/user-service/
RUN npm install
COPY tsconfig.base.json ./
COPY services/user-service/tsconfig.json services/user-service/
COPY services/user-service/src services/user-service/src
RUN npm run build:user

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/services/user-service/package*.json services/user-service/
RUN npm install --omit=dev
COPY --from=build /app/services/user-service/dist services/user-service/dist
EXPOSE 3001
CMD ["npm", "run", "start:user"]
