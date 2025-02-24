interface ChartOptions {
    data: any[];
    title: string;
    xAxis?: string;
    yAxis?: string;
    metrics?: string[];
    categories?: string[];
}
export declare class ChartService {
    generateTimeSeriesChart(options: ChartOptions): {
        type: string;
        title: string;
        xAxis: {
            type: string;
            title: string;
        };
        yAxis: {
            title: string;
        };
        series: {
            name: string;
            data: {
                x: number;
                y: any;
            }[];
        }[];
    };
    generatePerformanceChart(options: ChartOptions): {
        type: string;
        title: string;
        xAxis: {
            type: string;
            title: string;
        };
        yAxis: {
            title: string;
        };
        series: {
            name: string;
            data: {
                x: number;
                y: any;
            }[];
        }[];
    };
    generatePieChart(options: ChartOptions): {
        type: string;
        title: string;
        series: {
            name: string;
            value: unknown;
        }[];
    };
    generateBarChart(options: ChartOptions): {
        type: string;
        title: string;
        xAxis: {
            title: string;
        };
        yAxis: {
            title: string;
        };
        series: {
            name: string;
            data: {
                x: any;
                y: any;
            }[];
        }[];
    };
    private transformTimeSeriesData;
    private transformMultiMetricData;
    private transformCategoryData;
    private transformBarData;
}
export {};
