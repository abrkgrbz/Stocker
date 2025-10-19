IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF SCHEMA_ID(N'CRM') IS NULL EXEC(N'CREATE SCHEMA [CRM];');

CREATE TABLE [CRM].[Customers] (
    [Id] uniqueidentifier NOT NULL,
    [CompanyName] nvarchar(200) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [Phone] nvarchar(50) NULL,
    [Website] nvarchar(255) NULL,
    [Industry] nvarchar(100) NULL,
    [Address] nvarchar(500) NULL,
    [City] nvarchar(100) NULL,
    [State] nvarchar(100) NULL,
    [Country] nvarchar(100) NULL,
    [PostalCode] nvarchar(20) NULL,
    [AnnualRevenue] decimal(18,2) NULL,
    [NumberOfEmployees] int NULL,
    [Description] nvarchar(2000) NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
);

CREATE TABLE [CRM].[Leads] (
    [Id] uniqueidentifier NOT NULL,
    [CompanyName] nvarchar(200) NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [Phone] nvarchar(50) NULL,
    [MobilePhone] nvarchar(50) NULL,
    [JobTitle] nvarchar(100) NULL,
    [Industry] nvarchar(100) NULL,
    [Source] nvarchar(100) NULL,
    [Status] nvarchar(50) NOT NULL,
    [Rating] nvarchar(50) NOT NULL,
    [Address] nvarchar(500) NULL,
    [City] nvarchar(100) NULL,
    [State] nvarchar(100) NULL,
    [Country] nvarchar(100) NULL,
    [PostalCode] nvarchar(20) NULL,
    [Website] nvarchar(255) NULL,
    [AnnualRevenue] decimal(18,2) NULL,
    [NumberOfEmployees] int NULL,
    [Description] nvarchar(2000) NULL,
    [AssignedToUserId] uniqueidentifier NULL,
    [ConvertedDate] datetime2 NULL,
    [ConvertedToCustomerId] uniqueidentifier NULL,
    [Score] int NOT NULL DEFAULT 0,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Leads] PRIMARY KEY ([Id])
);

CREATE TABLE [CRM].[Contacts] (
    [Id] uniqueidentifier NOT NULL,
    [CustomerId] uniqueidentifier NOT NULL,
    [FirstName] nvarchar(100) NOT NULL,
    [LastName] nvarchar(100) NOT NULL,
    [Email] nvarchar(255) NOT NULL,
    [Phone] nvarchar(50) NULL,
    [MobilePhone] nvarchar(50) NULL,
    [JobTitle] nvarchar(100) NULL,
    [Department] nvarchar(100) NULL,
    [IsPrimary] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [Notes] nvarchar(1000) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Contacts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Contacts_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [CRM].[Customers] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Contacts_CustomerId] ON [CRM].[Contacts] ([CustomerId]);

CREATE INDEX [IX_Contacts_TenantId] ON [CRM].[Contacts] ([TenantId]);

CREATE INDEX [IX_Contacts_TenantId_CustomerId] ON [CRM].[Contacts] ([TenantId], [CustomerId]);

CREATE INDEX [IX_Contacts_TenantId_CustomerId_IsPrimary] ON [CRM].[Contacts] ([TenantId], [CustomerId], [IsPrimary]);

CREATE INDEX [IX_Contacts_TenantId_Email] ON [CRM].[Contacts] ([TenantId], [Email]);

CREATE INDEX [IX_Contacts_TenantId_IsActive] ON [CRM].[Contacts] ([TenantId], [IsActive]);

CREATE INDEX [IX_Customers_TenantId] ON [CRM].[Customers] ([TenantId]);

CREATE INDEX [IX_Customers_TenantId_CompanyName] ON [CRM].[Customers] ([TenantId], [CompanyName]);

CREATE UNIQUE INDEX [IX_Customers_TenantId_Email] ON [CRM].[Customers] ([TenantId], [Email]);

CREATE INDEX [IX_Customers_TenantId_IsActive] ON [CRM].[Customers] ([TenantId], [IsActive]);

CREATE INDEX [IX_Leads_TenantId] ON [CRM].[Leads] ([TenantId]);

