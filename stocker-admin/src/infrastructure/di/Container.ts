/**
 * Dependency Injection Container
 * IoC container for managing dependencies
 */

import { ITenantRepository } from '../../core/domain/repositories/ITenantRepository';
import { TenantRepository } from '../api/repositories/TenantRepository';
import { CreateTenantUseCase } from '../../core/domain/usecases/tenant/CreateTenantUseCase';
import { ApiClient, apiClient } from '../api/ApiClient';

/**
 * Service identifiers for type-safe DI
 */
export const TYPES = {
  // Repositories
  TenantRepository: Symbol.for('TenantRepository'),
  UserRepository: Symbol.for('UserRepository'),
  PackageRepository: Symbol.for('PackageRepository'),
  
  // Use Cases
  CreateTenantUseCase: Symbol.for('CreateTenantUseCase'),
  UpdateTenantUseCase: Symbol.for('UpdateTenantUseCase'),
  DeleteTenantUseCase: Symbol.for('DeleteTenantUseCase'),
  GetTenantUseCase: Symbol.for('GetTenantUseCase'),
  
  // Services
  ApiClient: Symbol.for('ApiClient'),
  AuthService: Symbol.for('AuthService'),
  NotificationService: Symbol.for('NotificationService'),
  
  // Infrastructure
  Logger: Symbol.for('Logger'),
  Cache: Symbol.for('Cache'),
} as const;

/**
 * Simple IoC Container implementation
 */
class DIContainer {
  private services: Map<symbol, any> = new Map();
  private singletons: Map<symbol, any> = new Map();
  private factories: Map<symbol, () => any> = new Map();

  /**
   * Register a singleton service
   */
  registerSingleton<T>(identifier: symbol, service: T): void {
    this.singletons.set(identifier, service);
  }

  /**
   * Register a factory function
   */
  registerFactory<T>(identifier: symbol, factory: () => T): void {
    this.factories.set(identifier, factory);
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(identifier: symbol, ServiceClass: new (...args: any[]) => T): void {
    this.factories.set(identifier, () => {
      // Resolve constructor dependencies
      const dependencies = this.resolveDependencies(ServiceClass);
      return new ServiceClass(...dependencies);
    });
  }

  /**
   * Get a service from the container
   */
  get<T>(identifier: symbol): T {
    // Check singletons first
    if (this.singletons.has(identifier)) {
      return this.singletons.get(identifier);
    }

    // Check factories
    if (this.factories.has(identifier)) {
      const factory = this.factories.get(identifier)!;
      const instance = factory();
      
      // Cache singleton instances
      if (this.isSingleton(identifier)) {
        this.singletons.set(identifier, instance);
      }
      
      return instance;
    }

    throw new Error(`Service ${identifier.toString()} not found in container`);
  }

  /**
   * Check if a service is registered
   */
  has(identifier: symbol): boolean {
    return this.singletons.has(identifier) || this.factories.has(identifier);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
    this.factories.clear();
  }

  /**
   * Resolve constructor dependencies
   */
  private resolveDependencies(ServiceClass: any): any[] {
    // This is a simplified version. In production, you'd use reflect-metadata
    // to automatically resolve dependencies
    const paramTypes = Reflect.getMetadata('design:paramtypes', ServiceClass) || [];
    return paramTypes.map((type: any) => {
      // Try to resolve from container
      // This would need proper metadata configuration
      return null;
    });
  }

  /**
   * Check if service should be singleton
   */
  private isSingleton(identifier: symbol): boolean {
    // Define which services should be singletons
    const singletonServices = [
      TYPES.TenantRepository,
      TYPES.UserRepository,
      TYPES.ApiClient,
      TYPES.AuthService,
      TYPES.Logger,
      TYPES.Cache,
    ];
    
    return singletonServices.includes(identifier);
  }
}

// Create container instance
export const container = new DIContainer();

/**
 * Configure and bootstrap the container
 */
export function configureContainer(): void {
  // Register repositories
  container.registerSingleton<ITenantRepository>(
    TYPES.TenantRepository,
    new TenantRepository()
  );

  // Register API client
  container.registerSingleton<ApiClient>(
    TYPES.ApiClient,
    apiClient
  );

  // Register use cases
  container.registerFactory(
    TYPES.CreateTenantUseCase,
    () => new CreateTenantUseCase(container.get<ITenantRepository>(TYPES.TenantRepository))
  );

  // Add more registrations as needed...
}

/**
 * Service Locator pattern for easy access
 * (Use sparingly - prefer constructor injection)
 */
export class ServiceLocator {
  private static container = container;

  static get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier);
  }

  static getTenantRepository(): ITenantRepository {
    return this.get<ITenantRepository>(TYPES.TenantRepository);
  }

  static getCreateTenantUseCase(): CreateTenantUseCase {
    return this.get<CreateTenantUseCase>(TYPES.CreateTenantUseCase);
  }

  static getApiClient(): ApiClient {
    return this.get<ApiClient>(TYPES.ApiClient);
  }
}

/**
 * Decorator for dependency injection (simplified version)
 */
export function inject(identifier: symbol) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    // Store metadata for later resolution
    const existingTokens = Reflect.getMetadata('inject:tokens', target) || [];
    existingTokens[parameterIndex] = identifier;
    Reflect.defineMetadata('inject:tokens', existingTokens, target);
  };
}

/**
 * Hook for React components to use DI
 */
export function useService<T>(identifier: symbol): T {
  return container.get<T>(identifier);
}

// Initialize container on import
configureContainer();