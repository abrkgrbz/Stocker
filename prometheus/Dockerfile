FROM prom/prometheus:latest

# Copy Prometheus configuration
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Create directories for rules
RUN mkdir -p /etc/prometheus/rules

# Expose port
EXPOSE 9090

# Use the default entrypoint and command from base image
ENTRYPOINT [ "/bin/prometheus" ]
CMD [ "--config.file=/etc/prometheus/prometheus.yml", \
      "--storage.tsdb.path=/prometheus", \
      "--web.console.libraries=/usr/share/prometheus/console_libraries", \
      "--web.console.templates=/usr/share/prometheus/consoles", \
      "--web.enable-lifecycle", \
      "--storage.tsdb.retention.time=30d", \
      "--storage.tsdb.retention.size=10GB" ]