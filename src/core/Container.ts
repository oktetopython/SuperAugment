/**
 * Lightweight Dependency Injection Container
 * 
 * Provides a simple IoC container for managing component dependencies
 * and improving testability and maintainability.
 */

export type Constructor<T = Record<string, never>> = new (...args: unknown[]) => T;
export type Factory<T> = () => T | Promise<T>;
export type ServiceIdentifier<T = unknown> = string | symbol | Constructor<T>;

interface ServiceRegistration<T = unknown> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

/**
 * Simple dependency injection container
 */
export class Container {
  private services = new Map<ServiceIdentifier, ServiceRegistration>();
  private static instance: Container;

  /**
   * Get the global container instance
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register a service with the container
   */
  register<T>(
    identifier: ServiceIdentifier<T>,
    factory: Factory<T>,
    options: { singleton?: boolean } = {}
  ): void {
    this.services.set(identifier, {
      factory,
      singleton: options.singleton ?? true,
    });
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    factory: Factory<T>
  ): void {
    this.register(identifier, factory, { singleton: true });
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    identifier: ServiceIdentifier<T>,
    factory: Factory<T>
  ): void {
    this.register(identifier, factory, { singleton: false });
  }

  /**
   * Register a class constructor
   */
  registerClass<T>(
    identifier: ServiceIdentifier<T>,
    constructor: Constructor<T>,
    options: { singleton?: boolean } = {}
  ): void {
    this.register(
      identifier,
      () => new constructor(),
      options
    );
  }

  /**
   * Register an instance
   */
  registerInstance<T>(
    identifier: ServiceIdentifier<T>,
    instance: T
  ): void {
    this.services.set(identifier, {
      factory: () => instance,
      singleton: true,
      instance,
    });
  }

  /**
   * Resolve a service from the container
   */
  async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    const registration = this.services.get(identifier) as ServiceRegistration<T>;
    
    if (!registration) {
      throw new Error(`Service not registered: ${String(identifier)}`);
    }

    // Return existing instance for singletons
    if (registration.singleton && registration.instance) {
      return registration.instance;
    }

    // Create new instance
    const instance = await registration.factory();

    // Store instance for singletons
    if (registration.singleton) {
      registration.instance = instance;
    }

    return instance;
  }

  /**
   * Check if a service is registered
   */
  has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  /**
   * Remove a service registration
   */
  unregister(identifier: ServiceIdentifier): void {
    this.services.delete(identifier);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * Get all registered service identifiers
   */
  getRegisteredServices(): ServiceIdentifier[] {
    return Array.from(this.services.keys());
  }
}

/**
 * Service identifiers for core services
 */
export const ServiceIdentifiers = {
  CONFIG_PROVIDER: Symbol('IConfigProvider'),
  FILE_SYSTEM_PROVIDER: Symbol('IFileSystemProvider'),
  ERROR_HANDLER: Symbol('IErrorHandler'),
  LOGGER: Symbol('ILogger'),
  CACHE_PROVIDER: Symbol('ICacheProvider'),
  PERFORMANCE_MONITOR: Symbol('IPerformanceMonitor'),
} as const;

/**
 * Global container instance
 */
export const container = Container.getInstance();
