import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from './proxy.service';
import { MetricsService } from './metrics.service';
import { DiscoveryService } from './discovery.service';
import { LoadBalancerService } from './load-balancer.service';
import { TransformationService } from './transformation.service';
export declare class GatewayService implements OnModuleInit {
    private readonly configService;
    private readonly proxyService;
    private readonly metricsService;
    private readonly discoveryService;
    private readonly loadBalancerService;
    private readonly transformationService;
    private readonly cache;
    private readonly circuitBreakers;
    constructor(configService: ConfigService, proxyService: ProxyService, metricsService: MetricsService, discoveryService: DiscoveryService, loadBalancerService: LoadBalancerService, transformationService: TransformationService);
    onModuleInit(): Promise<void>;
    handleRequest(request: any): Promise<any>;
    private getServiceNameFromRequest;
    private getCacheKey;
}
