import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';

interface TranslatedTextProps {
  i18nKey: string;
  namespace?: string;
  values?: Record<string, any>;
  fallback?: string;
  showTooltip?: boolean;
  tooltipKey?: string;
  component?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  namespace,
  values,
  fallback,
  showTooltip,
  tooltipKey,
  component: Component = 'span',
  className,
  style,
}) => {
  const { t, ready } = useTranslation(namespace);

  if (!ready) {
    return <Component className={className} style={style}>...</Component>;
  }

  const text = t(i18nKey, values) || fallback || i18nKey;
  const tooltipText = tooltipKey ? t(tooltipKey) : undefined;

  const content = (
    <Component className={className} style={style}>
      {text}
    </Component>
  );

  if (showTooltip && tooltipText) {
    return <Tooltip title={tooltipText}>{content}</Tooltip>;
  }

  return content;
};

export default TranslatedText;