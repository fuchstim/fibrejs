import type Engine from '@tripwire/engine';

import { IService } from '../../types';

export default class NodesService implements IService {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  get(nodeId: string) {
    const nodes = this.engine.exportSerializedNodes();

    return nodes.find(
      node => node.id === nodeId
    );
  }

  find() {
    const nodes = this.engine.exportSerializedNodes();

    return nodes;
  }
}
