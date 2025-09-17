import React, { useEffect, useState } from 'react';

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Modal, Table, Tag } from 'antd';

import { defaultKeyboardShortcuts } from '@/hooks/useKeyboardNavigation';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'Accessibility';
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    keys: ['Alt', '1'],
    description: 'Skip to main content',
    category: 'Navigation'
  },
  {
    keys: ['/'],
    description: 'Focus search bar',
    category: 'Navigation'
  },
  {
    keys: ['Alt', 'N'],
    description: 'Go to next page',
    category: 'Navigation'
  },
  {
    keys: ['Alt', 'P'],
    description: 'Go to previous page',
    category: 'Navigation'
  },
  {
    keys: ['Tab'],
    description: 'Navigate forward through focusable elements',
    category: 'Navigation'
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navigate backward through focusable elements',
    category: 'Navigation'
  },
  
  // Actions
  {
    keys: ['Enter'],
    description: 'Activate button or link',
    category: 'Actions'
  },
  {
    keys: ['Space'],
    description: 'Check/uncheck checkbox, activate button',
    category: 'Actions'
  },
  {
    keys: ['Escape'],
    description: 'Close modal, dropdown, or cancel action',
    category: 'Actions'
  },
  {
    keys: ['Ctrl', 'S'],
    description: 'Save current form or data',
    category: 'Actions'
  },
  {
    keys: ['Ctrl', 'Z'],
    description: 'Undo last action',
    category: 'Actions'
  },
  {
    keys: ['Ctrl', 'Y'],
    description: 'Redo last action',
    category: 'Actions'
  },
  
  // Accessibility
  {
    keys: ['?'],
    description: 'Show this help dialog',
    category: 'Accessibility'
  },
  {
    keys: ['Arrow Keys'],
    description: 'Navigate within menus and lists',
    category: 'Accessibility'
  },
  {
    keys: ['Home'],
    description: 'Go to first item in list',
    category: 'Accessibility'
  },
  {
    keys: ['End'],
    description: 'Go to last item in list',
    category: 'Accessibility'
  }
];

export const KeyboardShortcutsModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleToggle = () => setVisible(prev => !prev);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    document.addEventListener('toggle-help-modal', handleToggle);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('toggle-help-modal', handleToggle);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const columns = [
    {
      title: 'Shortcut',
      dataIndex: 'keys',
      key: 'keys',
      width: '30%',
      render: (keys: string[]) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {keys.map((key, index) => (
            <React.Fragment key={index}>
              <Tag
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px'
                }}
              >
                {key}
              </Tag>
              {index < keys.length - 1 && <span style={{ alignSelf: 'center' }}>+</span>}
            </React.Fragment>
          ))}
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      render: (category: string) => {
        const colors = {
          'Navigation': 'blue',
          'Actions': 'green',
          'Accessibility': 'purple'
        };
        return <Tag color={colors[category as keyof typeof colors]}>{category}</Tag>;
      }
    }
  ];

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QuestionCircleOutlined />
            <span>Keyboard Shortcuts</span>
          </div>
        }
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={700}
        className="keyboard-shortcuts-modal"
      >
        <div style={{ marginBottom: '16px' }}>
          <p>
            Use these keyboard shortcuts to navigate and interact with the application more efficiently.
            Press <Tag style={{ fontFamily: 'monospace' }}>?</Tag> at any time to show this help.
          </p>
        </div>
        
        <Table
          dataSource={shortcuts}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record.keys.join('+')}
        />
        
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h4 style={{ marginBottom: '8px' }}>Accessibility Features</h4>
          <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
            <li>All interactive elements are keyboard accessible</li>
            <li>Focus indicators show which element is currently selected</li>
            <li>Screen reader support with ARIA labels and announcements</li>
            <li>Skip links allow quick navigation to main content</li>
            <li>High contrast mode support for better visibility</li>
          </ul>
        </div>
      </Modal>

      {/* Floating help button for easy access */}
      <button
        onClick={() => setVisible(true)}
        aria-label="Show keyboard shortcuts"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#1890ff',
          color: 'white',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setVisible(true);
          }
        }}
      >
        ?
      </button>
    </>
  );
};

export default KeyboardShortcutsModal;