CREATE INDEX [IX_Leads_TenantId_AssignedToUserId] ON [CRM].[Leads] ([TenantId], [AssignedToUserId]);

CREATE INDEX [IX_Leads_TenantId_ConvertedToCustomerId] ON [CRM].[Leads] ([TenantId], [ConvertedToCustomerId]);

CREATE UNIQUE INDEX [IX_Leads_TenantId_Email] ON [CRM].[Leads] ([TenantId], [Email]);

CREATE INDEX [IX_Leads_TenantId_Rating] ON [CRM].[Leads] ([TenantId], [Rating]);

CREATE INDEX [IX_Leads_TenantId_Score] ON [CRM].[Leads] ([TenantId], [Score]);

CREATE INDEX [IX_Leads_TenantId_Status] ON [CRM].[Leads] ([TenantId], [Status]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250808114711_InitialCRM', N'9.0.8');

IF SCHEMA_ID(N'crm') IS NULL EXEC(N'CREATE SCHEMA [crm];');

ALTER TABLE [CRM].[Leads] ADD [CampaignId] uniqueidentifier NULL;

CREATE TABLE [crm].[Campaigns] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [Type] int NOT NULL,
    [Status] int NOT NULL,
    [StartDate] datetime2 NOT NULL,
    [EndDate] datetime2 NOT NULL,
    [BudgetedCost] decimal(18,2) NOT NULL,
    [BudgetedCurrency] nvarchar(3) NOT NULL,
    [ActualCost] decimal(18,2) NOT NULL,
    [ActualCostCurrency] nvarchar(3) NOT NULL,
    [ExpectedRevenue] decimal(18,2) NOT NULL,
    [ExpectedRevenueCurrency] nvarchar(3) NOT NULL,
    [ActualRevenue] decimal(18,2) NOT NULL,
    [ActualRevenueCurrency] nvarchar(3) NOT NULL,
    [ExpectedResponse] int NOT NULL,
    [ActualResponse] int NOT NULL,
    [NumberSent] int NOT NULL,
    [NumberDelivered] int NOT NULL,
    [NumberOpened] int NOT NULL,
    [NumberClicked] int NOT NULL,
    [NumberUnsubscribed] int NOT NULL,
    [NumberBounced] int NOT NULL,
    [TargetAudience] nvarchar(max) NULL,
    [Objective] nvarchar(max) NULL,
    [ParentCampaignId] int NULL,
    [OwnerId] int NOT NULL,
    [EmailSubject] nvarchar(max) NULL,
    [EmailBody] nvarchar(max) NULL,
    [EmailTemplateId] int NULL,
    [EmailFromAddress] nvarchar(max) NULL,
    [EmailFromName] nvarchar(max) NULL,
    [EmailReplyTo] nvarchar(max) NULL,
    [LandingPageUrl] nvarchar(max) NULL,
    [UtmSource] nvarchar(max) NULL,
    [UtmMedium] nvarchar(max) NULL,
    [UtmCampaign] nvarchar(max) NULL,
    [UtmTerm] nvarchar(max) NULL,
    [UtmContent] nvarchar(max) NULL,
    [ParentCampaignId1] uniqueidentifier NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Campaigns] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Campaigns_Campaigns_ParentCampaignId1] FOREIGN KEY ([ParentCampaignId1]) REFERENCES [crm].[Campaigns] ([Id])
);

CREATE TABLE [crm].[LeadScoringHistories] (
    [Id] uniqueidentifier NOT NULL,
    [LeadId] int NOT NULL,
    [PreviousScore] int NOT NULL,
    [NewScore] int NOT NULL,
    [RuleApplied] nvarchar(max) NULL,
    [ScoreChange] int NOT NULL,
    [Reason] nvarchar(max) NULL,
    [ScoredAt] datetime2 NOT NULL,
    [LeadId1] uniqueidentifier NOT NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_LeadScoringHistories] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LeadScoringHistories_Leads_LeadId1] FOREIGN KEY ([LeadId1]) REFERENCES [CRM].[Leads] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [crm].[LeadScoringRules] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Category] nvarchar(max) NOT NULL,
    [Field] nvarchar(max) NOT NULL,
    [Operator] nvarchar(max) NOT NULL,
    [Value] nvarchar(max) NULL,
    [Score] int NOT NULL,
    [IsActive] bit NOT NULL,
    [Priority] int NOT NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_LeadScoringRules] PRIMARY KEY ([Id])
);

