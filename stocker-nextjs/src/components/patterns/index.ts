/**
 * =====================================
 * STOCKER PATTERNS - MAIN INDEX
 * =====================================
 *
 * Enterprise-grade pattern components combining
 * primitives into higher-level structures.
 *
 * Usage:
 * ```tsx
 * import { FormSection, FormField, PageContainer, ListPageHeader } from '@/components/patterns';
 * ```
 */

// Form patterns
export * from './forms';

// Layout patterns
export * from './layouts';

// List patterns
export * from './lists';

// Re-export commonly used primitives for convenience
export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  StatCard,
  Badge,
  StatusBadge,
} from '@/components/primitives/display';
