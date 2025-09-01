#!/bin/bash

# Simple Backup Script for Stocker
# Run daily via cron: 0 2 * * * /root/backup-script.sh

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# 1. Backup SQL Server databases
echo "Backing up SQL Server..."
docker exec $(docker ps -q -f name=mssql) /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrongPassword123!' \
  -Q "BACKUP DATABASE StockerMasterDb TO DISK='/tmp/master.bak' WITH FORMAT" && \
docker cp $(docker ps -q -f name=mssql):/tmp/master.bak $BACKUP_DIR/

docker exec $(docker ps -q -f name=mssql) /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrongPassword123!' \
  -Q "BACKUP DATABASE StockerTenantDb TO DISK='/tmp/tenant.bak' WITH FORMAT" && \
docker cp $(docker ps -q -f name=mssql):/tmp/tenant.bak $BACKUP_DIR/

# 2. Backup Redis
echo "Backing up Redis..."
docker exec $(docker ps -q -f name=redis) redis-cli BGSAVE
sleep 5
docker cp $(docker ps -q -f name=redis):/data/dump.rdb $BACKUP_DIR/redis-dump.rdb

# 3. Backup Docker volumes
echo "Backing up Docker volumes..."
docker run --rm \
  -v mssql-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/mssql-volume.tar.gz /data

# 4. Compress all backups
echo "Compressing backups..."
tar czf /backups/stocker-backup-$(date +%Y%m%d_%H%M%S).tar.gz -C $BACKUP_DIR .

# 5. Clean up old backups (keep last 7 days)
find /backups -name "*.tar.gz" -mtime +7 -delete

# 6. Optional: Upload to remote storage (uncomment if needed)
# rclone copy /backups/stocker-backup-$(date +%Y%m%d)*.tar.gz remote:backups/

echo "Backup completed at $(date)"
echo "Backup saved to: $BACKUP_DIR"