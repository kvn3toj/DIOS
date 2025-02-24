import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as axios from 'axios';

interface ServiceEndpoint {
  url: string;
  healthy: boolean;
  lastCheck: Date;
  failureCount: number;
  activeConnections: number;
}

@Injectable()
export class LoadBalancerService implements OnModuleInit {
  private endpoints: Map<string, ServiceEndpoint[]> = new Map();
  private healthCheckInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Initialize endpoints from configuration
    const services = this.configService.get('gateway.services');
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
      this.endpoints.set(serviceName, [{
        url: serviceConfig.url,
        healthy: true,
        lastCheck: new Date(),
        failureCount: 0,
        activeConnections: 0
      }]);
    }
  }

  async startHealthChecks() {
    const interval = this.configService.get('gateway.loadBalancing.healthCheck.interval');
    
    this.healthCheckInterval = setInterval(async () => {
      for (const [serviceName, endpoints] of this.endpoints.entries()) {
        for (const endpoint of endpoints) {
          try {
            await axios.get(`${endpoint.url}/health`);
            endpoint.healthy = true;
            endpoint.failureCount = 0;
            endpoint.lastCheck = new Date();
          } catch (error) {
            endpoint.failureCount++;
            if (endpoint.failureCount >= 3) {
              endpoint.healthy = false;
            }
            endpoint.lastCheck = new Date();
          }
        }
      }
    }, interval);
  }

  async getEndpoint(serviceName: string): Promise<string> {
    const endpoints = this.endpoints.get(serviceName);
    if (!endpoints || endpoints.length === 0) {
      throw new Error(`No endpoints available for service: ${serviceName}`);
    }

    const healthyEndpoints = endpoints.filter(e => e.healthy);
    if (healthyEndpoints.length === 0) {
      throw new Error(`No healthy endpoints available for service: ${serviceName}`);
    }

    const strategy = this.configService.get('gateway.loadBalancing.strategy');
    let selectedEndpoint: ServiceEndpoint;

    switch (strategy) {
      case 'round-robin':
        selectedEndpoint = this.roundRobin(healthyEndpoints);
        break;
      case 'least-connections':
        selectedEndpoint = this.leastConnections(healthyEndpoints);
        break;
      case 'random':
        selectedEndpoint = this.random(healthyEndpoints);
        break;
      default:
        selectedEndpoint = this.roundRobin(healthyEndpoints);
    }

    selectedEndpoint.activeConnections++;
    return selectedEndpoint.url;
  }

  async releaseEndpoint(serviceName: string, url: string) {
    const endpoints = this.endpoints.get(serviceName);
    if (endpoints) {
      const endpoint = endpoints.find(e => e.url === url);
      if (endpoint) {
        endpoint.activeConnections = Math.max(0, endpoint.activeConnections - 1);
      }
    }
  }

  private roundRobin(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    // Simple round-robin implementation
    const endpoint = endpoints.shift();
    endpoints.push(endpoint);
    return endpoint;
  }

  private leastConnections(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    // Select endpoint with fewest active connections
    return endpoints.reduce((min, current) => 
      current.activeConnections < min.activeConnections ? current : min
    );
  }

  private random(endpoints: ServiceEndpoint[]): ServiceEndpoint {
    // Random selection
    const index = Math.floor(Math.random() * endpoints.length);
    return endpoints[index];
  }

  async addEndpoint(serviceName: string, url: string) {
    const endpoints = this.endpoints.get(serviceName) || [];
    endpoints.push({
      url,
      healthy: true,
      lastCheck: new Date(),
      failureCount: 0,
      activeConnections: 0
    });
    this.endpoints.set(serviceName, endpoints);
  }

  async removeEndpoint(serviceName: string, url: string) {
    const endpoints = this.endpoints.get(serviceName);
    if (endpoints) {
      const index = endpoints.findIndex(e => e.url === url);
      if (index !== -1) {
        endpoints.splice(index, 1);
      }
    }
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
} 