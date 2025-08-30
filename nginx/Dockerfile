FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx-coolify.conf /etc/nginx/nginx.conf
COPY conf.d-coolify/* /etc/nginx/conf.d/

# Create directories
RUN mkdir -p /var/cache/nginx/proxy \
    && mkdir -p /var/log/nginx

# Expose ports
EXPOSE 8090 8453

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/health || exit 1

CMD ["nginx", "-g", "daemon off;"]