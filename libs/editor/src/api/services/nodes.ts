import type Engine from '@tripwire/engine';
import type { Types } from '@tripwire/engine';

import { IService, TContext } from '../../types';

export default class NodesService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(nodeId: string, context: TContext) {
    const serializationContext = this.parseContext<Types.Serializer.TSerializationContext>(context.req.query);

    const node = this.engine.exportSerializedNode(nodeId, serializationContext);

    return node;
  }

  find(context: TContext) {
    const serializationContext = this.parseContext<Types.Serializer.TMultiSerializationContext>(context.req.query);

    const nodes = this.engine.exportSerializedNodes(serializationContext);

    return nodes;
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
