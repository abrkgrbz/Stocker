# Use official Node runtime as base
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json only
COPY package.json ./

# Delete package-lock and node_modules if exists
RUN rm -rf node_modules package-lock.json

# Install dependencies with force
RUN npm install --force

# Copy the rest of the application
COPY . .

# Set build-time variable
ARG VITE_API_URL=http://95.217.219.4:5000
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# Use nginx to serve the app
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]