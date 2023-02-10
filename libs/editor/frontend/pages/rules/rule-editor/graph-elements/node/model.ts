import {
  NodeModel,
  NodeModelGenerics,
  BasePositionModelOptions,
  DeserializeEvent
} from '@projectstorm/react-diagrams';

import EditorPortModel, { EPortType } from '../port/model';
import { TRuleStageWithNode } from '../../_types';
import { Types } from '@tripwire/engine';
import client from '../../../../../common/client';

interface EditorNodeModelOptions {
  ruleStage: TRuleStageWithNode;
  onOptionsChange?: (updatedOptions: Types.Node.TNodeOptions) => void | Promise<void>,
}

interface EditorNodeModelGenerics extends NodeModelGenerics {
  OPTIONS: EditorNodeModelOptions & BasePositionModelOptions;
}

export default class EditorNodeModel extends NodeModel<EditorNodeModelGenerics> {
  protected ruleStage: TRuleStageWithNode;
  protected inputPorts: EditorPortModel[];
  protected outputPorts: EditorPortModel[];

  constructor({ ruleStage, onOptionsChange, }: EditorNodeModelOptions) {
    const wrappedOnOptionsChange = async (updatedOptions: Types.Node.TNodeOptions) => {
      await this.updateWithOptions(updatedOptions);
      onOptionsChange?.(updatedOptions);
    };

    super({
      id: ruleStage.id,
      type: 'editor-node',
      ruleStage,
      onOptionsChange: wrappedOnOptionsChange,
    });

    this.ruleStage = ruleStage;
    this.inputPorts = [];
    this.outputPorts = [];

    ruleStage.node.inputs.forEach(
      input => this.addPort(
        new EditorPortModel({ id: this.prefixPortId(input.id), portType: EPortType.INPUT, config: input, })
      )
    );

    ruleStage.node.outputs.forEach(
      output => this.addPort(
        new EditorPortModel({ id: this.prefixPortId(output.id), portType: EPortType.OUTPUT, config: output, })
      )
    );
  }

  private prefixPortId(portId: string) {
    return `${this.options.ruleStage.id}-${portId}`;
  }

  removePort(port: EditorPortModel): void {
    super.removePort(port);

    if (port.isInput) {
      this.inputPorts.splice(this.inputPorts.indexOf(port), 1);
    } else {
      this.outputPorts.splice(this.outputPorts.indexOf(port), 1);
    }
  }

  addPort(port: EditorPortModel): EditorPortModel {
    super.addPort(port);

    if (port.isInput) {
      if (this.inputPorts.indexOf(port) === -1) {
        this.inputPorts.push(port);
      }
    } else {
      if (this.outputPorts.indexOf(port) === -1) {
        this.outputPorts.push(port);
      }
    }

    return port;
  }

  getInputPort(portId: string) {
    return this.inputPorts.find(
      port => port.getID() === this.prefixPortId(portId)
    );
  }

  getInputPorts(): EditorPortModel[] {
    return this.inputPorts;
  }

  getOutputPort(portId: string) {
    return this.outputPorts.find(
      port => port.getID() === this.prefixPortId(portId)
    );
  }

  getOutputPorts(): EditorPortModel[] {
    return this.outputPorts;
  }

  doClone(lookupTable: object, clone: EditorNodeModel): void {
    clone.inputPorts = [];
    clone.outputPorts = [];
    super.doClone(lookupTable, clone);
  }

  deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.ruleStage = event.data.ruleStage;
    this.inputPorts = event.data.portsInOrder.map(
      (id: string) => this.getPortFromID(id) as EditorPortModel
    );
    this.outputPorts = event.data.portsOutOrder.map(
      (id: string) => this.getPortFromID(id) as EditorPortModel
    );
  }

  serialize() {
    return {
      ...super.serialize(),
      ruleStage: this.options.ruleStage,
      portsInOrder: this.inputPorts.map(p => p.getID()),
      portsOutOrder: this.outputPorts.map(p => p.getID()),
    };
  }

  async updateWithOptions(nodeOptions: Types.Node.TNodeOptions) {
    const updatedNode = await client.getNode(this.ruleStage.nodeId, nodeOptions);

    this.ruleStage.nodeOptions = nodeOptions;
    this.ruleStage.node = updatedNode;
  }
}
