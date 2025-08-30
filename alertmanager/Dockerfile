FROM alpine:3.18

# Install alertmanager and dependencies
RUN apk add --no-cache \
    alertmanager \
    bash \
    ca-certificates \
    tzdata

# Copy configuration template and entrypoint script
COPY config.yml.template /etc/alertmanager/config.yml.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create storage directory
RUN mkdir -p /alertmanager /etc/alertmanager && \
    chown -R nobody:nobody /alertmanager /etc/alertmanager /entrypoint.sh

USER nobody

EXPOSE 9093

ENTRYPOINT ["/entrypoint.sh"]