"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartService = void 0;
const common_1 = require("@nestjs/common");
let ChartService = class ChartService {
    generateTimeSeriesChart(options) {
        const { data, title, xAxis, yAxis } = options;
        return {
            type: 'timeSeries',
            title,
            xAxis: {
                type: 'time',
                title: xAxis || 'Time'
            },
            yAxis: {
                title: yAxis || 'Value'
            },
            series: this.transformTimeSeriesData(data)
        };
    }
    generatePerformanceChart(options) {
        const { data, title, metrics } = options;
        return {
            type: 'multiLine',
            title,
            xAxis: {
                type: 'time',
                title: 'Time'
            },
            yAxis: {
                title: 'Value'
            },
            series: this.transformMultiMetricData(data, metrics)
        };
    }
    generatePieChart(options) {
        const { data, title, categories } = options;
        return {
            type: 'pie',
            title,
            series: this.transformCategoryData(data, categories)
        };
    }
    generateBarChart(options) {
        const { data, title, xAxis, yAxis } = options;
        return {
            type: 'bar',
            title,
            xAxis: {
                title: xAxis || 'Category'
            },
            yAxis: {
                title: yAxis || 'Value'
            },
            series: this.transformBarData(data)
        };
    }
    transformTimeSeriesData(data) {
        return [{
                name: 'Events',
                data: data.map(item => ({
                    x: new Date(item.timestamp).getTime(),
                    y: item.value || item.count || 0
                }))
            }];
    }
    transformMultiMetricData(data, metrics = []) {
        return metrics.map(metric => ({
            name: metric,
            data: data.map(item => ({
                x: new Date(item.timestamp).getTime(),
                y: item.metrics?.[metric] || 0
            }))
        }));
    }
    transformCategoryData(data, categories = []) {
        const categoryTotals = categories.reduce((acc, category) => {
            acc[category] = data.reduce((sum, item) => item.type === category ? sum + (item.value || item.count || 0) : sum, 0);
            return acc;
        }, {});
        return Object.entries(categoryTotals).map(([name, value]) => ({
            name,
            value
        }));
    }
    transformBarData(data) {
        return [{
                name: 'Values',
                data: data.map(item => ({
                    x: item.category || item.name,
                    y: item.value || item.count || 0
                }))
            }];
    }
};
exports.ChartService = ChartService;
exports.ChartService = ChartService = __decorate([
    (0, common_1.Injectable)()
], ChartService);
//# sourceMappingURL=chart.service.js.map