import * as opentelemtry from '@opentelemetry/api';
import { ConsoleLogger, LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SpanExporter, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';

export interface PluginOptions {
  grpc?: boolean;
  express?: boolean;
}


const newTracer = (pluginOptions: PluginOptions, exporter: SpanExporter): opentelemtry.Tracer => {
  const plugins = {
    grpc: {
      enabled: pluginOptions.grpc,
      path: '@opentelemetry/plugin-grpc',
    },
  };
  const provider = new NodeTracerProvider({
    logger: new ConsoleLogger(LogLevel.DEBUG),
  });
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();
  return provider.getTracer('tracer');
}

/**
 * Creates a new tracer for recording traces through the food finder
 * @param pluginOptions PluginOptions plugin configuration
 */
export const newDefaultTracer = (pluginOptions: PluginOptions): opentelemtry.Tracer => {
  const projectId = process.env.PROJECT_ID;
  if (!projectId) {
    throw new Error('missing required environment variable PROJECT_ID');
  }
  return newTracer(pluginOptions, new TraceExporter({projectId}));
};

/**
 * Creates a new tracer that exports spans to the terminal
 */
export const newTestTracer = (): opentelemtry.Tracer => {
  return newTracer({}, new ConsoleSpanExporter());
}




