import type Engine from '@tripwire/engine';
import type { Types } from '@tripwire/engine';

import { IService, TContext } from '../../types';

export default class NodesService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(nodeId: string, context: TContext) {
    const nodeOptions = this.parseNodeOptions(context.req.query);

    const node = this.engine.exportSerializedNode(nodeId, nodeOptions as Types.Node.TNodeOptions);

    return node;
  }

  find(context: TContext) {
    const nodeOptions = this.parseNodeOptions(context.req.query);

    const nodes = this.engine.exportSerializedNodes(nodeOptions);

    return nodes;
  }

  private parseNodeOptions(query: { nodeOptions?: string }): Types.Common.TKeyValue<string, Types.Node.TNodeOptions> | undefined {
    if (!query?.nodeOptions) { return; }

    const decoded = decodeURIComponent(query.nodeOptions);

    try {
      return JSON.parse(decoded);
    } catch {
      return;
    }
  }
}
