/**
 * TypeScript types for Inventory Analysis API (ABC/XYZ, Turnover, Dead Stock)
 */

// =====================================
// ABC/XYZ ANALYSIS TYPES
// =====================================

export enum AbcClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum XyzClass {
  X = 'X',
  Y = 'Y',
  Z = 'Z',
}

export enum AbcXyzClass {
  AX = 'AX',
  AY = 'AY',
  AZ = 'AZ',
  BX = 'BX',
  BY = 'BY',
  BZ = 'BZ',
  CX = 'CX',
  CY = 'CY',
  CZ = 'CZ',
}

export interface AbcXyzAnalysisFilterDto {
  categoryId?: number;
  warehouseId?: number;
  brandId?: number;
  analysisPeriodDays?: number;
  includeInactiveProducts?: boolean;
  abcAThreshold?: number;
  abcBThreshold?: number;
  xyzXThreshold?: number;
  xyzYThreshold?: number;
}

export interface ProductAbcXyzDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  brandName?: string;
  totalRevenue: number;
  totalQuantitySold: number;
  averageUnitPrice: number;
  revenuePercentage: number;
  cumulativeRevenuePercentage: number;
  averageDailyDemand: number;
  demandStandardDeviation: number;
  coefficientOfVariation: number;
  daysWithDemand: number;
  totalDays: number;
  demandFrequency: number;
  abcClass: AbcClass;
  xyzClass: XyzClass;
  combinedClass: AbcXyzClass;
  currentStock: number;
  availableStock: number;
  stockValue: number;
  estimatedDaysOfStock: number;
  managementStrategy: string;
  recommendations: string[];
}

export interface AbcClassSummaryDto {
  class: AbcClass;
  productCount: number;
  productPercentage: number;
  totalRevenue: number;
  revenuePercentage: number;
  totalStockValue: number;
  stockValuePercentage: number;
  averageInventoryTurnover: number;
}

export interface XyzClassSummaryDto {
  class: XyzClass;
  productCount: number;
  productPercentage: number;
  averageCoefficientOfVariation: number;
  averageDemandFrequency: number;
  demandPattern: string;
}

export interface AbcXyzMatrixCellDto {
  combinedClass: AbcXyzClass;
  productCount: number;
  productPercentage: number;
  totalRevenue: number;
  revenuePercentage: number;
  totalStockValue: number;
  managementPriority: string;
  recommendedStrategy: string;
}

export interface StrategicRecommendationDto {
  category: string;
  priority: string;
  recommendation: string;
  impact: string;
  affectedProductIds: number[];
  estimatedSavings?: number;
}

export interface AbcXyzAnalysisSummaryDto {
  generatedAt: string;
  analysisPeriodDays: number;
  totalProductsAnalyzed: number;
  classA: AbcClassSummaryDto;
  classB: AbcClassSummaryDto;
  classC: AbcClassSummaryDto;
  classX: XyzClassSummaryDto;
  classY: XyzClassSummaryDto;
  classZ: XyzClassSummaryDto;
  matrix: AbcXyzMatrixCellDto[];
  topAProducts: ProductAbcXyzDto[];
  highRiskProducts: ProductAbcXyzDto[];
  totalRevenue: number;
  totalStockValue: number;
  averageInventoryTurnover: number;
  strategicRecommendations: StrategicRecommendationDto[];
}

// =====================================
// INVENTORY TURNOVER TYPES
// =====================================

export interface InventoryTurnoverDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  costOfGoodsSold: number;
  averageInventoryValue: number;
  inventoryTurnoverRatio: number;
  daysOfInventory: number;
  turnoverCategory: string;
  industryBenchmark: number;
  performanceVsBenchmark: number;
  currentStock: number;
  stockValue: number;
  isOverstocked: boolean;
  isUnderstocked: boolean;
  optimalStockLevel: number;
}

// =====================================
// DEAD STOCK TYPES
// =====================================

export interface DeadStockItemDto {
  productId: number;
  productCode: string;
  productName: string;
  categoryName?: string;
  currentStock: number;
  stockValue: number;
  daysSinceLastSale: number;
  daysSinceLastMovement: number;
  lastSaleDate?: string;
  lastMovementDate?: string;
  agingCategory: string;
  depreciationRate: number;
  estimatedRecoveryValue: number;
  disposalOptions: string[];
}

export interface DeadStockAnalysisDto {
  generatedAt: string;
  analysisPeriodDays: number;
  totalDeadStockItems: number;
  totalDeadStockValue: number;
  deadStockPercentage: number;
  items: DeadStockItemDto[];
  recommendations: string[];
  potentialRecoveryValue: number;
}

// =====================================
// SERVICE LEVEL TYPES
// =====================================

export interface ServiceLevelAnalysisDto {
  productId: number;
  productCode: string;
  productName: string;
  currentServiceLevel: number;
  targetServiceLevel: number;
  totalOrders: number;
  fulfilledOrders: number;
  stockoutEvents: number;
  averageStockoutDuration: number;
  estimatedLostSales: number;
  backorderCost: number;
  recommendedSafetyStock: number;
  additionalStockCost: number;
  expectedServiceLevelImprovement: number;
}

// =====================================
// INVENTORY HEALTH SCORE TYPES
// =====================================

export interface InventoryHealthScoreDto {
  generatedAt: string;
  overallScore: number;
  turnoverScore: number;
  stockoutScore: number;
  deadStockScore: number;
  accuracyScore: number;
  balanceScore: number;
  averageInventoryTurnover: number;
  stockoutRate: number;
  deadStockPercentage: number;
  overstockPercentage: number;
  serviceLevel: number;
  turnoverTrend: string;
  healthTrend: string;
  improvementAreas: string[];
  potentialSavings: number;
}
