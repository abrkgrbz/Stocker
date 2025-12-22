/**
 * Electron Preload Script - API Bridge
 *
 * This module exposes a secure IPC bridge to the renderer process,
 * replacing the HTTP-based API calls with Electron IPC.
 */

import { contextBridge, ipcRenderer } from 'electron';

// ============================================
// IPC Channel Definitions
// ============================================

// Inventory Module Channels
const INVENTORY_CHANNELS = [
  'inventory:products:list',
  'inventory:products:get',
  'inventory:products:create',
  'inventory:products:update',
  'inventory:products:delete',
  'inventory:products:search',
  'inventory:categories:list',
  'inventory:categories:get',
  'inventory:categories:create',
  'inventory:categories:update',
  'inventory:categories:delete',
  'inventory:brands:list',
  'inventory:brands:get',
  'inventory:brands:create',
  'inventory:brands:update',
  'inventory:brands:delete',
  'inventory:warehouses:list',
  'inventory:warehouses:get',
  'inventory:warehouses:create',
  'inventory:warehouses:update',
  'inventory:warehouses:delete',
  'inventory:stock:list',
  'inventory:stock:get',
  'inventory:stock:adjust',
  'inventory:stock:transfer',
  'inventory:stock:reserve',
  'inventory:stock:release',
  'inventory:movements:list',
  'inventory:movements:get',
  'inventory:movements:create',
  'inventory:counts:list',
  'inventory:counts:get',
  'inventory:counts:create',
  'inventory:counts:update',
  'inventory:counts:complete',
] as const;

// Sales Module Channels
const SALES_CHANNELS = [
  'sales:orders:list',
  'sales:orders:get',
  'sales:orders:create',
  'sales:orders:update',
  'sales:orders:delete',
  'sales:orders:approve',
  'sales:orders:confirm',
  'sales:orders:ship',
  'sales:orders:deliver',
  'sales:orders:complete',
  'sales:orders:cancel',
  'sales:orders:addItem',
  'sales:orders:removeItem',
  'sales:orders:updateItem',
  'sales:invoices:list',
  'sales:invoices:get',
  'sales:invoices:create',
  'sales:invoices:update',
  'sales:invoices:issue',
  'sales:invoices:send',
  'sales:invoices:cancel',
  'sales:invoices:addItem',
  'sales:invoices:removeItem',
  'sales:payments:list',
  'sales:payments:get',
  'sales:payments:create',
  'sales:payments:refund',
  'sales:quotations:list',
  'sales:quotations:get',
  'sales:quotations:create',
  'sales:quotations:update',
  'sales:quotations:send',
  'sales:quotations:convert',
] as const;

// CRM Module Channels
const CRM_CHANNELS = [
  'crm:customers:list',
  'crm:customers:get',
  'crm:customers:create',
  'crm:customers:update',
  'crm:customers:delete',
  'crm:customers:activate',
  'crm:customers:deactivate',
  'crm:contacts:list',
  'crm:contacts:get',
  'crm:contacts:create',
  'crm:contacts:update',
  'crm:contacts:delete',
  'crm:leads:list',
  'crm:leads:get',
  'crm:leads:create',
  'crm:leads:update',
  'crm:leads:delete',
  'crm:leads:convert',
  'crm:deals:list',
  'crm:deals:get',
  'crm:deals:create',
  'crm:deals:update',
  'crm:deals:delete',
  'crm:deals:updateStage',
  'crm:deals:won',
  'crm:deals:lost',
  'crm:pipelines:list',
  'crm:pipelines:get',
  'crm:pipelines:create',
  'crm:pipelines:update',
  'crm:activities:list',
  'crm:activities:get',
  'crm:activities:create',
  'crm:activities:update',
  'crm:activities:complete',
  'crm:segments:list',
  'crm:segments:get',
  'crm:segments:create',
  'crm:segments:update',
  'crm:campaigns:list',
  'crm:campaigns:get',
  'crm:campaigns:create',
  'crm:campaigns:update',
] as const;

// HR Module Channels
const HR_CHANNELS = [
  'hr:employees:list',
  'hr:employees:get',
  'hr:employees:create',
  'hr:employees:update',
  'hr:employees:delete',
  'hr:departments:list',
  'hr:departments:get',
  'hr:departments:create',
  'hr:departments:update',
  'hr:positions:list',
  'hr:positions:get',
  'hr:positions:create',
  'hr:positions:update',
  'hr:leaves:list',
  'hr:leaves:get',
  'hr:leaves:create',
  'hr:leaves:approve',
  'hr:leaves:reject',
  'hr:attendance:list',
  'hr:attendance:get',
  'hr:attendance:checkIn',
  'hr:attendance:checkOut',
] as const;

