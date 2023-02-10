import {
  NodeModel,
  NodeModelGenerics,
  BasePositionModelOptions,
  DeserializeEvent,
  NodeModelListener,
  BaseEntityEvent
} from '@projectstorm/react-diagrams';

import EditorPortModel, { EPortType } from '../port/model';
import { TRuleStageWithNode } from '../../_types';
import { Types } from '@tripwire/engine';
import client from '../../../../../common/client';

interface EditorNodeModelListener {
  onChange?: (event: BaseEntityEvent<EditorNodeModel>) => void;
}

interface EditorNodeModelOptions {
  ruleStage: TRuleStageWithNode;
  onOptionsChange?: (updatedOptions: Types.Node.TNodeOptions) => void | Promise<void>,
}

interface EditorNodeModelGenerics extends NodeModelGenerics {
  LISTENER: EditorNodeModelListener & NodeModelListener;
  OPTIONS: EditorNodeModelOptions & BasePositionModelOptions;
}

export default class EditorNodeModel extends NodeModel<EditorNodeModelGenerics> {
  protected ports: Types.Common.TKeyValue<string, EditorPortModel> = {};
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

    this.generatePortsFromNode(ruleStage.node);
  }

  private generatePortsFromNode(node: Types.Serializer.TSerializedNode) {
    this.removePorts(...Object.values(this.ports));

    this.addPorts(
      ...node.inputs.flatMap(config => this.generatePortsFromNodeInput(config)),
      ...node.outputs.flatMap(config => this.generatePortsFromNodeOutput(config))
    );
  }

  private generatePortsFromNodeInput(config: Types.Serializer.TSerializedNodeInputOutput): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id),
      portType: EPortType.INPUT,
      config,
    });

    return [ port, ];
  }

  private generatePortsFromNodeOutput(config: Types.Serializer.TSerializedNodeInputOutput): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id),
      portType: EPortType.OUTPUT,
      config,
    });

    return [ port, ];
  }

  private prefixPortId(portId: string) {
    return `${this.options.ruleStage.id}-${portId}`;
  }

  removePorts(...ports: EditorPortModel[]): void {
    ports.map(port => this.removePort(port));
  }

  removePort(port: EditorPortModel): void {
    Object
      .values(port.getLinks())
      .forEach(link => link.remove());

    super.removePort(port);

    if (port.isInput) {
      this.inputPorts.splice(this.inputPorts.indexOf(port), 1);
    } else {
      this.outputPorts.splice(this.outputPorts.indexOf(port), 1);
    }
  }

  addPorts(...ports: EditorPortModel[]): EditorPortModel[] {
    return ports.map(port => this.addPort(port));
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
    return this.getInputPorts()
      .find(port => port.getID() === this.prefixPortId(portId));
  }

  getInputPorts(): EditorPortModel[] {
    return Object
      .values(this.ports)
      .filter(
        port => port.getOptions().portType === EPortType.INPUT
      );
  }

  getOutputPort(portId: string) {
    return this.getOutputPorts()
      .find(port => port.getID() === this.prefixPortId(portId));
  }

  getOutputPorts(): EditorPortModel[] {
    return Object
      .values(this.ports)
      .filter(
        port => port.getOptions().portType === EPortType.OUTPUT
      );
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

    this.generatePortsFromNode(updatedNode);

    this.fireEvent({ entity: this, }, 'onChange');
  }
}
