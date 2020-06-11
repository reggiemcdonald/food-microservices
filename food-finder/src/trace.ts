import * as opentelemtry from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';

export interface PluginOptions {
  grpc?: boolean;
  express?: boolean;
}

/**
 * Creates a new tracer for recording traces through the food finder
 * @param projectId string the GCP project ID
 * @param name string the name of the tracer 
 */
export const newDefaultTracer = (projectId: string, name: string, 
  pluginOptions: PluginOptions, exporter: SpanExporter): opentelemtry.Tracer => {
  const plugins = {
    grpc: {
      enabled: pluginOptions.grpc,
      path: '@opentelemetry/plugin-grpc',
    },
    express: {
      enabled: pluginOptions.express,
      path: '@opentelemetry/plugin-express',
    }
  }
  const provider = new NodeTracerProvider();
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();
  return provider.getTracer(name);
};

