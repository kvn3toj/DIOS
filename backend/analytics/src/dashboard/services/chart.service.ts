import { Injectable } from '@nestjs/common';

interface ChartOptions {
  data: any[];
  title: string;
  xAxis?: string;
  yAxis?: string;
  metrics?: string[];
  categories?: string[];
}

@Injectable()
export class ChartService {
  generateTimeSeriesChart(options: ChartOptions) {
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

  generatePerformanceChart(options: ChartOptions) {
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

  generatePieChart(options: ChartOptions) {
    const { data, title, categories } = options;

    return {
      type: 'pie',
      title,
      series: this.transformCategoryData(data, categories)
    };
  }

  generateBarChart(options: ChartOptions) {
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

  private transformTimeSeriesData(data: any[]) {
    return [{
      name: 'Events',
      data: data.map(item => ({
        x: new Date(item.timestamp).getTime(),
        y: item.value || item.count || 0
      }))
    }];
  }

  private transformMultiMetricData(data: any[], metrics: string[] = []) {
    return metrics.map(metric => ({
      name: metric,
      data: data.map(item => ({
        x: new Date(item.timestamp).getTime(),
        y: item.metrics?.[metric] || 0
      }))
    }));
  }

  private transformCategoryData(data: any[], categories: string[] = []) {
    const categoryTotals = categories.reduce((acc, category) => {
      acc[category] = data.reduce((sum, item) => 
        item.type === category ? sum + (item.value || item.count || 0) : sum, 0);
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  }

  private transformBarData(data: any[]) {
    return [{
      name: 'Values',
      data: data.map(item => ({
        x: item.category || item.name,
        y: item.value || item.count || 0
      }))
    }];
  }
} 