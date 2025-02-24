export declare class BusinessMetric {
    id: string;
    timestamp: Date;
    engagement: {
        dau: number;
        wau: number;
        mau: number;
        retention: {
            d1: number;
            d7: number;
            d30: number;
        };
    };
    monetization: {
        revenue: {
            daily: number;
            arpu: number;
            ltv: number;
        };
    };
    conversion: {
        rate: number;
        value: number;
    };
    metadata?: Record<string, any>;
}
