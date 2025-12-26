/**
 * =====================================
 * STOCKER DESIGN SYSTEM - COMPONENT OVERRIDES
 * =====================================
 *
 * Ant Design 5 Component-level token overrides.
 * These replace CSS overrides with proper AntD configuration.
 *
 * Reference: https://ant.design/docs/react/customize-theme
 */

import type { ThemeConfig } from 'antd';
import { slate, brand, semantic
 } from './colors';

type ComponentsConfig = ThemeConfig['components'];

// =====================================
// LIGHT MODE COMPONENT OVERRIDES
// =====================================

export const lightComponents: ComponentsConfig = {
  // Layout Component
  Layout: {
    headerBg: '#ffffff',
    headerColor: slate[900],
    headerHeight: 64,
    headerPadding: '0 24px',
    bodyBg: slate[50],
    siderBg: '#ffffff',
    triggerBg: slate[100],
    triggerColor: slate[600],
    footerBg: '#ffffff',
    footerPadding: '24px 50px',
  },

  // Menu Component - Dashboard Sidebar Styling
  Menu: {
    itemBg: 'transparent',
    itemColor: slate[600],
    itemHoverBg: slate[50],
    itemHoverColor: slate[700],
    itemSelectedBg: slate[100],
    itemSelectedColor: slate[900],
    itemActiveBg: slate[100],
    subMenuItemBg: 'transparent',
    itemHeight: 40,
    itemMarginBlock: 4,
    itemMarginInline: 8,
    itemBorderRadius: 6,
    iconSize: 16,
    collapsedIconSize: 18,
    groupTitleColor: slate[400],
    groupTitleFontSize: 11,
    // Horizontal menu
    horizontalItemSelectedBg: 'transparent',
    horizontalItemSelectedColor: brand.primary[600],
    horizontalItemHoverBg: 'transparent',
    horizontalItemHoverColor: brand.primary[500],
  },

  // Button Component
  Button: {
    primaryColor: '#ffffff',
    defaultBg: '#ffffff',
    defaultColor: slate[700],
    defaultBorderColor: slate[300],
    defaultHoverBg: slate[50],
    defaultHoverColor: slate[900],
    defaultHoverBorderColor: slate[400],
    defaultActiveBg: slate[100],
    defaultActiveColor: slate[900],
    defaultActiveBorderColor: slate[500],
    // Ghost button
    ghostBg: 'transparent',
    // Text button
    textHoverBg: slate[100],
    // Link button
    linkHoverBg: 'transparent',
    // Sizes
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    paddingInline: 16,
    paddingInlineLG: 20,
    paddingInlineSM: 12,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    fontWeight: 500,
  },

  // Input Component
  Input: {
    activeBg: '#ffffff',
    activeBorderColor: slate[900],
    activeShadow: `0 0 0 2px ${slate[900]}1a`,
    hoverBg: '#ffffff',
    hoverBorderColor: slate[400],
    addonBg: slate[50],
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    paddingInline: 12,
    paddingInlineLG: 16,
    paddingInlineSM: 8,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
  },

  // Select Component
  Select: {
    optionSelectedBg: slate[100],
    optionSelectedColor: slate[900],
    optionActiveBg: slate[50],
    selectorBg: '#ffffff',
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
  },

  // Table Component - CRM Enterprise Table Styling
  Table: {
    headerBg: slate[50],
    headerColor: slate[500],
    headerSortActiveBg: slate[100],
    headerSortHoverBg: slate[100],
    headerFilterHoverBg: slate[100],
    headerSplitColor: slate[200],
    rowHoverBg: slate[50],
    rowSelectedBg: brand.primary[50],
    rowSelectedHoverBg: brand.primary[100],
    rowExpandedBg: slate[50],
    borderColor: slate[200],
    cellPaddingBlock: 14,
    cellPaddingInline: 16,
    cellFontSize: 14,
    headerBorderRadius: 8,
    footerBg: slate[50],
    footerColor: slate[600],
    // Fixed column shadows
    fixedHeaderSortActiveBg: slate[100],
  },

  // Card Component
  Card: {
    colorBgContainer: '#ffffff',
    colorBorderSecondary: slate[200],
    paddingLG: 24,
    borderRadiusLG: 12,
    boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    headerFontSize: 16,
    headerFontSizeSM: 14,
    actionsBg: slate[50],
  },

  // Modal Component
  Modal: {
    headerBg: '#ffffff',
    contentBg: '#ffffff',
    footerBg: '#ffffff',
    titleColor: slate[900],
    titleFontSize: 18,
    borderRadiusLG: 12,
    paddingContentHorizontalLG: 24,
    paddingMD: 24,
  },

  // Drawer Component
  Drawer: {
    colorBgElevated: '#ffffff',
    paddingLG: 24,
    footerPaddingBlock: 16,
    footerPaddingInline: 24,
  },

  // Form Component
  Form: {
    labelColor: slate[700],
    labelFontSize: 14,
    labelHeight: 32,
    labelColonMarginInlineStart: 4,
    labelColonMarginInlineEnd: 12,
    itemMarginBottom: 20,
    verticalLabelPadding: '0 0 8px',
  },

  // Tabs Component
  Tabs: {
    itemColor: slate[500],
    itemHoverColor: slate[700],
    itemSelectedColor: brand.primary[600],
    itemActiveColor: brand.primary[700],
    inkBarColor: brand.primary[600],
    cardBg: slate[50],
    cardGutter: 4,
    cardPadding: '8px 16px',
    horizontalItemPadding: '12px 0',
    horizontalItemPaddingLG: '16px 0',
    horizontalItemPaddingSM: '8px 0',
    horizontalMargin: '0 0 16px 0',
  },

  // Tag Component
  Tag: {
    defaultBg: slate[100],
    defaultColor: slate[700],
    borderRadiusSM: 4,
  },

  // Badge Component
  Badge: {
    textFontSize: 12,
    textFontSizeSM: 10,
    statusSize: 6,
    dotSize: 6,
    textFontWeight: 500,
  },

  // Avatar Component
  Avatar: {
    containerSize: 40,
    containerSizeLG: 48,
    containerSizeSM: 32,
    textFontSize: 16,
    textFontSizeLG: 20,
    textFontSizeSM: 14,
    borderRadius: 6,
    groupOverlapping: -8,
    groupBorderColor: '#ffffff',
  },

  // Breadcrumb Component
  Breadcrumb: {
    itemColor: slate[500],
    lastItemColor: slate[900],
    linkColor: slate[500],
    linkHoverColor: slate[700],
    separatorColor: slate[400],
    separatorMargin: 8,
    iconFontSize: 14,
  },

  // Pagination Component
  Pagination: {
    itemBg: '#ffffff',
    itemActiveBg: brand.primary[600],
    itemActiveColorDisabled: slate[400],
    itemInputBg: '#ffffff',
    itemLinkBg: '#ffffff',
    itemSize: 32,
    itemSizeSM: 24,
    borderRadius: 6,
  },

  // Progress Component
  Progress: {
    defaultColor: brand.primary[500],
    remainingColor: slate[200],
    circleTextColor: slate[700],
    lineBorderRadius: 100,
  },

  // Switch Component
  Switch: {
    colorPrimary: slate[900],
    colorPrimaryHover: slate[700],
    handleBg: '#ffffff',
    handleShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    trackHeight: 22,
    trackMinWidth: 44,
    trackPadding: 2,
    innerMinMargin: 9,
    innerMaxMargin: 24,
  },

  // Checkbox Component
  Checkbox: {
    colorPrimary: brand.primary[600],
    colorPrimaryHover: brand.primary[700],
    borderRadiusSM: 4,
    controlInteractiveSize: 18,
  },

  // Radio Component
  Radio: {
    colorPrimary: brand.primary[600],
    colorPrimaryHover: brand.primary[700],
    dotSize: 10,
    radioSize: 18,
    buttonSolidCheckedBg: brand.primary[600],
    buttonSolidCheckedColor: '#ffffff',
    buttonSolidCheckedHoverBg: brand.primary[700],
  },

  // DatePicker Component
  DatePicker: {
    cellWidth: 32,
    cellHeight: 28,
    cellActiveWithRangeBg: brand.primary[50],
    cellHoverBg: slate[100],
    cellBgDisabled: slate[50],
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    borderRadius: 6,
  },

  // Tooltip Component
  Tooltip: {
    colorBgSpotlight: slate[800],
    colorTextLightSolid: '#ffffff',
    borderRadius: 6,
    controlHeight: 32,
  },

  // Popover Component
  Popover: {
    titleMinWidth: 200,
    borderRadiusLG: 8,
  },

  // Dropdown Component
  Dropdown: {
    controlItemBgHover: slate[50],
    controlItemBgActive: slate[100],
    borderRadiusLG: 8,
    paddingBlock: 5,
  },

  // Message Component
  Message: {
    contentBg: '#ffffff',
    borderRadiusLG: 8,
  },

  // Notification Component
  Notification: {
    width: 384,
    borderRadiusLG: 12,
  },

  // Alert Component
  Alert: {
    borderRadiusLG: 8,
    withDescriptionIconSize: 24,
    withDescriptionPadding: '16px 24px',
  },

  // Spin Component
  Spin: {
    dotSize: 20,
    dotSizeLG: 32,
    dotSizeSM: 14,
  },

  // Skeleton Component
  Skeleton: {
    gradientFromColor: slate[200],
    gradientToColor: slate[100],
    blockRadius: 6,
    titleHeight: 20,
    paragraphLiHeight: 16,
    paragraphMarginTop: 24,
  },

  // Divider Component
  Divider: {
    colorSplit: slate[200],
    textPaddingInline: 16,
    orientationMargin: 0.05,
  },

  // Steps Component
  Steps: {
    iconSize: 32,
    iconSizeSM: 24,
    titleLineHeight: 1.5,
    descriptionMaxWidth: 200,
    customIconSize: 32,
    customIconTop: 0,
    dotSize: 8,
    dotCurrentSize: 10,
    navArrowColor: slate[300],
  },

  // Timeline Component
  Timeline: {
    dotBg: '#ffffff',
    dotBorderWidth: 2,
    itemPaddingBottom: 20,
    tailColor: slate[200],
    tailWidth: 2,
  },

  // Tree Component
  Tree: {
    nodeHoverBg: slate[50],
    nodeSelectedBg: brand.primary[50],
    titleHeight: 28,
    directoryNodeSelectedBg: brand.primary[100],
    directoryNodeSelectedColor: brand.primary[700],
  },

  // Collapse Component
  Collapse: {
    headerBg: slate[50],
    headerPadding: '12px 16px',
    contentBg: '#ffffff',
    contentPadding: '16px 16px',
    borderRadiusLG: 8,
  },

  // Upload Component
  Upload: {
    actionsColor: slate[500],
  },

  // List Component
  List: {
    itemPadding: '12px 0',
    itemPaddingLG: '16px 24px',
    itemPaddingSM: '8px 16px',
    headerBg: 'transparent',
    footerBg: 'transparent',
    metaMarginBottom: 16,
    avatarMarginRight: 16,
    titleMarginBottom: 12,
    descriptionFontSize: 14,
  },

  // Descriptions Component
  Descriptions: {
    labelBg: slate[50],
    titleMarginBottom: 16,
    itemPaddingBottom: 16,
    extraColor: slate[500],
    borderRadiusLG: 8,
  },

  // Empty Component
  Empty: {
    colorText: slate[500],
    colorTextDisabled: slate[400],
  },

  // Result Component
  Result: {
    titleFontSize: 24,
    subtitleFontSize: 14,
    iconFontSize: 72,
    extraMargin: '24px 0 0 0',
  },

  // Statistic Component
  Statistic: {
    titleFontSize: 14,
    contentFontSize: 24,
  },

  // Segmented Component
  Segmented: {
    itemColor: slate[600],
    itemHoverColor: slate[900],
    itemHoverBg: slate[100],
    itemSelectedBg: '#ffffff',
    itemSelectedColor: slate[900],
    itemActiveBg: slate[50],
    trackBg: slate[100],
    trackPadding: 2,
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,
  },

  // Rate Component
  Rate: {
    starSize: 20,
    starColor: '#fadb14',
    starBg: slate[200],
  },

  // Slider Component
  Slider: {
    railBg: slate[200],
    railHoverBg: slate[300],
    trackBg: brand.primary[500],
    trackHoverBg: brand.primary[600],
    handleColor: brand.primary[500],
    handleActiveColor: brand.primary[600],
    dotBorderColor: slate[300],
    dotActiveBorderColor: brand.primary[500],
    handleSize: 14,
    handleSizeHover: 16,
    railSize: 4,
  },

  // Transfer Component
  Transfer: {
    listWidth: 200,
    listHeight: 300,
    itemHeight: 36,
    itemPaddingBlock: 5,
    headerHeight: 48,
  },

  // ColorPicker Component
  ColorPicker: {
    controlHeight: 36,
    borderRadiusSM: 4,
  },

  // FloatButton Component
  FloatButton: {
    borderRadiusLG: 16,
    colorBgElevated: '#ffffff',
  },

  // Tour Component
  Tour: {
    borderRadiusLG: 12,
    primaryPrevBtnBg: 'transparent',
    zIndexPopup: 1070,
  },

  // QRCode Component
  QRCode: {
    borderRadiusLG: 8,
  },

  // App Component
  App: {
    // No specific overrides needed
  },
};

