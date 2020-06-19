import { MeterProvider, MetricExporter, Meter, CounterMetric, ConsoleMetricExporter, MetricDescriptor } from '@opentelemetry/metrics';
import { ValueRecorder } from '@opentelemetry/api';
import { MetricExporter as CloudMonitoringMetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter'

const newMeterProvider = (exporter: MetricExporter): Meter => {
  return new MeterProvider({
    exporter,
    interval: 6000,
  }).getMeter('food-finder-meter');
};

export const newDefaultMeterProvider = (): Meter  => {
  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    throw new Error('missing required environment variable PROJECT_ID');
  }
  const exporter: MetricExporter = new CloudMonitoringMetricExporter({projectId});
  return newMeterProvider(exporter);
};

export const newTestMeterProvider = (): Meter => {
  return newMeterProvider(new ConsoleMetricExporter());
};

