import { ConsoleLogger, LogLevel, ProbabilitySampler } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SpanExporter, ConsoleSpanExporter, Tracer, BatchSpanProcessor } from '@opentelemetry/tracing';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { MeterProvider } from '@opentelemetry/metrics';

const newTracer = (exporter: SpanExporter): Tracer => {
  const provider = new NodeTracerProvider({
    logger: new ConsoleLogger(LogLevel.DEBUG),
    sampler: new ProbabilitySampler(0.6),
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register();
  return provider.getTracer('tracer');
}

/**
 * Creates a new tracer for recording traces through the food finder
 * @param pluginOptions PluginOptions plugin configuration
 */
export const newDefaultTracer = (): Tracer => {
  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    throw new Error('missing required environment variable PROJECT_ID');
  }
  return newTracer(new TraceExporter({projectId}));
};

/**
 * Creates a new tracer that exports spans to the terminal
 */
export const newTestTracer = (): Tracer => {
  return newTracer(new ConsoleSpanExporter());
}
