import {
  BaseEvent,
  BasePositionModelOptions,
  DeserializeEvent,
  NodeModel,
  NodeModelGenerics,
  NodeModelListener
} from '@projectstorm/react-diagrams';

import EditorPortModel, { EPortType } from '../port/model';
import { TRuleStageWithNode } from '../../_types';
import { Types } from '@tripwire/engine';

import client from '../../../../../common/client';

interface OptionsUpdatedEvent extends BaseEvent {
  updatedOptions?: Types.Node.TNodeOptions
}

interface EditorNodeModelListener {
  nodeReloaded?: (event: BaseEvent) => void;
  optionsUpdated?: (event: OptionsUpdatedEvent) => void;
}

interface EditorNodeModelOptions {
  ruleStage: TRuleStageWithNode;
}

interface EditorNodeModelGenerics extends NodeModelGenerics {
  LISTENER: EditorNodeModelListener & NodeModelListener;
  OPTIONS: EditorNodeModelOptions & BasePositionModelOptions;
}

export default class EditorNodeModel extends NodeModel<EditorNodeModelGenerics> {
  protected override ports: Types.Common.TKeyValue<string, EditorPortModel> = {};
  protected ruleStage: TRuleStageWithNode;

  constructor({ ruleStage, }: EditorNodeModelOptions) {
    super({
      id: ruleStage.id,
      type: 'editor-node',
      ruleStage,
    });

    this.ruleStage = ruleStage;

    this.generatePortsFromNode(ruleStage.node);

    super.registerListener({
      optionsUpdated: event => this.handleOptionsUpdated(event),
    });
  }

  private generatePortsFromNode(node: Types.Serializer.TSerializedNode) {
    this.removePorts(...Object.values(this.ports));

    this.addPorts(
      ...node.inputs.flatMap(config => this.generatePortsFromNodeInput(config)),
      ...node.outputs.flatMap(config => this.generatePortsFromNodeOutput(config))
    );
  }

  private generatePortsFromNodeInput(config: Types.Serializer.TSerializedNodeInputOutput, level = 0): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id),
      portType: EPortType.INPUT,
      config,
      level,
    });

    return [ port, ];
  }

  private generatePortsFromNodeOutput(config: Types.Serializer.TSerializedNodeInputOutput, level = 0): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id),
      portType: EPortType.OUTPUT,
      config,
      level,
    });

    if (!config.type.isComplex) {
      return [ port, ];
    }

    const formatKey = (key: string) => {
      return [ key.slice(0, 1).toUpperCase(), key.slice(1), ]
        .join('')
        .replace(/([A-Z])/g, ' $1')
        .trim();
    };

    const fieldPorts = Object
      .entries(config.type.fields)
      .flatMap(
        ([ key, type, ]) => this.generatePortsFromNodeOutput(
          {
            id: [ config.id, key, ].join('.'),
            name: [ config.name, formatKey(key), ].join(' → '),
            type,
          },
          level + 1
        )
      );

    return [
      port,
      ...fieldPorts,
    ];
  }

  private prefixPortId(portId: string) {
    return `${this.options.ruleStage.id}-${portId}`;
  }

  removePorts(...ports: EditorPortModel[]): void {
    ports.map(port => this.removePort(port));
  }

  override removePort(port: EditorPortModel): void {
    Object
      .values(port.getLinks())
      .forEach(link => link.remove());

    super.removePort(port);
  }

  addPorts(...ports: EditorPortModel[]) {
    ports.forEach(
      port => super.addPort(port)
    );
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

  override doClone(lookupTable: object, clone: EditorNodeModel): void {
    super.doClone(lookupTable, clone);
  }

  override deserialize(event: DeserializeEvent<this>) {
    super.deserialize(event);
    this.options.ruleStage = event.data.ruleStage;
  }

  override serialize() {
    return {
      ...super.serialize(),
      ruleStage: this.options.ruleStage,
    };
  }

  async handleOptionsUpdated({ updatedOptions, }: OptionsUpdatedEvent) {
    if (!updatedOptions) { return;}

    const updatedNode = await client.getNode(this.ruleStage.nodeId, updatedOptions);

    this.ruleStage.nodeOptions = updatedOptions;
    this.ruleStage.node = updatedNode;

    this.generatePortsFromNode(updatedNode);

    this.fireEvent({}, 'nodeReloaded');
  }
}
