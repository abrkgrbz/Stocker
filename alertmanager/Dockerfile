FROM prom/alertmanager:latest

# Install dependencies for template processing
USER root
RUN apk add --no-cache bash

# Copy configuration template and entrypoint script
COPY config.yml.template /etc/alertmanager/config.yml.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create storage directory
RUN mkdir -p /alertmanager && \
    chown -R nobody:nobody /alertmanager /etc/alertmanager

USER nobody

EXPOSE 9093

ENTRYPOINT ["/entrypoint.sh"]