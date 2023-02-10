import type Engine from '@tripwire/engine';
import type { Types } from '@tripwire/engine';

import { IService, TContext } from '../../types';

export default class NodesService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(nodeId: string, context: TContext) {
    const nodes = this.engine.exportSerializedNodes(
      this.parseNodeOptions(context.req.query)
    );

    return nodes.find(
      node => node.id === nodeId
    );
  }

  find(context: TContext) {
    const nodes = this.engine.exportSerializedNodes(
      this.parseNodeOptions(context.req.query)
    );

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