CREATE TABLE [crm].[Pipelines] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Type] int NOT NULL,
    [IsActive] bit NOT NULL,
    [IsDefault] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    [Currency] nvarchar(max) NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Pipelines] PRIMARY KEY ([Id])
);

CREATE TABLE [crm].[PipelineStages] (
    [Id] uniqueidentifier NOT NULL,
    [PipelineId] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Probability] decimal(18,2) NOT NULL,
    [DisplayOrder] int NOT NULL,
    [IsWon] bit NOT NULL,
    [IsLost] bit NOT NULL,
    [IsActive] bit NOT NULL,
    [Color] nvarchar(max) NULL,
    [RottenDays] int NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_PipelineStages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PipelineStages_Pipelines_PipelineId] FOREIGN KEY ([PipelineId]) REFERENCES [crm].[Pipelines] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [crm].[Deals] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [CustomerId] uniqueidentifier NULL,
    [ContactId] uniqueidentifier NULL,
    [PipelineId] uniqueidentifier NOT NULL,
    [StageId] uniqueidentifier NOT NULL,
    [Value] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL,
    [RecurringValue] decimal(18,2) NULL,
    [RecurringCurrency] nvarchar(3) NULL,
    [RecurringPeriod] int NULL,
    [RecurringCycles] int NULL,
    [Probability] decimal(18,2) NOT NULL,
    [ExpectedCloseDate] datetime2 NULL,
    [ActualCloseDate] datetime2 NULL,
    [Status] int NOT NULL,
    [LostReason] nvarchar(max) NULL,
    [OwnerId] int NOT NULL,
    [Priority] int NOT NULL,
    [Deal_Currency] nvarchar(max) NULL,
    [RottenDays] int NULL,
    [LastActivityDate] datetime2 NULL,
    [NextActivityDate] datetime2 NULL,
    [ActivitiesCount] int NOT NULL,
    [EmailsCount] int NOT NULL,
    [Labels] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Deals] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Deals_Contacts_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [CRM].[Contacts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Deals_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [CRM].[Customers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Deals_PipelineStages_StageId] FOREIGN KEY ([StageId]) REFERENCES [crm].[PipelineStages] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Deals_Pipelines_PipelineId] FOREIGN KEY ([PipelineId]) REFERENCES [crm].[Pipelines] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [crm].[Opportunities] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(200) NOT NULL,
    [Description] nvarchar(2000) NULL,
    [CustomerId] uniqueidentifier NULL,
    [ContactId] uniqueidentifier NULL,
    [LeadId] uniqueidentifier NULL,
    [PipelineId] uniqueidentifier NOT NULL,
    [StageId] uniqueidentifier NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL,
    [Probability] decimal(18,2) NOT NULL,
    [ExpectedCloseDate] datetime2 NOT NULL,
    [ActualCloseDate] datetime2 NULL,
    [Status] int NOT NULL,
    [LostReason] nvarchar(max) NULL,
    [CompetitorName] nvarchar(max) NULL,
    [CampaignId] uniqueidentifier NULL,
    [OwnerId] int NOT NULL,
    [Source] int NOT NULL,
    [Type] int NOT NULL,
    [ParentOpportunityId] uniqueidentifier NULL,
    [NextStep] nvarchar(max) NULL,
    [Priority] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [CampaignId1] uniqueidentifier NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Opportunities] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Opportunities_Campaigns_CampaignId] FOREIGN KEY ([CampaignId]) REFERENCES [crm].[Campaigns] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_Campaigns_CampaignId1] FOREIGN KEY ([CampaignId1]) REFERENCES [crm].[Campaigns] ([Id]),
    CONSTRAINT [FK_Opportunities_Contacts_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [CRM].[Contacts] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [CRM].[Customers] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_Leads_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [CRM].[Leads] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_Opportunities_ParentOpportunityId] FOREIGN KEY ([ParentOpportunityId]) REFERENCES [crm].[Opportunities] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_PipelineStages_StageId] FOREIGN KEY ([StageId]) REFERENCES [crm].[PipelineStages] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_Opportunities_Pipelines_PipelineId] FOREIGN KEY ([PipelineId]) REFERENCES [crm].[Pipelines] ([Id]) ON DELETE NO ACTION
);

CREATE TABLE [crm].[DealProducts] (
    [Id] uniqueidentifier NOT NULL,
    [DealId] uniqueidentifier NOT NULL,
    [ProductId] int NOT NULL,
    [ProductName] nvarchar(200) NOT NULL,
    [ProductCode] nvarchar(50) NULL,
    [Description] nvarchar(1000) NULL,
    [Quantity] decimal(18,2) NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL,
    [DiscountPercent] decimal(18,2) NOT NULL,
    [DiscountAmount] decimal(18,2) NOT NULL,
    [DiscountCurrency] nvarchar(3) NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    [TotalPriceCurrency] nvarchar(3) NOT NULL,
    [Tax] decimal(18,2) NOT NULL,
    [TaxAmount] decimal(18,2) NOT NULL,
    [TaxCurrency] nvarchar(3) NOT NULL,
    [SortOrder] int NOT NULL,
    [IsRecurring] bit NOT NULL,
    [RecurringPeriod] nvarchar(max) NULL,
    [RecurringCycles] int NULL,
    [DealId1] uniqueidentifier NOT NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_DealProducts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DealProducts_Deals_DealId] FOREIGN KEY ([DealId]) REFERENCES [crm].[Deals] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_DealProducts_Deals_DealId1] FOREIGN KEY ([DealId1]) REFERENCES [crm].[Deals] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [crm].[Activities] (
    [Id] uniqueidentifier NOT NULL,
    [Subject] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Type] int NOT NULL,
    [Status] int NOT NULL,
    [Priority] int NOT NULL,
    [DueDate] datetime2 NULL,
    [CompletedDate] datetime2 NULL,
    [Duration] time NULL,
    [Location] nvarchar(max) NULL,
    [RelatedEntityType] nvarchar(max) NULL,
    [RelatedEntityId] int NULL,
    [CustomerId] uniqueidentifier NULL,
    [ContactId] uniqueidentifier NULL,
    [LeadId] uniqueidentifier NULL,
    [OpportunityId] uniqueidentifier NULL,
    [DealId] uniqueidentifier NULL,
    [OwnerId] int NOT NULL,
    [AssignedToId] int NULL,
    [CallDirection] nvarchar(max) NULL,
    [CallDuration] nvarchar(max) NULL,
    [CallRecordingUrl] nvarchar(max) NULL,
    [EmailFrom] nvarchar(max) NULL,
    [EmailTo] nvarchar(max) NULL,
    [EmailCc] nvarchar(max) NULL,
    [EmailBcc] nvarchar(max) NULL,
    [EmailSubject] nvarchar(max) NULL,
    [EmailBody] nvarchar(max) NULL,
    [EmailHasAttachments] bit NULL,
    [MeetingStartTime] datetime2 NULL,
    [MeetingEndTime] datetime2 NULL,
    [MeetingAttendees] nvarchar(max) NULL,
    [MeetingAgenda] nvarchar(max) NULL,
    [MeetingNotes] nvarchar(max) NULL,
    [MeetingLink] nvarchar(max) NULL,
    [TaskProgress] decimal(18,2) NULL,
    [TaskOutcome] nvarchar(max) NULL,
    [DealId1] uniqueidentifier NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Activities_Contacts_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [CRM].[Contacts] ([Id]),
    CONSTRAINT [FK_Activities_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [CRM].[Customers] ([Id]),
    CONSTRAINT [FK_Activities_Deals_DealId] FOREIGN KEY ([DealId]) REFERENCES [crm].[Deals] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Activities_Deals_DealId1] FOREIGN KEY ([DealId1]) REFERENCES [crm].[Deals] ([Id]),
    CONSTRAINT [FK_Activities_Leads_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [CRM].[Leads] ([Id]),
    CONSTRAINT [FK_Activities_Opportunities_OpportunityId] FOREIGN KEY ([OpportunityId]) REFERENCES [crm].[Opportunities] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [crm].[CampaignMembers] (
    [Id] uniqueidentifier NOT NULL,
    [CampaignId] int NOT NULL,
    [ContactId] int NULL,
    [LeadId] int NULL,
    [Status] int NOT NULL,
    [RespondedDate] datetime2 NULL,
    [FirstOpenDate] datetime2 NULL,
    [LastOpenDate] datetime2 NULL,
    [OpenCount] int NOT NULL,
    [FirstClickDate] datetime2 NULL,
    [LastClickDate] datetime2 NULL,
    [ClickCount] int NOT NULL,
    [UnsubscribedDate] datetime2 NULL,
    [BouncedDate] datetime2 NULL,
    [BounceReason] nvarchar(max) NULL,
    [HasConverted] bit NOT NULL,
    [ConvertedDate] datetime2 NULL,
    [ConvertedOpportunityId] int NULL,
    [CampaignId1] uniqueidentifier NOT NULL,
    [ContactId1] uniqueidentifier NULL,
    [LeadId1] uniqueidentifier NULL,
    [ConvertedOpportunityId1] uniqueidentifier NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_CampaignMembers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CampaignMembers_Campaigns_CampaignId1] FOREIGN KEY ([CampaignId1]) REFERENCES [crm].[Campaigns] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CampaignMembers_Contacts_ContactId1] FOREIGN KEY ([ContactId1]) REFERENCES [CRM].[Contacts] ([Id]),
    CONSTRAINT [FK_CampaignMembers_Leads_LeadId1] FOREIGN KEY ([LeadId1]) REFERENCES [CRM].[Leads] ([Id]),
    CONSTRAINT [FK_CampaignMembers_Opportunities_ConvertedOpportunityId1] FOREIGN KEY ([ConvertedOpportunityId1]) REFERENCES [crm].[Opportunities] ([Id])
);