// System Channels
const SYSTEM_CHANNELS = [
  'system:settings:get',
  'system:settings:update',
  'system:company:get',
  'system:company:update',
  'system:backup:create',
  'system:backup:restore',
  'system:backup:list',
  'system:export:csv',
  'system:export:excel',
  'system:import:csv',
  'system:print:preview',
  'system:print:execute',
] as const;

// Auth Channels
const AUTH_CHANNELS = [
  'auth:login',
  'auth:logout',
  'auth:changePassword',
  'auth:getCurrentUser',
  'auth:users:list',
  'auth:users:get',
  'auth:users:create',
  'auth:users:update',
  'auth:users:delete',
] as const;

// License Channels
const LICENSE_CHANNELS = [
  'license:verify',
  'license:activate',
  'license:status',
] as const;

// Initialization Channels
const INIT_CHANNELS = [
  'system:initialize',
] as const;

// All valid channels
const ALL_CHANNELS = [
  ...INVENTORY_CHANNELS,
  ...SALES_CHANNELS,
  ...CRM_CHANNELS,
  ...HR_CHANNELS,
  ...SYSTEM_CHANNELS,
  ...AUTH_CHANNELS,
  ...LICENSE_CHANNELS,
  ...INIT_CHANNELS,
] as const;

export type IpcChannel = (typeof ALL_CHANNELS)[number];

// ============================================
// Result Types (matches .NET Result pattern)
// ============================================

export interface IpcError {
  code: string;
  message: string;
  type: 'Validation' | 'NotFound' | 'Conflict' | 'Internal' | 'Unauthorized';
}

export interface IpcResult<T = void> {
  isSuccess: boolean;
  value?: T;
  error?: IpcError;
  errors?: IpcError[];
}

// ============================================
// Event Types
// ============================================

export type EventCallback<T = unknown> = (event: Electron.IpcRendererEvent, data: T) => void;

// Event channels for real-time updates
const EVENT_CHANNELS = [
  'event:stock:updated',
  'event:order:statusChanged',
  'event:notification:new',
  'event:sync:completed',
] as const;

export type EventChannel = (typeof EVENT_CHANNELS)[number];

// ============================================
// API Interface
// ============================================

export interface ElectronAPI {
  /**
   * Invoke an IPC channel and wait for result
   */
  invoke: <T>(channel: IpcChannel, payload?: unknown) => Promise<IpcResult<T>>;

  /**
   * Subscribe to an event channel
   */
  on: <T>(channel: EventChannel, callback: EventCallback<T>) => void;

  /**
   * Unsubscribe from an event channel
   */
  off: <T>(channel: EventChannel, callback: EventCallback<T>) => void;

  /**
   * Send a one-way message (no response expected)
   */
  send: (channel: string, data?: unknown) => void;

  /**
   * Platform information
   */
  platform: NodeJS.Platform;

  /**
   * App version
   */
  version: string;
}

// ============================================
// Channel Validation
// ============================================

function isValidChannel(channel: string): channel is IpcChannel {
  return ALL_CHANNELS.includes(channel as IpcChannel);
}

function isValidEventChannel(channel: string): channel is EventChannel {
  return EVENT_CHANNELS.includes(channel as EventChannel);
}

// ============================================
// API Implementation
// ============================================

const electronAPI: ElectronAPI = {
  invoke: async <T>(channel: IpcChannel, payload?: unknown): Promise<IpcResult<T>> => {
    // Validate channel for security
    if (!isValidChannel(channel)) {
      return {
        isSuccess: false,
        error: {
          code: 'InvalidChannel',
          message: `Channel "${channel}" is not allowed`,
          type: 'Validation',
        },
      };
    }

    try {
      const result = await ipcRenderer.invoke(channel, payload);
      return result as IpcResult<T>;
    } catch (error) {
      return {
        isSuccess: false,
        error: {
          code: 'IpcError',
          message: error instanceof Error ? error.message : 'Unknown error',
          type: 'Internal',
        },
      };
    }
  },

  on: <T>(channel: EventChannel, callback: EventCallback<T>): void => {
    if (!isValidEventChannel(channel)) {
      console.warn(`Event channel "${channel}" is not allowed`);
      return;
    }
    ipcRenderer.on(channel, callback as EventCallback<unknown>);
  },

  off: <T>(channel: EventChannel, callback: EventCallback<T>): void => {
    if (!isValidEventChannel(channel)) {
      return;
    }
    ipcRenderer.removeListener(channel, callback as EventCallback<unknown>);
  },

  send: (channel: string, data?: unknown): void => {
    // Only allow specific send channels
    const allowedSendChannels = ['window:minimize', 'window:maximize', 'window:close'];
    if (allowedSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',
};

// ============================================
// Expose to Renderer
// ============================================

contextBridge.exposeInMainWorld('electron', electronAPI);

// Type declaration for renderer process
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
