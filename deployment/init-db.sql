-- Create additional databases for multi-tenant setup
CREATE DATABASE stocker_tenant_template;
CREATE DATABASE stocker_tenant_test1;
CREATE DATABASE stocker_tenant_test2;
CREATE DATABASE stocker_tenant_test3;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE stocker_master TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_template TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_test1 TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_test2 TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stocker_tenant_test3 TO postgres;