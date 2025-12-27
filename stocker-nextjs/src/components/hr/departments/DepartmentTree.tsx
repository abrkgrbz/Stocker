'use client';

import React from 'react';
import { Tree, Tag, Empty, Spin } from 'antd';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  FolderIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';
import type { DepartmentDto } from '@/lib/api/services/hr.types';
import type { DataNode } from 'antd/es/tree';

interface DepartmentTreeProps {
  departments: DepartmentDto[];
  loading?: boolean;
  onSelect?: (department: DepartmentDto) => void;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
}

// Build tree structure from flat department list
function buildDepartmentTree(departments: DepartmentDto[]): DepartmentDto[] {
  const departmentMap = new Map<number, DepartmentDto>();
  const rootDepartments: DepartmentDto[] = [];

  // First pass: create a map of all departments
  departments.forEach((dept) => {
    departmentMap.set(dept.id, { ...dept, subDepartments: [] });
  });

  // Second pass: build the tree structure
  departments.forEach((dept) => {
    const deptWithSubs = departmentMap.get(dept.id)!;
    if (dept.parentDepartmentId && departmentMap.has(dept.parentDepartmentId)) {
      const parent = departmentMap.get(dept.parentDepartmentId)!;
      parent.subDepartments = parent.subDepartments || [];
      parent.subDepartments.push(deptWithSubs);
    } else {
      rootDepartments.push(deptWithSubs);
    }
  });

  return rootDepartments;
}

// Convert department to tree node
function departmentToTreeNode(dept: DepartmentDto): DataNode {
  const hasChildren = dept.subDepartments && dept.subDepartments.length > 0;

  return {
    key: dept.id.toString(),
    title: (
      <div className="flex items-center gap-3 py-2 pr-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: dept.isActive ? '#7c3aed15' : '#64748b15' }}
          >
            <BuildingOfficeIcon className="w-4 h-4" style={{ color: dept.isActive ? '#7c3aed' : '#64748b' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 truncate">{dept.name}</span>
              {dept.code && (
                <span className="text-xs text-slate-400 font-mono">({dept.code})</span>
              )}
              {!dept.isActive && (
                <Tag color="default" className="text-xs">Pasif</Tag>
              )}
            </div>
            {dept.description && (
              <div className="text-xs text-slate-500 truncate max-w-md">{dept.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {dept.managerName && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <UserIcon className="w-3 h-3 text-slate-400" />
              <span>{dept.managerName}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <UserGroupIcon className="w-3 h-3 text-blue-500" />
            <span className="font-medium text-blue-600">{dept.employeeCount || 0}</span>
          </div>
        </div>
      </div>
    ),
    children: hasChildren
      ? dept.subDepartments!.map(departmentToTreeNode)
      : undefined,
    isLeaf: !hasChildren,
  };
}

export function DepartmentTree({
  departments,
  loading,
  onSelect,
  onView,
}: DepartmentTreeProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (!departments.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Henüz departman bulunmuyor"
      />
    );
  }

  // Build tree structure
  const treeData = buildDepartmentTree(departments);
  const treeNodes = treeData.map(departmentToTreeNode);

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0 && onView) {
      const id = parseInt(selectedKeys[0].toString(), 10);
      onView(id);
    }
    if (selectedKeys.length > 0 && onSelect) {
      const id = parseInt(selectedKeys[0].toString(), 10);
      const dept = departments.find((d) => d.id === id);
      if (dept) {
        onSelect(dept);
      }
    }
  };

  return (
    <div className="department-tree">
      <Tree
        treeData={treeNodes}
        defaultExpandAll
        showLine={{ showLeafIcon: false }}
        showIcon
        switcherIcon={(props: any) => {
          if (props.isLeaf) return null;
          return props.expanded ? (
            <FolderOpenIcon className="w-4 h-4 text-slate-400" />
          ) : (
            <FolderIcon className="w-4 h-4 text-slate-400" />
          );
        }}
        onSelect={handleSelect}
        className="bg-white rounded-lg"
        blockNode
      />
      <style jsx global>{`
        .department-tree .ant-tree {
          background: transparent;
          padding: 8px;
        }
        .department-tree .ant-tree-node-content-wrapper {
          display: flex;
          align-items: center;
          padding: 0 !important;
          min-height: auto;
        }
        .department-tree .ant-tree-node-content-wrapper:hover {
          background-color: #f1f5f9;
          border-radius: 8px;
        }
        .department-tree .ant-tree-node-selected .ant-tree-node-content-wrapper {
          background-color: #ede9fe !important;
          border-radius: 8px;
        }
        .department-tree .ant-tree-treenode {
          padding: 2px 0;
          width: 100%;
        }
        .department-tree .ant-tree-switcher {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 40px;
        }
        .department-tree .ant-tree-indent-unit {
          width: 24px;
        }
        .department-tree .ant-tree-title {
          flex: 1;
        }
        .department-tree .ant-tree-show-line .ant-tree-indent-unit::before {
          border-color: #e2e8f0;
        }
        .department-tree .ant-tree-show-line .ant-tree-switcher-line-icon {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
