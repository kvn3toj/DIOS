"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios = require("axios");
let LoadBalancerService = class LoadBalancerService {
    constructor(configService) {
        this.configService = configService;
        this.endpoints = new Map();
    }
    async onModuleInit() {
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
                    }
                    catch (error) {
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
    async getEndpoint(serviceName) {
        const endpoints = this.endpoints.get(serviceName);
        if (!endpoints || endpoints.length === 0) {
            throw new Error(`No endpoints available for service: ${serviceName}`);
        }
        const healthyEndpoints = endpoints.filter(e => e.healthy);
        if (healthyEndpoints.length === 0) {
            throw new Error(`No healthy endpoints available for service: ${serviceName}`);
        }
        const strategy = this.configService.get('gateway.loadBalancing.strategy');
        let selectedEndpoint;
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
    async releaseEndpoint(serviceName, url) {
        const endpoints = this.endpoints.get(serviceName);
        if (endpoints) {
            const endpoint = endpoints.find(e => e.url === url);
            if (endpoint) {
                endpoint.activeConnections = Math.max(0, endpoint.activeConnections - 1);
            }
        }
    }
    roundRobin(endpoints) {
        const endpoint = endpoints.shift();
        endpoints.push(endpoint);
        return endpoint;
    }
    leastConnections(endpoints) {
        return endpoints.reduce((min, current) => current.activeConnections < min.activeConnections ? current : min);
    }
    random(endpoints) {
        const index = Math.floor(Math.random() * endpoints.length);
        return endpoints[index];
    }
    async addEndpoint(serviceName, url) {
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
    async removeEndpoint(serviceName, url) {
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
};
exports.LoadBalancerService = LoadBalancerService;
exports.LoadBalancerService = LoadBalancerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoadBalancerService);
//# sourceMappingURL=load-balancer.service.js.map