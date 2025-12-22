FROM rabbitmq:3.13-management-alpine

# Download and install the delayed message exchange plugin
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange || true

# The plugin file needs to be downloaded for Alpine-based images
ADD --chmod=644 https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.13.0/rabbitmq_delayed_message_exchange-3.13.0.ez /opt/rabbitmq/plugins/

# Enable the plugin
RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange
