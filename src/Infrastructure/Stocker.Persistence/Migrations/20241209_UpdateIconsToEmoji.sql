-- Migration: Update icon strings from Ant Design names to Emoji characters
-- Date: 2024-12-09
-- Purpose: Fix icons not displaying properly in Setup Wizard

-- ==================== ADD-ONS ====================
UPDATE master.AddOns SET Icon = N'🔌' WHERE Code = 'API_ACCESS';
UPDATE master.AddOns SET Icon = N'🎧' WHERE Code = 'PRIORITY_SUPPORT';
UPDATE master.AddOns SET Icon = N'🛡️' WHERE Code = 'ADVANCED_SECURITY';
UPDATE master.AddOns SET Icon = N'🌐' WHERE Code = 'CUSTOM_DOMAIN';
UPDATE master.AddOns SET Icon = N'🏷️' WHERE Code = 'WHITE_LABEL';
UPDATE master.AddOns SET Icon = N'☁️' WHERE Code = 'AUTO_BACKUP';
UPDATE master.AddOns SET Icon = N'📄' WHERE Code = 'E_INVOICE';
UPDATE master.AddOns SET Icon = N'🌍' WHERE Code = 'MULTI_LANGUAGE';

-- ==================== INDUSTRIES ====================
UPDATE master.Industries SET Icon = N'🏪' WHERE Code = 'RETAIL';
UPDATE master.Industries SET Icon = N'🛒' WHERE Code = 'ECOMMERCE';
UPDATE master.Industries SET Icon = N'🏭' WHERE Code = 'MANUFACTURING';
UPDATE master.Industries SET Icon = N'📦' WHERE Code = 'WHOLESALE';
UPDATE master.Industries SET Icon = N'💼' WHERE Code = 'SERVICES';
UPDATE master.Industries SET Icon = N'🏥' WHERE Code = 'HEALTHCARE';
UPDATE master.Industries SET Icon = N'🏗️' WHERE Code = 'CONSTRUCTION';
UPDATE master.Industries SET Icon = N'🎓' WHERE Code = 'EDUCATION';
UPDATE master.Industries SET Icon = N'🍽️' WHERE Code = 'RESTAURANT';
UPDATE master.Industries SET Icon = N'🚚' WHERE Code = 'LOGISTICS';
UPDATE master.Industries SET Icon = N'🚗' WHERE Code = 'AUTOMOTIVE';
UPDATE master.Industries SET Icon = N'🏢' WHERE Code = 'OTHER';

-- ==================== MODULE DEFINITIONS ====================
UPDATE master.ModuleDefinitions SET Icon = N'⚙️' WHERE Code = 'Core';
UPDATE master.ModuleDefinitions SET Icon = N'👥' WHERE Code = 'CRM';
UPDATE master.ModuleDefinitions SET Icon = N'🛒' WHERE Code = 'Sales';
UPDATE master.ModuleDefinitions SET Icon = N'📦' WHERE Code = 'Inventory';
UPDATE master.ModuleDefinitions SET Icon = N'🏪' WHERE Code = 'Purchase';
UPDATE master.ModuleDefinitions SET Icon = N'🏦' WHERE Code = 'Finance';
UPDATE master.ModuleDefinitions SET Icon = N'🧮' WHERE Code = 'ACCOUNTING';
UPDATE master.ModuleDefinitions SET Icon = N'👤' WHERE Code = 'HR';
UPDATE master.ModuleDefinitions SET Icon = N'💰' WHERE Code = 'Payroll';
UPDATE master.ModuleDefinitions SET Icon = N'📋' WHERE Code = 'Projects';
UPDATE master.ModuleDefinitions SET Icon = N'📊' WHERE Code = 'Reports';

PRINT 'Icon migration completed successfully.';
