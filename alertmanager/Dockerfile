FROM prom/alertmanager:latest

# Copy AlertManager configuration
COPY config.yml /etc/alertmanager/config.yml

# Create storage directory
RUN mkdir -p /alertmanager

EXPOSE 9093

ENTRYPOINT [ "/bin/alertmanager" ]
CMD [ "--config.file=/etc/alertmanager/config.yml", \
      "--storage.path=/alertmanager", \
      "--web.external-url=https://alerts.stoocker.app" ]