# Ant Design Migration Plan

## Overview

This document outlines the phased migration strategy from Ant Design to our custom enterprise component library.

## Migration Phases

### Phase 1: Foundation (Completed)

**Objective**: Establish core primitive components

**Deliverables**:
- [x] cn() utility for class name handling
- [x] Input component with variants
- [x] Textarea component
- [x] Select component with Headless UI
- [x] Button component with variants
- [x] Spinner/Loading components
- [x] Badge/StatusBadge components
- [x] Modal component with Headless UI
- [x] Drawer component with Headless UI
- [x] FormSection/FormField patterns
- [x] Install @headlessui/react
- [x] Install @heroicons/react

### Phase 2: Form Components

**Objective**: Build form-specific components

**Components to Create**:
- [ ] Checkbox/CheckboxGroup
- [ ] Radio/RadioGroup
- [ ] Switch/Toggle
- [ ] DatePicker (consider date-fns + custom)
- [ ] DateRangePicker
- [ ] NumberInput with formatting
- [ ] SearchInput with debounce
- [ ] FileUpload/Dropzone

### Phase 3: Data Display

**Objective**: Create data display components

**Components to Create**:
- [ ] Table (TanStack Table based)
- [ ] Card with variants
- [ ] List/ListItem
- [ ] Descriptions (key-value display)
- [ ] Empty state
- [ ] Skeleton loaders
- [ ] Avatar/AvatarGroup

### Phase 4: Navigation

**Objective**: Create navigation components

**Components to Create**:
- [ ] Tabs/TabPanel
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Steps/Stepper
- [ ] Menu (vertical)
- [ ] Dropdown menu

### Phase 5: Feedback

**Objective**: Complete feedback components

**Components to Create**:
- [ ] Toast/Notification system
- [ ] Alert/Message
- [ ] Progress bar
- [ ] Tooltip
- [ ] Popover

### Phase 6: Layout

**Objective**: Create layout components

**Components to Create**:
- [ ] PageContainer
- [ ] PageHeader
- [ ] Section
- [ ] Divider
- [ ] Space/Stack

## Component Mapping (Ant Design -> Custom)

| Ant Design | Custom Replacement |
|------------|-------------------|
| Form.Item | FormField |
| Input | Input (primitives) |
| Input.TextArea | Textarea |
| Select | Select (Headless UI) |
| Button | Button (primitives) |
| Spin | Spinner |
| Modal | Modal (Headless UI) |
| Drawer | Drawer (Headless UI) |
| Tag | Badge |
| Table | TanStack Table |

## Coexistence Strategy

During migration, both systems can coexist:

```tsx
// Mixed usage (temporary)
import { Button } from '@/components/primitives';  // New
import { Table } from 'antd';  // Old (until migrated)
```

## Success Criteria

- [ ] All forms use custom FormSection/FormField
- [ ] All buttons use custom Button component
- [ ] All modals use custom Modal component
- [ ] All selects use custom Select component
- [ ] Data tables use TanStack Table
- [ ] No Ant Design Spin/Loading usage
- [ ] Consistent styling across all modules
- [ ] Bundle size reduced by >30%
- [ ] All accessibility tests passing

## Timeline (Estimated)

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 | 1 week | Complete |
| Phase 2 | 2 weeks | Pending |
| Phase 3 | 2 weeks | Pending |
| Phase 4 | 1 week | Pending |
| Phase 5 | 1 week | Pending |
| Phase 6 | 1 week | Pending |

Total estimated time: 8 weeks for complete migration.
