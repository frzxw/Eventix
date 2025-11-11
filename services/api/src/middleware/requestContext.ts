import { randomUUID } from "crypto";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fp from "fastify-plugin";

const plugin: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.addHook("onRequest", (request: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const headerTrace = request.headers["x-trace-id"];
    const traceId = typeof headerTrace === "string" && headerTrace.length > 0 ? headerTrace : randomUUID();
    request.headers["x-trace-id"] = traceId;
    (request as any).traceId = traceId;
    request.log = request.log.child({ traceId });
    done();
  });
};

export const requestContext = fp(plugin);
