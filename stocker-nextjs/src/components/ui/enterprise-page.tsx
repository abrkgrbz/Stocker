'use client';

/**
 * =====================================
 * ENTERPRISE PAGE - COMPATIBILITY LAYER
 * =====================================
 *
 * This file re-exports components from the new patterns
 * for backward compatibility with existing pages.
 *
 * @deprecated Import from '@/components/patterns' instead
 *
 * Migration:
 * ```tsx
 * // OLD
 * import { PageContainer, ListPageHeader } from '@/components/ui/enterprise-page';
 *
 * // NEW
 * import { PageContainer, ListPageHeader } from '@/components/patterns';
 * ```
 */

// Re-export from patterns/layouts
export {
  PageContainer,
  PageHeader,
  ListPageHeader,
  StickyActionBar,
  Section,
  PageLoading as LoadingState,
  EmptyState,
  MODULE_COLORS,
  getModuleColor,
  type PageContainerProps,
  type PageHeaderProps,
  type ListPageHeaderProps,
  type StickyActionBarProps,
  type SectionProps,
  type PageLoadingProps,
  type EmptyStateProps,
} from '@/components/patterns/layouts';

// Re-export from patterns/lists
export {
  ListContainer,
  ListItem,
  CollapsibleSection,
  DataTableWrapper,
  type ListContainerProps,
  type ListItemProps,
  type CollapsibleSectionProps,
  type DataTableWrapperProps,
} from '@/components/patterns/lists';

// Re-export from primitives/display
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatCard,
  Badge,
  type CardProps,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
  type StatCardProps,
  type BadgeProps,
} from '@/components/primitives/display';

// Re-export Button from primitives
export {
  Button,
  type ButtonProps,
} from '@/components/primitives/buttons';
