import {
  BaseEvent,
  BasePositionModelOptions,
  DeserializeEvent,
  NodeModel,
  NodeModelGenerics,
  NodeModelListener
} from '@projectstorm/react-diagrams';

import EditorPortModel, { EPortType } from '../port/model';
import { TPreviewValues, TRuleStageWithNode } from '../../_types';

import { Types } from '@tripwire/engine';

import client from '../../../../../common/client';
import { camelCaseToSentenceCase } from '../../_common';

interface OptionsUpdatedEvent extends BaseEvent {
  updatedOptions?: Types.Node.TNodeOptions
}

interface EditorNodeModelListener {
  nodeUpdated?: (event: BaseEvent) => void;
  optionsUpdated?: (event: OptionsUpdatedEvent) => void;
}

interface EditorNodeModelOptions {
  ruleStage: TRuleStageWithNode;
  previewValues?: TPreviewValues;
}

interface EditorNodeModelGenerics extends NodeModelGenerics {
  LISTENER: EditorNodeModelListener & NodeModelListener;
  OPTIONS: EditorNodeModelOptions & BasePositionModelOptions;
}

export default class EditorNodeModel extends NodeModel<EditorNodeModelGenerics> {
  protected override ports: Record<string, EditorPortModel> = {};
  protected ruleStage: TRuleStageWithNode;

  constructor({ ruleStage, previewValues, }: EditorNodeModelOptions) {
    super({
      id: ruleStage.id,
      type: 'editor-node',
      ruleStage,
      previewValues,
    });

    this.ruleStage = ruleStage;

    this.generatePortsFromNode(ruleStage.node);

    super.registerListener({
      optionsUpdated: event => this.handleOptionsUpdated(event),
    });
  }

  private generatePortsFromNode(node: Types.Serializer.TSerializedNode) {
    if (node.type !== Types.Node.ENodeType.ENTRY) {
      const oldInputPorts = this.getInputPorts();
      const newInputPorts = node.inputs.flatMap(config => this.generatePortsFromNodeInput(config));

      oldInputPorts.forEach(
        oldPort => {
          const newPort = newInputPorts.find(newPort => newPort.getID() === oldPort.getID());
          if (!newPort) { return; }

          Object
            .values(oldPort.getLinks())
            .forEach(link => {
              if (link.getSourcePort().canLinkToPort(newPort)) {
                link.setTargetPort(newPort);
              }
            });
        }
      );

      this.removePorts(...oldInputPorts);
      this.addPorts(...newInputPorts);
    }

    if (node.type !== Types.Node.ENodeType.EXIT) {
      const oldOutputPorts = this.getOutputPorts();
      const newOutputPorts = node.outputs.flatMap(config => this.generatePortsFromNodeOutput(config));

      oldOutputPorts.forEach(
        oldPort => {
          const newPort = newOutputPorts.find(newPort => newPort.getID() === oldPort.getID());
          if (!newPort) { return; }

          Object
            .values(oldPort.getLinks())
            .forEach(link => {
              if (newPort.canLinkToPort(link.getTargetPort() as EditorPortModel, true)) {
                link.setSourcePort(newPort);
              }
            });
        }
      );

      this.removePorts(...oldOutputPorts);
      this.addPorts(...newOutputPorts);
    }
  }

  private generatePortsFromNodeInput(config: Types.Serializer.TSerializedNodeInputOutput, level = 0): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id, EPortType.INPUT),
      portType: EPortType.INPUT,
      config,
      level,
    });

    return [ port, ];
  }

  private generatePortsFromNodeOutput(config: Types.Serializer.TSerializedNodeInputOutput, level = 0): EditorPortModel[] {
    const port = new EditorPortModel({
      id: this.prefixPortId(config.id, EPortType.OUTPUT),
      portType: EPortType.OUTPUT,
      config,
      level,
    });

    if (!config.type.isComplex) {
      return [ port, ];
    }

    const fieldPorts = Object
      .entries(config.type.fields)
      .flatMap(
        ([ key, type, ]) => this.generatePortsFromNodeOutput(
          {
            id: [ config.id, key, ].join('.'),
            name: [ config.name, camelCaseToSentenceCase(key), ].join(' → '),
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

  private prefixPortId(portId: string, portType: EPortType) {
    return `${this.options.ruleStage.id}-${portType}-${portId}`;
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
      .find(port => port.getID() === this.prefixPortId(portId, EPortType.INPUT));
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
      .find(port => port.getID() === this.prefixPortId(portId, EPortType.OUTPUT));
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
    if (!updatedOptions) { return; }

    const updatedNode = await client.getNode(
      this.ruleStage.nodeId,
      { nodeOptions: updatedOptions, ruleId: this.ruleStage.ruleId, }
    );

    this.ruleStage.nodeOptions = updatedOptions;
    this.ruleStage.node = updatedNode;

    this.generatePortsFromNode(updatedNode);

    this.fireEvent({}, 'nodeUpdated');
  }

  setPreviewValues(previewValues?: TPreviewValues) {
    this.options.previewValues = previewValues;

    this.fireEvent({}, 'nodeUpdated');
  }
}