CREATE TABLE [crm].[OpportunityProducts] (
    [Id] uniqueidentifier NOT NULL,
    [OpportunityId] uniqueidentifier NOT NULL,
    [ProductId] int NOT NULL,
    [ProductName] nvarchar(200) NOT NULL,
    [ProductCode] nvarchar(50) NULL,
    [Description] nvarchar(1000) NULL,
    [Quantity] decimal(18,2) NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [Currency] nvarchar(3) NOT NULL,
    [DiscountPercent] decimal(18,2) NOT NULL,
    [DiscountAmount] decimal(18,2) NOT NULL,
    [DiscountCurrency] nvarchar(3) NOT NULL,
    [TotalPrice] decimal(18,2) NOT NULL,
    [TotalPriceCurrency] nvarchar(3) NOT NULL,
    [SortOrder] int NOT NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_OpportunityProducts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_OpportunityProducts_Opportunities_OpportunityId] FOREIGN KEY ([OpportunityId]) REFERENCES [crm].[Opportunities] ([Id]) ON DELETE CASCADE
);

CREATE TABLE [crm].[Notes] (
    [Id] uniqueidentifier NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [Type] int NOT NULL,
    [IsPinned] bit NOT NULL,
    [IsPrivate] bit NOT NULL,
    [RelatedEntityType] nvarchar(max) NULL,
    [RelatedEntityId] int NULL,
    [CustomerId] uniqueidentifier NULL,
    [ContactId] uniqueidentifier NULL,
    [LeadId] uniqueidentifier NULL,
    [OpportunityId] uniqueidentifier NULL,
    [DealId] uniqueidentifier NULL,
    [ActivityId] uniqueidentifier NULL,
    [CreatedById] int NOT NULL,
    [LastModifiedById] int NULL,
    [AttachmentUrls] nvarchar(max) NULL,
    [DealId1] uniqueidentifier NULL,
    [TenantId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_Notes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notes_Activities_ActivityId] FOREIGN KEY ([ActivityId]) REFERENCES [crm].[Activities] ([Id]),
    CONSTRAINT [FK_Notes_Contacts_ContactId] FOREIGN KEY ([ContactId]) REFERENCES [CRM].[Contacts] ([Id]),
    CONSTRAINT [FK_Notes_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [CRM].[Customers] ([Id]),
    CONSTRAINT [FK_Notes_Deals_DealId] FOREIGN KEY ([DealId]) REFERENCES [crm].[Deals] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Notes_Deals_DealId1] FOREIGN KEY ([DealId1]) REFERENCES [crm].[Deals] ([Id]),
    CONSTRAINT [FK_Notes_Leads_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [CRM].[Leads] ([Id]),
    CONSTRAINT [FK_Notes_Opportunities_OpportunityId] FOREIGN KEY ([OpportunityId]) REFERENCES [crm].[Opportunities] ([Id]) ON DELETE CASCADE
);

CREATE INDEX [IX_Leads_CampaignId] ON [CRM].[Leads] ([CampaignId]);

CREATE INDEX [IX_Activities_ContactId] ON [crm].[Activities] ([ContactId]);

CREATE INDEX [IX_Activities_CustomerId] ON [crm].[Activities] ([CustomerId]);

CREATE INDEX [IX_Activities_DealId] ON [crm].[Activities] ([DealId]);

CREATE INDEX [IX_Activities_DealId1] ON [crm].[Activities] ([DealId1]);

CREATE INDEX [IX_Activities_LeadId] ON [crm].[Activities] ([LeadId]);

CREATE INDEX [IX_Activities_OpportunityId] ON [crm].[Activities] ([OpportunityId]);

CREATE INDEX [IX_CampaignMembers_CampaignId1] ON [crm].[CampaignMembers] ([CampaignId1]);

CREATE INDEX [IX_CampaignMembers_ContactId1] ON [crm].[CampaignMembers] ([ContactId1]);

CREATE INDEX [IX_CampaignMembers_ConvertedOpportunityId1] ON [crm].[CampaignMembers] ([ConvertedOpportunityId1]);

CREATE INDEX [IX_CampaignMembers_LeadId1] ON [crm].[CampaignMembers] ([LeadId1]);

CREATE INDEX [IX_Campaigns_ParentCampaignId1] ON [crm].[Campaigns] ([ParentCampaignId1]);

CREATE INDEX [IX_Campaigns_TenantId] ON [crm].[Campaigns] ([TenantId]);

CREATE INDEX [IX_Campaigns_TenantId_StartDate_EndDate] ON [crm].[Campaigns] ([TenantId], [StartDate], [EndDate]);

CREATE INDEX [IX_Campaigns_TenantId_Status] ON [crm].[Campaigns] ([TenantId], [Status]);

CREATE INDEX [IX_Campaigns_TenantId_Type] ON [crm].[Campaigns] ([TenantId], [Type]);

CREATE INDEX [IX_DealProducts_DealId] ON [crm].[DealProducts] ([DealId]);

CREATE INDEX [IX_DealProducts_DealId1] ON [crm].[DealProducts] ([DealId1]);

CREATE INDEX [IX_DealProducts_TenantId] ON [crm].[DealProducts] ([TenantId]);

CREATE INDEX [IX_DealProducts_TenantId_DealId] ON [crm].[DealProducts] ([TenantId], [DealId]);

CREATE INDEX [IX_DealProducts_TenantId_ProductId] ON [crm].[DealProducts] ([TenantId], [ProductId]);

CREATE INDEX [IX_Deals_ContactId] ON [crm].[Deals] ([ContactId]);

CREATE INDEX [IX_Deals_CustomerId] ON [crm].[Deals] ([CustomerId]);

CREATE INDEX [IX_Deals_PipelineId] ON [crm].[Deals] ([PipelineId]);

CREATE INDEX [IX_Deals_StageId] ON [crm].[Deals] ([StageId]);

CREATE INDEX [IX_Deals_TenantId] ON [crm].[Deals] ([TenantId]);

CREATE INDEX [IX_Deals_TenantId_CustomerId] ON [crm].[Deals] ([TenantId], [CustomerId]);

CREATE INDEX [IX_Deals_TenantId_ExpectedCloseDate] ON [crm].[Deals] ([TenantId], [ExpectedCloseDate]);

CREATE INDEX [IX_Deals_TenantId_PipelineId] ON [crm].[Deals] ([TenantId], [PipelineId]);

CREATE INDEX [IX_Deals_TenantId_StageId] ON [crm].[Deals] ([TenantId], [StageId]);

CREATE INDEX [IX_Deals_TenantId_Status] ON [crm].[Deals] ([TenantId], [Status]);

CREATE INDEX [IX_LeadScoringHistories_LeadId1] ON [crm].[LeadScoringHistories] ([LeadId1]);

CREATE INDEX [IX_Notes_ActivityId] ON [crm].[Notes] ([ActivityId]);

CREATE INDEX [IX_Notes_ContactId] ON [crm].[Notes] ([ContactId]);

CREATE INDEX [IX_Notes_CustomerId] ON [crm].[Notes] ([CustomerId]);

CREATE INDEX [IX_Notes_DealId] ON [crm].[Notes] ([DealId]);

CREATE INDEX [IX_Notes_DealId1] ON [crm].[Notes] ([DealId1]);

CREATE INDEX [IX_Notes_LeadId] ON [crm].[Notes] ([LeadId]);

CREATE INDEX [IX_Notes_OpportunityId] ON [crm].[Notes] ([OpportunityId]);

CREATE INDEX [IX_Opportunities_CampaignId] ON [crm].[Opportunities] ([CampaignId]);

CREATE INDEX [IX_Opportunities_CampaignId1] ON [crm].[Opportunities] ([CampaignId1]);

CREATE INDEX [IX_Opportunities_ContactId] ON [crm].[Opportunities] ([ContactId]);

CREATE INDEX [IX_Opportunities_CustomerId] ON [crm].[Opportunities] ([CustomerId]);

CREATE INDEX [IX_Opportunities_LeadId] ON [crm].[Opportunities] ([LeadId]);

CREATE INDEX [IX_Opportunities_ParentOpportunityId] ON [crm].[Opportunities] ([ParentOpportunityId]);

CREATE INDEX [IX_Opportunities_PipelineId] ON [crm].[Opportunities] ([PipelineId]);

CREATE INDEX [IX_Opportunities_StageId] ON [crm].[Opportunities] ([StageId]);

CREATE INDEX [IX_Opportunities_TenantId] ON [crm].[Opportunities] ([TenantId]);

CREATE INDEX [IX_Opportunities_TenantId_CustomerId] ON [crm].[Opportunities] ([TenantId], [CustomerId]);

CREATE INDEX [IX_Opportunities_TenantId_ExpectedCloseDate] ON [crm].[Opportunities] ([TenantId], [ExpectedCloseDate]);

CREATE INDEX [IX_Opportunities_TenantId_LeadId] ON [crm].[Opportunities] ([TenantId], [LeadId]);

CREATE INDEX [IX_Opportunities_TenantId_PipelineId] ON [crm].[Opportunities] ([TenantId], [PipelineId]);

CREATE INDEX [IX_Opportunities_TenantId_StageId] ON [crm].[Opportunities] ([TenantId], [StageId]);

CREATE INDEX [IX_Opportunities_TenantId_Status] ON [crm].[Opportunities] ([TenantId], [Status]);

CREATE INDEX [IX_OpportunityProducts_OpportunityId] ON [crm].[OpportunityProducts] ([OpportunityId]);

CREATE INDEX [IX_OpportunityProducts_TenantId] ON [crm].[OpportunityProducts] ([TenantId]);

CREATE INDEX [IX_OpportunityProducts_TenantId_OpportunityId] ON [crm].[OpportunityProducts] ([TenantId], [OpportunityId]);

CREATE INDEX [IX_OpportunityProducts_TenantId_ProductId] ON [crm].[OpportunityProducts] ([TenantId], [ProductId]);

CREATE INDEX [IX_PipelineStages_PipelineId] ON [crm].[PipelineStages] ([PipelineId]);

ALTER TABLE [CRM].[Leads] ADD CONSTRAINT [FK_Leads_Campaigns_CampaignId] FOREIGN KEY ([CampaignId]) REFERENCES [crm].[Campaigns] ([Id]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251019073303_FixCrmInternalFKTypes', N'9.0.8');

COMMIT;
GO

