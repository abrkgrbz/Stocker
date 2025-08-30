FROM grafana/grafana:latest

# Copy provisioning files
COPY provisioning /etc/grafana/provisioning

# Create dashboards directory
RUN mkdir -p /var/lib/grafana/dashboards

# Copy any pre-configured dashboards if exists
# COPY dashboards/*.json /var/lib/grafana/dashboards/

USER grafana

EXPOSE 3000