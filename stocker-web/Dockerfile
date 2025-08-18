# Simple nginx server to serve pre-built dist folder
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy pre-built dist folder from stocker-web directory
COPY ./dist .

# Copy nginx configuration if exists
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]