// =====================================
// DARK MODE COMPONENT OVERRIDES
// =====================================

export const darkComponents: ComponentsConfig = {
  // Layout Component
  Layout: {
    headerBg: '#141414',
    headerColor: slate[100],
    headerHeight: 64,
    headerPadding: '0 24px',
    bodyBg: '#0a0a0a',
    siderBg: '#141414',
    triggerBg: slate[800],
    triggerColor: slate[300],
    footerBg: '#141414',
    footerPadding: '24px 50px',
  },

  // Menu Component
  Menu: {
    itemBg: 'transparent',
    itemColor: slate[400],
    itemHoverBg: 'rgba(255, 255, 255, 0.04)',
    itemHoverColor: slate[200],
    itemSelectedBg: 'rgba(255, 255, 255, 0.08)',
    itemSelectedColor: slate[50],
    itemActiveBg: 'rgba(255, 255, 255, 0.08)',
    subMenuItemBg: 'transparent',
    itemHeight: 40,
    itemMarginBlock: 4,
    itemMarginInline: 8,
    itemBorderRadius: 6,
    iconSize: 16,
    collapsedIconSize: 18,
    groupTitleColor: slate[500],
    groupTitleFontSize: 11,
    // Horizontal menu
    horizontalItemSelectedBg: 'transparent',
    horizontalItemSelectedColor: brand.primary[400],
    horizontalItemHoverBg: 'transparent',
    horizontalItemHoverColor: brand.primary[300],
  },

  // Button Component
  Button: {
    primaryColor: '#ffffff',
    defaultBg: '#1f1f1f',
    defaultColor: slate[200],
    defaultBorderColor: slate[700],
    defaultHoverBg: slate[800],
    defaultHoverColor: slate[100],
    defaultHoverBorderColor: slate[600],
    defaultActiveBg: slate[700],
    defaultActiveColor: slate[50],
    defaultActiveBorderColor: slate[500],
    // Ghost button
    ghostBg: 'transparent',
    // Text button
    textHoverBg: 'rgba(255, 255, 255, 0.08)',
    // Link button
    linkHoverBg: 'transparent',
    // Sizes
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    paddingInline: 16,
    paddingInlineLG: 20,
    paddingInlineSM: 12,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    fontWeight: 500,
  },

  // Input Component
  Input: {
    activeBg: '#1f1f1f',
    activeBorderColor: brand.primary[400],
    activeShadow: `0 0 0 2px ${brand.primary[500]}26`,
    hoverBg: '#1f1f1f',
    hoverBorderColor: slate[600],
    addonBg: '#262626',
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    paddingInline: 12,
    paddingInlineLG: 16,
    paddingInlineSM: 8,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
  },

  // Select Component
  Select: {
    optionSelectedBg: 'rgba(255, 255, 255, 0.08)',
    optionSelectedColor: slate[100],
    optionActiveBg: 'rgba(255, 255, 255, 0.04)',
    selectorBg: '#1f1f1f',
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
  },

  // Table Component
  Table: {
    headerBg: '#1f1f1f',
    headerColor: slate[400],
    headerSortActiveBg: '#262626',
    headerSortHoverBg: '#262626',
    headerFilterHoverBg: '#262626',
    headerSplitColor: slate[700],
    rowHoverBg: 'rgba(255, 255, 255, 0.04)',
    rowSelectedBg: 'rgba(99, 102, 241, 0.15)',
    rowSelectedHoverBg: 'rgba(99, 102, 241, 0.25)',
    rowExpandedBg: '#1f1f1f',
    borderColor: slate[700],
    cellPaddingBlock: 14,
    cellPaddingInline: 16,
    cellFontSize: 14,
    headerBorderRadius: 8,
    footerBg: '#1f1f1f',
    footerColor: slate[400],
    // Fixed column shadows
    fixedHeaderSortActiveBg: '#262626',
  },

  // Card Component
  Card: {
    colorBgContainer: '#141414',
    colorBorderSecondary: slate[700],
    paddingLG: 24,
    borderRadiusLG: 12,
    boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    headerFontSize: 16,
    headerFontSizeSM: 14,
    actionsBg: '#1f1f1f',
  },

  // Modal Component
  Modal: {
    headerBg: '#141414',
    contentBg: '#141414',
    footerBg: '#141414',
    titleColor: slate[100],
    titleFontSize: 18,
    borderRadiusLG: 12,
    paddingContentHorizontalLG: 24,
    paddingMD: 24,
  },

  // Drawer Component
  Drawer: {
    colorBgElevated: '#141414',
    paddingLG: 24,
    footerPaddingBlock: 16,
    footerPaddingInline: 24,
  },

  // Form Component
  Form: {
    labelColor: slate[300],
    labelFontSize: 14,
    labelHeight: 32,
    labelColonMarginInlineStart: 4,
    labelColonMarginInlineEnd: 12,
    itemMarginBottom: 20,
    verticalLabelPadding: '0 0 8px',
  },

  // Tabs Component
  Tabs: {
    itemColor: slate[400],
    itemHoverColor: slate[200],
    itemSelectedColor: brand.primary[400],
    itemActiveColor: brand.primary[300],
    inkBarColor: brand.primary[400],
    cardBg: '#1f1f1f',
    cardGutter: 4,
    cardPadding: '8px 16px',
    horizontalItemPadding: '12px 0',
    horizontalItemPaddingLG: '16px 0',
    horizontalItemPaddingSM: '8px 0',
    horizontalMargin: '0 0 16px 0',
  },

  // Tag Component
  Tag: {
    defaultBg: '#262626',
    defaultColor: slate[200],
    borderRadiusSM: 4,
  },

  // Badge Component
  Badge: {
    textFontSize: 12,
    textFontSizeSM: 10,
    statusSize: 6,
    dotSize: 6,
    textFontWeight: 500,
  },

  // Switch Component
  Switch: {
    colorPrimary: brand.primary[500],
    colorPrimaryHover: brand.primary[400],
    handleBg: '#ffffff',
    handleShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    trackHeight: 22,
    trackMinWidth: 44,
    trackPadding: 2,
    innerMinMargin: 9,
    innerMaxMargin: 24,
  },

  // Checkbox Component
  Checkbox: {
    colorPrimary: brand.primary[500],
    colorPrimaryHover: brand.primary[400],
    borderRadiusSM: 4,
    controlInteractiveSize: 18,
  },

  // Radio Component
  Radio: {
    colorPrimary: brand.primary[500],
    colorPrimaryHover: brand.primary[400],
    dotSize: 10,
    radioSize: 18,
    buttonSolidCheckedBg: brand.primary[500],
    buttonSolidCheckedColor: '#ffffff',
    buttonSolidCheckedHoverBg: brand.primary[400],
  },

  // Tooltip Component
  Tooltip: {
    colorBgSpotlight: slate[700],
    colorTextLightSolid: '#ffffff',
    borderRadius: 6,
    controlHeight: 32,
  },

  // Dropdown Component
  Dropdown: {
    controlItemBgHover: 'rgba(255, 255, 255, 0.04)',
    controlItemBgActive: 'rgba(255, 255, 255, 0.08)',
    borderRadiusLG: 8,
    paddingBlock: 5,
  },

  // Progress Component
  Progress: {
    defaultColor: brand.primary[400],
    remainingColor: slate[700],
    circleTextColor: slate[200],
    lineBorderRadius: 100,
  },

  // Segmented Component
  Segmented: {
    itemColor: slate[400],
    itemHoverColor: slate[100],
    itemHoverBg: 'rgba(255, 255, 255, 0.08)',
    itemSelectedBg: '#262626',
    itemSelectedColor: slate[100],
    itemActiveBg: 'rgba(255, 255, 255, 0.04)',
    trackBg: '#1f1f1f',
    trackPadding: 2,
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,
  },

  // Skeleton Component
  Skeleton: {
    gradientFromColor: '#262626',
    gradientToColor: '#1f1f1f',
    blockRadius: 6,
    titleHeight: 20,
    paragraphLiHeight: 16,
    paragraphMarginTop: 24,
  },

  // Divider Component
  Divider: {
    colorSplit: slate[700],
    textPaddingInline: 16,
    orientationMargin: 0.05,
  },

  // Collapse Component
  Collapse: {
    headerBg: '#1f1f1f',
    headerPadding: '12px 16px',
    contentBg: '#141414',
    contentPadding: '16px 16px',
    borderRadiusLG: 8,
  },

  // Message Component
  Message: {
    contentBg: '#262626',
    borderRadiusLG: 8,
  },

  // Notification Component
  Notification: {
    width: 384,
    borderRadiusLG: 12,
  },

  // Alert Component
  Alert: {
    borderRadiusLG: 8,
    withDescriptionIconSize: 24,
    withDescriptionPadding: '16px 24px',
  },

  // Empty Component
  Empty: {
    colorText: slate[400],
    colorTextDisabled: slate[500],
  },

  // FloatButton Component
  FloatButton: {
    borderRadiusLG: 16,
    colorBgElevated: '#262626',
  },

  // Rate Component
  Rate: {
    starSize: 20,
    starColor: '#fadb14',
    starBg: slate[700],
  },

  // Slider Component
  Slider: {
    railBg: slate[700],
    railHoverBg: slate[600],
    trackBg: brand.primary[400],
    trackHoverBg: brand.primary[300],
    handleColor: brand.primary[400],
    handleActiveColor: brand.primary[300],
    dotBorderColor: slate[600],
    dotActiveBorderColor: brand.primary[400],
    handleSize: 14,
    handleSizeHover: 16,
    railSize: 4,
  },
};

export default {
  light: lightComponents,
  dark: darkComponents,
};
