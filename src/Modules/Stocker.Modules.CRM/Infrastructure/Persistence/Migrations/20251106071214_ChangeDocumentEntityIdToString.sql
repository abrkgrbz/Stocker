BEGIN TRANSACTION;
DROP INDEX [IX_Documents_Entity_Tenant] ON [crm].[Documents];
DECLARE @var sysname;
SELECT @var = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[crm].[Documents]') AND [c].[name] = N'EntityId');
IF @var IS NOT NULL EXEC(N'ALTER TABLE [crm].[Documents] DROP CONSTRAINT [' + @var + '];');
ALTER TABLE [crm].[Documents] ALTER COLUMN [EntityId] nvarchar(450) NOT NULL;
CREATE INDEX [IX_Documents_Entity_Tenant] ON [crm].[Documents] ([EntityId], [EntityType], [TenantId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251106071214_ChangeDocumentEntityIdToString', N'9.0.8');

COMMIT;
GO

