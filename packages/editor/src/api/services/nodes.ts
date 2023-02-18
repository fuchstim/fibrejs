import type Engine from '@fibrejs/engine';
import type { Types } from '@fibrejs/engine';

import { ERequestMethod, IService, TRequestContext } from '../../types';

type TNodesService = {
  [ERequestMethod.CREATE]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': Types.Serializer.TSerializedNode[] | Record<string, Types.Serializer.TSerializedNode> },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': Types.Serializer.TSerializedNode },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class NodesService implements IService<TNodesService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(nodeId: string, context: TRequestContext) {
    const serializationContext = this.parseContext<Types.Serializer.TSerializationContext>(context.req.query);

    const node = this.engine.exportSerializedNode(nodeId, serializationContext);

    return node;
  }

  find(context: TRequestContext) {
    if (context.req.query.batchGet === 'true') {
      const serializationContexts = this.parseContext<
        Record<string, { nodeId: string, context: Types.Serializer.TSerializationContext }>
      >(context.req.query);

      if (!serializationContexts) { return {}; }

      return Object
        .entries(serializationContexts)
        .reduce(
          (acc, [ key, { nodeId, context: serializationContext, }, ]) => ({
            ...acc,
            [key]: this.engine.exportSerializedNode(nodeId, serializationContext),
          }),
          {} as Record<string, Types.Serializer.TSerializedNode>
        );
    }

    const serializationContext = this.parseContext<Types.Serializer.TSerializationContext>(context.req.query);

    const nodes = this.engine.exportSerializedNodes(serializationContext);

    return nodes.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }

  private parseContext<TContext>(query: { context?: string }) {
    if (!query.context) { return; }

    const decoded = decodeURIComponent(query.context);

    try {
      return JSON.parse(decoded) as TContext;
    } catch {
      return;
    }
  }
}
