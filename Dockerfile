# Dockerfile.sonar
FROM node:20-bookworm-slim

WORKDIR /app

# Só precisa do sonar-scanner disponível
RUN npm install -g npm@latest sonar-scanner

ENV SONAR_HOST_URL=http://sonarqube:9000

CMD ["sonar-scanner"]