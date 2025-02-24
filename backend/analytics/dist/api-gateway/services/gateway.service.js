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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const CircuitBreaker = require("opossum");
const NodeCache = require("node-cache");
const proxy_service_1 = require("./proxy.service");
const metrics_service_1 = require("./metrics.service");
const discovery_service_1 = require("./discovery.service");
const load_balancer_service_1 = require("./load-balancer.service");
const transformation_service_1 = require("./transformation.service");
let GatewayService = class GatewayService {
    constructor(configService, proxyService, metricsService, discoveryService, loadBalancerService, transformationService) {
        this.configService = configService;
        this.proxyService = proxyService;
        this.metricsService = metricsService;
        this.discoveryService = discoveryService;
        this.loadBalancerService = loadBalancerService;
        this.transformationService = transformationService;
        this.circuitBreakers = new Map();
        const cacheConfig = this.configService.get('gateway.cache');
        this.cache = new NodeCache({
            stdTTL: cacheConfig.ttl,
            maxKeys: cacheConfig.max
        });
    }
    async onModuleInit() {
        const services = this.configService.get('gateway.services');
        for (const [serviceName, serviceConfig] of Object.entries(services)) {
            const breaker = new CircuitBreaker(async (request) => {
                const endpoint = await this.loadBalancerService.getEndpoint(serviceName);
                return this.proxyService.forward(request, endpoint);
            }, {
                timeout: serviceConfig.timeout,
                errorThresholdPercentage: this.configService.get('gateway.circuitBreaker.failureThreshold'),
                resetTimeout: this.configService.get('gateway.circuitBreaker.resetTimeout')
            });
            breaker.on('open', () => {
                this.metricsService.recordCircuitBreakerState(serviceName, 'open');
            });
            breaker.on('halfOpen', () => {
                this.metricsService.recordCircuitBreakerState(serviceName, 'half-open');
            });
            breaker.on('close', () => {
                this.metricsService.recordCircuitBreakerState(serviceName, 'closed');
            });
            this.circuitBreakers.set(serviceName, breaker);
        }
        if (this.configService.get('gateway.discovery.enabled')) {
            await this.discoveryService.startDiscovery();
        }
        if (this.configService.get('gateway.loadBalancing.healthCheck.enabled')) {
            this.loadBalancerService.startHealthChecks();
        }
        if (this.configService.get('gateway.monitoring.metrics.enabled')) {
            this.metricsService.startCollection();
        }
    }
    async handleRequest(request) {
        const startTime = Date.now();
        const serviceName = this.getServiceNameFromRequest(request);
        const cacheKey = this.getCacheKey(request);
        try {
            if (this.configService.get('gateway.cache.enabled')) {
                const cachedResponse = this.cache.get(cacheKey);
                if (cachedResponse) {
                    this.metricsService.recordCacheHit(serviceName);
                    return cachedResponse;
                }
            }
            if (this.configService.get('gateway.transformation.request.enabled')) {
                request = await this.transformationService.transformRequest(request);
            }
            const breaker = this.circuitBreakers.get(serviceName);
            const response = await breaker.fire(request);
            if (this.configService.get('gateway.transformation.response.enabled')) {
                response.body = await this.transformationService.transformResponse(response.body);
            }
            if (this.configService.get('gateway.cache.enabled')) {
                this.cache.set(cacheKey, response);
            }
            const duration = Date.now() - startTime;
            this.metricsService.recordRequestMetrics(serviceName, duration, response.status);
            return response;
        }
        catch (error) {
            this.metricsService.recordError(serviceName, error);
            throw error;
        }
    }
    getServiceNameFromRequest(request) {
        const path = request.path.split('/')[1];
        return path || 'default';
    }
    getCacheKey(request) {
        return `${request.method}:${request.path}:${JSON.stringify(request.query)}`;
    }
};
exports.GatewayService = GatewayService;
exports.GatewayService = GatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof proxy_service_1.ProxyService !== "undefined" && proxy_service_1.ProxyService) === "function" ? _a : Object, typeof (_b = typeof metrics_service_1.MetricsService !== "undefined" && metrics_service_1.MetricsService) === "function" ? _b : Object, typeof (_c = typeof discovery_service_1.DiscoveryService !== "undefined" && discovery_service_1.DiscoveryService) === "function" ? _c : Object, load_balancer_service_1.LoadBalancerService, typeof (_d = typeof transformation_service_1.TransformationService !== "undefined" && transformation_service_1.TransformationService) === "function" ? _d : Object])
], GatewayService);
//# sourceMappingURL=gateway.service.js.map