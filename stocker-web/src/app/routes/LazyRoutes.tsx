import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// Loading component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

// Heavy feature modules - lazy load
export const ChartsModule = lazy(() => 
  import(/* webpackChunkName: "charts-module" */ '@ant-design/charts')
);

export const MonacoEditor = lazy(() => 
  import(/* webpackChunkName: "monaco-editor" */ '@monaco-editor/react')
);

// Utility function to wrap lazy components with Suspense
export const withSuspense = (Component: React.ComponentType) => {
  return (props: any) => (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
};