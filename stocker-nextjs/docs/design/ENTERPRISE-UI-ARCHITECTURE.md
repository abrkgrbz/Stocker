# Enterprise UI Architecture

## Overview

This document outlines the enterprise-grade UI component architecture for Stocker, designed to replace Ant Design with a custom component library following Linear/Raycast/Vercel design patterns.

## Design Principles

### 1. Clean Corporate Aesthetic
- **Color Palette**: Slate-based neutrals with accent colors
- **Typography**: Inter/Geist Sans for clean, professional look
- **Spacing**: Consistent 4px/8px grid system
- **Shadows**: Subtle, refined shadows for depth

### 2. Accessibility First
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus indicators

### 3. Performance
- Zero-runtime CSS (Tailwind)
- Optimized bundle size
- Lazy loading for modals/drawers

## Component Architecture

### Three-Layer System

```
+-----------------------------------------------------+
|                    FEATURES                          |
|   (Complete UI flows: CustomerForm, InvoiceForm)    |
+-----------------------------------------------------+
|                    PATTERNS                          |
|   (FormSection, DataTable, PageLayout, Card)        |
+-----------------------------------------------------+
|                   PRIMITIVES                         |
|   (Button, Input, Select, Modal, Badge, Spinner)    |
+-----------------------------------------------------+
```

### Primitives (src/components/primitives/)

Base-level components with no business logic:

| Component | Location | Description |
|-----------|----------|-------------|
| Input | inputs/Input.tsx | Text input with variants |
| Textarea | inputs/Textarea.tsx | Multi-line input |
| Select | inputs/Select.tsx | Dropdown with Headless UI |
| MultiSelect | inputs/Select.tsx | Multi-value select |
| Button | buttons/Button.tsx | Action button |
| Spinner | feedback/Spinner.tsx | Loading indicator |
| LoadingScreen | feedback/Spinner.tsx | Full-screen loader |
| Badge | display/Badge.tsx | Status labels |
| StatusBadge | display/Badge.tsx | Pre-configured status |
| Modal | overlay/Modal.tsx | Dialog component |
| ConfirmModal | overlay/Modal.tsx | Confirmation dialog |
| Drawer | overlay/Drawer.tsx | Slide-out panel |

### Patterns (src/components/patterns/)

Composable patterns combining primitives:

| Component | Location | Description |
|-----------|----------|-------------|
| FormSection | forms/FormSection.tsx | Section grouping |
| FormField | forms/FormSection.tsx | Field wrapper |
| FormActions | forms/FormSection.tsx | Submit/Cancel |

## Styling Conventions

### Input Styling (Reference: CustomerForm)

```tsx
// Standard input styling
className="bg-slate-50 border border-slate-300 rounded-md
           hover:border-slate-400
           focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
           placeholder:text-slate-400"
```

### Button Variants

| Variant | Use Case | Styling |
|---------|----------|---------|
| primary | Main actions | bg-slate-900 text-white |
| secondary | Secondary actions | bg-white border-slate-300 |
| ghost | Tertiary actions | bg-transparent |
| danger | Destructive actions | bg-red-600 |
| link | Inline actions | underline |

### Form Section Pattern

```tsx
<FormSection title="TEMEL BILGILER">
  <FormField label="Firma Adi" span={6} required>
    <Input placeholder="Firma adini giriniz" />
  </FormField>
  <FormField label="Vergi No" span={6}>
    <Input placeholder="Vergi numarasi" />
  </FormField>
</FormSection>
```

## Import Paths

```tsx
// Primitives
import { Button, Input, Select, Modal } from '@/components/primitives';

// Patterns
import { FormSection, FormField, FormActions } from '@/components/patterns';

// Utility
import { cn } from '@/lib/cn';
```

## Dependencies

| Package | Purpose |
|---------|---------|
| @headlessui/react | Accessible UI primitives |
| @heroicons/react | Icon system |
| clsx | Conditional classes |
| tailwind-merge | Class conflict resolution |

## File Structure

```
src/
├── components/
│   ├── primitives/           # Base components
│   │   ├── inputs/
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Select.tsx
│   │   │   └── index.ts
│   │   ├── buttons/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── feedback/
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   ├── display/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   ├── overlay/
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── patterns/             # Pattern components
│   │   ├── forms/
│   │   │   ├── FormSection.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── ...
├── lib/
│   └── cn.ts                 # Class name utility
└── theme/                    # Design tokens
    ├── colors.ts
    ├── tokens.ts
    └── index.ts
```
