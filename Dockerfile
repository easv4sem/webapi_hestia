FROM node:18

# Install tzdata and set timezone
RUN apt-get update && apt-get install -y tzdata && \
    ln -fs /usr/share/zoneinfo/Europe/Copenhagen /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

ENV TZ=Europe/Copenhagen

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
