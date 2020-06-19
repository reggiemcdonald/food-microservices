import { MeterProvider,
  MetricExporter,
  Meter,
  ConsoleMetricExporter,
} from '@opentelemetry/metrics';
import { MetricExporter as CloudMonitoringMetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter'

const newMeterProvider = (exporter: MetricExporter): Meter => {
  return new MeterProvider({
    exporter,
    interval: 0,
  }).getMeter('food-finder-meter');
};

export const newDefaultMeterProvider = (): Meter  => {
  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    throw new Error('missing required environment variable PROJECT_ID');
  }
  const exporter: unknown = new CloudMonitoringMetricExporter({projectId});
  return newMeterProvider(exporter as MetricExporter);
};

export const newTestMeterProvider = (): Meter => {
  return newMeterProvider(new ConsoleMetricExporter());
};
