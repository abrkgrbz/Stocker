# Simple nginx server to serve pre-built dist folder
FROM nginx:alpine

# Copy pre-built dist folder
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]