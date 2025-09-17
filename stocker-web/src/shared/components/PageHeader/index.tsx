import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageHeader as AntPageHeader } from '@ant-design/pro-components';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBack?: boolean;
  onBack?: () => void;
  extra?: React.ReactNode;
  actions?: React.ReactNode;
  ghost?: boolean;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  showBack = false,
  onBack,
  extra,
  actions,
  ghost = true,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const breadcrumbItems = breadcrumbs?.map((item, index) => ({
    title: item.path && index < (breadcrumbs?.length || 0) - 1 ? (
      <a onClick={() => navigate(item.path!)}>{item.title}</a>
    ) : (
      item.title
    ),
  }));

  return (
    <div className="page-header-wrapper">
      <AntPageHeader
        ghost={ghost}
        title={title}
        subTitle={subtitle}
        onBack={showBack ? handleBack : undefined}
        backIcon={showBack ? <ArrowLeftOutlined /> : false}
        breadcrumb={breadcrumbItems ? { items: breadcrumbItems } : undefined}
        extra={actions || extra}
      >
        {children}
      </AntPageHeader>
    </div>
  );
};

export default PageHeader;